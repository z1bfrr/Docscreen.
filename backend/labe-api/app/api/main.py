from fastapi import APIRouter

from app.api.routes import auth, tests, labs, bookings, lpg

api_router = APIRouter()
api_router.include_router(auth.router,     prefix="/auth",     tags=["auth"])
api_router.include_router(tests.router,    prefix="/tests",    tags=["tests"])
api_router.include_router(labs.router,     prefix="/labs",     tags=["labs"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(lpg.router,      prefix="/lpg",      tags=["lpg-monitor"])
