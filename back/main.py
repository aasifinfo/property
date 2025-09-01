"""
FastAPI backend entry point.
Supabase-based API server for Next.js frontend.
"""

import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Next.js Supabase API",
    description="FastAPI backend for Next.js + Supabase template",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from src.brokers.api.items import router as items_router
from src.brokers.api.auth import router as auth_router
from src.brokers.api.health import router as health_router
from src.brokers.api.categories import router as categories_router
from src.brokers.api.webhooks import router as webhooks_router

# Include routers
app.include_router(health_router, tags=["health"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(items_router, prefix="/api", tags=["items"])
app.include_router(categories_router, prefix="/api", tags=["categories"])
app.include_router(webhooks_router, prefix="/api", tags=["webhooks"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Next.js Supabase API is running", "version": "1.0.0"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

logger.info("FastAPI backend initialized successfully")