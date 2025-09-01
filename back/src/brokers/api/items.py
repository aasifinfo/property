"""Items API endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

# from src.models.function_types import CreateItemResponse, GetItemResponse
from src.models.supabase_types import CreateItemRequest
from src.documents.items.Item import Item
from src.documents.items.ItemFactory import ItemFactory
from src.documents.categories.Category import Category
from src.models.user_types import User
from src.apis.Db import Db
from src.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/items")
async def create_item(request: CreateItemRequest, user=Depends(get_current_user)):
    """Create a new item"""
    try:
        # Validate category if provided
        if request.category_id:
            try:
                category = Category(request.category_id)
                await category.load()
                if not category.validate_permissions(user.id):
                    raise HTTPException(
                        status_code=403,
                        detail="You don't have permission to add items to this category"
                    )
            except Exception as e:
                logger.error(f"Category validation failed: {e}")
                if "not found" in str(e).lower():
                    raise HTTPException(status_code=404, detail="Category not found")
                raise HTTPException(status_code=400, detail="Category validation failed")
        
        # Check user limits (free tier with max 10 items)
        user_obj = User(user.id)
        if not user_obj.is_paid():
            db = Db.get_instance()
            items_count = (
                db.collections["items"]
                .where("owner_uid", "==", user.id)
                .where("status", "==", "active")
                .count()
                .get()
            )
            
            if items_count and items_count[0][0].value >= 10:
                raise HTTPException(
                    status_code=429,
                    detail="Free tier limit reached. Please upgrade to create more items."
                )
        
        # Create new item
        item_factory = ItemFactory(user.id, request.category_id)
        item = await item_factory.create_item(
            name=request.name,
            description=request.description,
            category_id=request.category_id,
            tags=request.tags,
            metadata=request.metadata,
            owner_uid=user.id
        )
        
        # Log activity
        item.log_activity("created", user.id, {"source": "api_endpoint"})
        
        # Trigger post-creation logic (replaces Firebase trigger)
        await _handle_item_created(item)
        
        return {
            "success": True,
            "item_id": item.id,
            "message": "Item created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create item error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create item. Please try again later.")

@router.get("/items/{item_id}")
async def get_item(item_id: str, include_activities: bool = False, user=Depends(get_current_user)):
    """Get an item by ID"""
    try:
        item = Item(item_id)
        await item.load()
        
        # Check if user owns this item or has access
        if not item.validate_permissions(user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Log view activity
        item.log_activity("viewed", user.id, {"source": "api_endpoint"})
        
        response_data = {
            "success": True,
            "item": item.doc.model_dump(),
            "message": "Item retrieved successfully"
        }
        
        # Include activities if requested
        if include_activities:
            activities = item.get_activities(limit=20)
            response_data["activities"] = [
                activity.model_dump() for activity in activities
            ]
        
        return response_data
    except Exception as e:
        logger.error(f"Get item error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Item not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items", response_model=List[dict])
async def list_items(user=Depends(get_current_user)):
    """List all items for the authenticated user"""
    try:
        item_factory = ItemFactory(user.id, None)  # No default category needed for listing
        items = await item_factory.get_items_for_user(user.id)
        return [item.doc.model_dump() for item in items]
    except Exception as e:
        logger.error(f"List items error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/items/{item_id}")
async def update_item(item_id: str, updates: dict, user=Depends(get_current_user)):
    """Update an item"""
    try:
        item = Item(item_id)
        await item.load()
        
        # Check if user owns this item
        if item.doc.owner_uid != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Store old data for trigger logic
        old_data = item.doc.model_dump()
        
        await item.update(updates)
        
        # Trigger post-update logic (replaces Firebase trigger)
        await _handle_item_updated(item, old_data)
        
        return {"success": True, "message": "Item updated successfully"}
    except Exception as e:
        logger.error(f"Update item error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Item not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/items/{item_id}")
async def delete_item(item_id: str, user=Depends(get_current_user)):
    """Delete an item"""
    try:
        item = Item(item_id)
        await item.load()
        
        # Check if user owns this item
        if item.doc.owner_uid != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Trigger pre-deletion logic (replaces Firebase trigger)
        await _handle_item_deleted(item)
        
        await item.delete()
        return {"success": True, "message": "Item deleted successfully"}
    except Exception as e:
        logger.error(f"Delete item error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Item not found")
        raise HTTPException(status_code=400, detail=str(e))

# Example endpoint (replaces Firebase example_callable function)
@router.post("/example")
async def example_endpoint(request: dict, user=Depends(get_current_user)):
    """Example endpoint - replaces Firebase callable function"""
    try:
        # Get request data
        message = request.get("message", "Hello")
        
        logger.info(f"Example endpoint invoked by user {user.id} with message: {message}")
        
        return {
            "success": True,
            "echo": message,
            "userId": user.id,
            "timestamp": "2025-09-01T00:00:00Z"  # You can use datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Example endpoint failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred processing your request"
        )


async def _handle_item_created(item: Item):
    """Handle item creation logic (replaces Firebase trigger).
    
    Args:
        item: Created item instance
    """
    try:
        logger.info(f"Processing created item: {item.id}")
        
        # Update category item count
        if item.doc.categoryId:
            db = Db.get_instance()
            try:
                category_ref = db.collections["categories"].document(item.doc.categoryId)
                category_doc = category_ref.get()
                if category_doc.exists:
                    current_count = category_doc.to_dict().get("itemCount", 0)
                    category_ref.update({"itemCount": current_count + 1})
            except Exception as e:
                logger.warning(f"Failed to update category count: {e}")
        
        # Log system activity
        item.log_activity(
            action="system_processed",
            user_id="system",
            details={
                "trigger": "item_created_handler",
                "category_updated": item.doc.categoryId
            }
        )
        
        logger.info(f"Successfully processed created item: {item.id}")
        
    except Exception as e:
        logger.error(f"Error processing created item: {e}")


async def _handle_item_updated(item: Item, old_data: dict):
    """Handle item update logic (replaces Firebase trigger).
    
    Args:
        item: Updated item instance
        old_data: Previous item data
    """
    try:
        logger.info(f"Processing updated item: {item.id}")
        
        # Check what changed
        status_changed = old_data.get("status") != item.doc.status
        category_changed = old_data.get("categoryId") != item.doc.categoryId
        
        db = Db.get_instance()
        
        # Handle status change
        if status_changed:
            old_status = old_data.get("status")
            new_status = item.doc.status
            
            logger.info(f"Item {item.id} status changed from {old_status} to {new_status}")
            
            # Update counters based on status change
            if item.doc.categoryId:
                try:
                    category_ref = db.collections["categories"].document(item.doc.categoryId)
                    category_doc = category_ref.get()
                    if category_doc.exists:
                        current_active = category_doc.to_dict().get("activeItemCount", 0)
                        
                        if old_status == "active" and new_status != "active":
                            category_ref.update({"activeItemCount": max(0, current_active - 1)})
                        elif old_status != "active" and new_status == "active":
                            category_ref.update({"activeItemCount": current_active + 1})
                except Exception as e:
                    logger.warning(f"Failed to update category active count: {e}")
        
        # Handle category change
        if category_changed:
            old_category = old_data.get("categoryId")
            new_category = item.doc.categoryId
            
            logger.info(f"Item {item.id} moved from category {old_category} to {new_category}")
            
            # Update counters for both categories
            try:
                if old_category:
                    old_category_ref = db.collections["categories"].document(old_category)
                    old_category_doc = old_category_ref.get()
                    if old_category_doc.exists:
                        current_count = old_category_doc.to_dict().get("itemCount", 0)
                        old_category_ref.update({"itemCount": max(0, current_count - 1)})
                
                if new_category:
                    new_category_ref = db.collections["categories"].document(new_category)
                    new_category_doc = new_category_ref.get()
                    if new_category_doc.exists:
                        current_count = new_category_doc.to_dict().get("itemCount", 0)
                        new_category_ref.update({"itemCount": current_count + 1})
            except Exception as e:
                logger.warning(f"Failed to update category counts: {e}")
        
        # Log update activity
        item.log_activity(
            action="system_updated",
            user_id="system",
            details={
                "trigger": "item_updated_handler",
                "status_changed": status_changed,
                "category_changed": category_changed
            }
        )
        
        logger.info(f"Successfully processed updated item: {item.id}")
        
    except Exception as e:
        logger.error(f"Error processing updated item: {e}")


async def _handle_item_deleted(item: Item):
    """Handle item deletion logic (replaces Firebase trigger).
    
    Args:
        item: Item instance before deletion
    """
    try:
        logger.info(f"Processing deleted item: {item.id}")
        
        db = Db.get_instance()
        
        # Update category counter
        if item.doc.categoryId:
            try:
                category_ref = db.collections["categories"].document(item.doc.categoryId)
                category_doc = category_ref.get()
                if category_doc.exists:
                    category_data = category_doc.to_dict()
                    current_count = category_data.get("itemCount", 0)
                    current_active = category_data.get("activeItemCount", 0)
                    
                    updates = {"itemCount": max(0, current_count - 1)}
                    
                    if item.doc.status == "active":
                        updates["activeItemCount"] = max(0, current_active - 1)
                    
                    category_ref.update(updates)
            except Exception as e:
                logger.warning(f"Failed to update category counts: {e}")
        
        logger.info(f"Successfully processed deleted item: {item.id}")
        
    except Exception as e:
        logger.error(f"Error processing deleted item: {e}")