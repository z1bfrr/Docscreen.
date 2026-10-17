from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError

from app.core.database import async_session_maker
from app.core.config import settings
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Supabase signs its JWTs with the SUPABASE_JWT_SECRET using HS256
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=[settings.ALGORITHM],
            audience="authenticated"
        )
        supabase_id: str = payload.get("sub")
        email: str = payload.get("email")
        phone: str = payload.get("phone")
        
        if supabase_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Check if user exists by email (or phone in a real app, but let's stick to email for now)
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        # Auto-create the user in our local PostgreSQL database since they exist in Supabase!
        user = User(
            id=supabase_id, # Using Supabase UUID as our Primary Key
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name", "User"),
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user
