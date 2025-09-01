"""Authentication endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging

from src.apis.SupabaseClient import SupabaseClient
# from src.models.function_types import AuthResponse

router = APIRouter()
logger = logging.getLogger(__name__)

class SignUpRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None

class SignInRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def sign_up(request: SignUpRequest):
    """Sign up a new user"""
    try:
        client = SupabaseClient.get_instance()
        result = await client.sign_up(
            email=request.email,
            password=request.password,
            display_name=request.display_name
        )
        return {
            "success": True,
            "user": result.user,
            "session": result.session
        }
    except Exception as e:
        logger.error(f"Sign up error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin")
async def sign_in(request: SignInRequest):
    """Sign in a user"""
    try:
        client = SupabaseClient.get_instance()
        result = await client.sign_in(
            email=request.email,
            password=request.password
        )
        return {
            "success": True,
            "user": result.user,
            "session": result.session
        }
    except Exception as e:
        logger.error(f"Sign in error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signout")
async def sign_out():
    """Sign out a user"""
    try:
        client = SupabaseClient.get_instance()
        await client.sign_out()
        return {"success": True, "message": "Signed out successfully"}
    except Exception as e:
        logger.error(f"Sign out error: {e}")
        raise HTTPException(status_code=400, detail=str(e))