"""Health check endpoints."""

from fastapi import APIRouter
from datetime import datetime
import logging
from src.apis.Db import Db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        db = Db.get_instance()
        db_status = "healthy"
        
        try:
            # Perform a simple query to verify database connectivity
            test_collection = db.collections.get("_health_check")
            if hasattr(test_collection, 'limit'):
                test_collection.limit(1).get()
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_status = "unhealthy"
        
        # Prepare response
        response_data = {
            "status": "healthy" if db_status == "healthy" else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "nextjs-supabase-api",
            "version": "1.0.0",
            "services": {
                "database": db_status,
                "api": "healthy"
            }
        }
        
        logger.info(f"Health check: {response_data['status']}")
        return response_data
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@router.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {"message": "pong"}