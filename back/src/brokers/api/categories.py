"""Categories API endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from src.models.supabase_types import CreateCategoryRequest, CategoryResponse
from src.documents.categories.Category import Category
from src.documents.categories.CategoryFactory import CategoryFactory
from src.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(request: CreateCategoryRequest, user=Depends(get_current_user)):
    """Create a new category"""
    try:
        category_factory = CategoryFactory()
        category = await category_factory.create_category(
            name=request.name,
            description=request.description,
            parent_id=request.parent_id,
            display_order=request.display_order,
            owner_uid=user.id
        )
        
        return CategoryResponse(
            success=True,
            category_id=category.id,
            data=category.doc.model_dump(),
            message="Category created successfully"
        )
    except Exception as e:
        logger.error(f"Create category error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories/{category_id}")
async def get_category(category_id: str, user=Depends(get_current_user)):
    """Get a category by ID"""
    try:
        category = Category(category_id)
        await category.load()
        
        # Check if user owns this category or has access
        if category.doc.owner_uid != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "data": category.doc.model_dump()
        }
    except Exception as e:
        logger.error(f"Get category error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Category not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories")
async def list_categories(user=Depends(get_current_user)):
    """List all categories for the authenticated user"""
    try:
        category_factory = CategoryFactory()
        categories = await category_factory.get_categories_for_user(user.id)
        return {
            "success": True,
            "data": [category.doc.model_dump() for category in categories]
        }
    except Exception as e:
        logger.error(f"List categories error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/categories/{category_id}")
async def update_category(category_id: str, updates: dict, user=Depends(get_current_user)):
    """Update a category"""
    try:
        category = Category(category_id)
        await category.load()
        
        # Check if user owns this category
        if category.doc.owner_uid != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        await category.update(updates)
        return {"success": True, "message": "Category updated successfully"}
    except Exception as e:
        logger.error(f"Update category error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Category not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, user=Depends(get_current_user)):
    """Delete a category"""
    try:
        category = Category(category_id)
        await category.load()
        
        # Check if user owns this category
        if category.doc.owner_uid != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        await category.delete()
        return {"success": True, "message": "Category deleted successfully"}
    except Exception as e:
        logger.error(f"Delete category error: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Category not found")
        raise HTTPException(status_code=400, detail=str(e))