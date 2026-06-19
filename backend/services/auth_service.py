from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User
from utils.security import hash_password, verify_password, create_access_token


def signup_user(db: Session, name: str, email: str, password: str, role: str):
    try:
        role = role.lower().strip()
        if role not in {"buyer", "seller"}:
            raise HTTPException(status_code=400, detail="Role must be buyer or seller")

        existing = db.query(User).filter(User.email == email.lower()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        password_hash = hash_password(password)

        user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password_hash=password_hash,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id), "role": user.role})
        return token, user

    except HTTPException:
        raise
    except Exception as e:
        print("SIGNUP ERROR:", repr(e))
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


def login_user(db: Session, email: str, password: str):
    try:
        user = db.query(User).filter(User.email == email.lower()).first()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token({"sub": str(user.id), "role": user.role})
        return token, user

    except HTTPException:
        raise
    except Exception as e:
        print("LOGIN ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")