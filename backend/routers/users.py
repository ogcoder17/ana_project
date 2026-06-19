from fastapi import APIRouter, Depends
from schemas.auth import UserOut
from utils.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user = Depends(get_current_user)):
    return current_user