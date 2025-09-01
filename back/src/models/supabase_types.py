"""Supabase table type definitions using Pydantic."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID


class BaseRecord(BaseModel):
    """Base record type for all Supabase tables."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime


class ItemRecord(BaseRecord):
    """Item table record type (matches Supabase schema)."""
    
    name: str
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    owner_uid: UUID  # Foreign key to auth.users
    status: str = "active"  # active, archived, deleted
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)


class CategoryRecord(BaseRecord):
    """Category table record type (matches Supabase schema)."""
    
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    owner_uid: UUID  # Foreign key to auth.users
    display_order: int = 0
    is_active: bool = True


class ItemActivityRecord(BaseRecord):
    """Item activity log record type (matches Supabase schema)."""
    
    item_id: UUID
    action: str  # created, updated, deleted, viewed, shared
    user_id: UUID
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    owner_uid: UUID  # For RLS


class ProfileRecord(BaseRecord):
    """User profile record type (matches Supabase profiles table)."""
    
    # id is UUID that matches auth.users.id
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    # Note: email comes from auth.users, not stored here


class UserSubscriptionRecord(BaseRecord):
    """User subscription record type."""
    
    user_id: UUID  # Foreign key to auth.users
    is_paid: bool = False
    subscription_status: str = "free"
    subscription_tier: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    owner_uid: UUID  # For RLS


# Request/Response models for API endpoints
class CreateItemRequest(BaseModel):
    """Request model for creating items."""
    
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UpdateItemRequest(BaseModel):
    """Request model for updating items."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class ItemResponse(BaseModel):
    """Response model for item operations."""
    
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    item_id: Optional[str] = None


class CreateCategoryRequest(BaseModel):
    """Request model for creating categories."""
    
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    parent_id: Optional[str] = None
    display_order: int = 0


class CategoryResponse(BaseModel):
    """Response model for category operations."""
    
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    category_id: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    """Request model for updating user profiles."""
    
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    """Response model for profile operations."""
    
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


# Legacy compatibility - map old names to new names
BaseDoc = BaseRecord
ItemDoc = ItemRecord
CategoryDoc = CategoryRecord
ItemActivityDoc = ItemActivityRecord
UserDoc = ProfileRecord