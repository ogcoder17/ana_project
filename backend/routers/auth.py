from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from utils.deps import get_db, get_current_user
from schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    TokenResponse,
    CurrentUserResponse,
)
from services.auth_service import signup_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserSignupRequest, db: Session = Depends(get_db)):
    token, user = signup_user(
        db=db,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    token, user = login_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user=Depends(get_current_user)):
    return {"user": serialize_user(current_user)}