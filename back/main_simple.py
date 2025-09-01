"""
Simplified FastAPI backend for testing dashboard functionality.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Next.js Supabase API",
    description="Simplified FastAPI backend for Next.js + Supabase template",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Next.js Supabase API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api"}

@app.post("/api/test-function")
async def test_function(request: dict):
    """Test function endpoint for dashboard button"""
    message = request.get("message", "Hello from API!")
    return {
        "success": True,
        "echo": message,
        "timestamp": "2025-09-01T00:00:00Z"
    }

@app.get("/api/items")
async def list_items():
    """Mock items endpoint"""
    return [
        {"id": "1", "name": "Sample Item 1", "status": "active"},
        {"id": "2", "name": "Sample Item 2", "status": "active"}
    ]

@app.post("/api/upload-test")
async def upload_test():
    """Mock upload endpoint"""
    return {
        "success": True,
        "message": "Upload test successful",
        "file_id": "mock-file-123"
    }

if __name__ == "__main__":
    uvicorn.run("main_simple:app", host="0.0.0.0", port=8000, reload=True)

logger.info("Simplified FastAPI backend initialized successfully")