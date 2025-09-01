"""Pytest configuration and fixtures."""

import pytest
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

# Configure test environment for Supabase
os.environ["ENV"] = "test"
os.environ["SUPABASE_URL"] = os.getenv("SUPABASE_URL", "https://your-project-ref.supabase.co")
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
os.environ["SUPABASE_ANON_KEY"] = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")


@pytest.fixture(scope="session")
def supabase_client():
    """Initialize Supabase client for testing."""
    from src.apis.SupabaseClient import SupabaseClient
    
    client = SupabaseClient.get_instance()
    
    yield client
    
    # Cleanup - For tests, you might want to clean up test data
    # This depends on your test strategy (separate test database, cleanup procedures, etc.)
    pass


@pytest.fixture
def db(supabase_client):
    """Get test database instance."""
    from src.apis.Db import Db
    return Db.get_instance()


@pytest.fixture
def test_user_id():
    """Get a test user ID."""
    return "test-user-123"


@pytest.fixture
def test_user():
    """Get a mock test user object."""
    class MockUser:
        def __init__(self, user_id: str):
            self.id = user_id
            self.email = f"{user_id}@test.com"
    
    return MockUser("test-user-123")


@pytest.fixture
def authenticated_client():
    """Get an authenticated test client for FastAPI endpoints."""
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    # For testing, you would typically mock the authentication
    # This depends on your specific testing strategy
    return client


