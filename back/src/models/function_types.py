"""Function request and response type definitions."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class CreateItemRequest(BaseModel):
    """Request structure for create_item_callable."""
    name: str
    description: Optional[str] = None
    categoryId: str
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class CreateItemResponse(BaseModel):
    """Response structure for create_item_callable."""
    success: bool
    item_id: Optional[str] = None
    message: Optional[str] = None


class GetItemRequest(BaseModel):
    """Request structure for get_item_callable."""
    itemId: str
    includeActivities: Optional[bool] = False


class GetItemResponse(BaseModel):
    """Response structure for get_item_callable."""
    success: bool
    item: Optional[Dict[str, Any]] = None
    activities: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None


class AuthResponse(BaseModel):
    """Response structure for authentication endpoints."""
    success: bool
    user: Optional[Dict[str, Any]] = None
    session: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class WebhookPayload(BaseModel):
    """Webhook payload structure."""
    event: str
    data: Dict[str, Any]
    timestamp: str
    signature: Optional[str] = None