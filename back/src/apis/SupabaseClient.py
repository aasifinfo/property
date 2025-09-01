"""Supabase client wrapper for database operations."""

import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from abc import ABC

class SupabaseClient(ABC):
    """Supabase client operations base class.
    
    This class provides the base singleton pattern and common database functionality.
    """
    _instance: Optional['SupabaseClient'] = None
    _supabase_client: Optional[Client] = None
    
    def __new__(cls):
        """Ensure only one instance exists"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the Supabase client - only runs once due to singleton"""
        if hasattr(self, "_initialized"):
            return
            
        self._init_supabase()
        self._initialized = True

    def _init_supabase(self):
        """Initialize Supabase client."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY must be set")
        
        self._supabase_client = create_client(url, key)
        self.logger = logging.getLogger("supabase-client")
        self.logger.info("Supabase client initialized")

    @classmethod
    def get_instance(cls):
        """Get or create the singleton instance"""
        return cls()

    @property
    def client(self) -> Client:
        """Get the Supabase client"""
        if self._supabase_client is None:
            raise ValueError("Supabase client not initialized")
        return self._supabase_client

    # Database operations
    async def select(self, table: str, columns: str = "*", filters: Optional[Dict] = None) -> List[Dict]:
        """Select records from a table"""
        try:
            query = self.client.table(table).select(columns)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return result.data or []
        except Exception as e:
            self.logger.error(f"Select error from {table}: {e}")
            raise

    async def insert(self, table: str, data: Dict) -> Dict:
        """Insert a record into a table"""
        try:
            # Add timestamps
            now = datetime.now(timezone.utc).isoformat()
            data["created_at"] = now
            data["updated_at"] = now
            
            result = self.client.table(table).insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self.logger.error(f"Insert error into {table}: {e}")
            raise

    async def update(self, table: str, data: Dict, filters: Dict) -> Dict:
        """Update records in a table"""
        try:
            # Add timestamp
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            query = self.client.table(table).update(data)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            result = query.execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self.logger.error(f"Update error in {table}: {e}")
            raise

    async def delete(self, table: str, filters: Dict) -> bool:
        """Delete records from a table"""
        try:
            query = self.client.table(table).delete()
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            result = query.execute()
            return True
        except Exception as e:
            self.logger.error(f"Delete error from {table}: {e}")
            raise

    async def get_by_id(self, table: str, id: str, id_column: str = "id") -> Optional[Dict]:
        """Get a single record by ID"""
        try:
            result = self.client.table(table).select("*").eq(id_column, id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            self.logger.error(f"Get by ID error from {table}: {e}")
            raise

    # Authentication operations
    async def sign_up(self, email: str, password: str, display_name: Optional[str] = None):
        """Sign up a new user"""
        try:
            user_data = {}
            if display_name:
                user_data["display_name"] = display_name
            
            result = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": user_data} if user_data else None
            })
            return result
        except Exception as e:
            self.logger.error(f"Sign up error: {e}")
            raise

    async def sign_in(self, email: str, password: str):
        """Sign in a user"""
        try:
            result = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return result
        except Exception as e:
            self.logger.error(f"Sign in error: {e}")
            raise

    async def sign_out(self):
        """Sign out the current user"""
        try:
            result = self.client.auth.sign_out()
            return result
        except Exception as e:
            self.logger.error(f"Sign out error: {e}")
            raise

    async def get_user(self, token: str):
        """Get user from JWT token"""
        try:
            result = self.client.auth.get_user(token)
            return result.user if result else None
        except Exception as e:
            self.logger.error(f"Get user error: {e}")
            raise

    # Storage operations
    async def upload_file(self, bucket: str, path: str, file_data: bytes, content_type: Optional[str] = None):
        """Upload a file to storage"""
        try:
            options = {}
            if content_type:
                options["content_type"] = content_type
            
            result = self.client.storage.from_(bucket).upload(path, file_data, options)
            return result
        except Exception as e:
            self.logger.error(f"Upload file error: {e}")
            raise

    async def download_file(self, bucket: str, path: str) -> bytes:
        """Download a file from storage"""
        try:
            result = self.client.storage.from_(bucket).download(path)
            return result
        except Exception as e:
            self.logger.error(f"Download file error: {e}")
            raise

    async def delete_file(self, bucket: str, path: str):
        """Delete a file from storage"""
        try:
            result = self.client.storage.from_(bucket).remove([path])
            return result
        except Exception as e:
            self.logger.error(f"Delete file error: {e}")
            raise

    async def get_public_url(self, bucket: str, path: str) -> str:
        """Get public URL for a file"""
        try:
            result = self.client.storage.from_(bucket).get_public_url(path)
            return result
        except Exception as e:
            self.logger.error(f"Get public URL error: {e}")
            raise

    async def create_signed_url(self, bucket: str, path: str, expires_in: int = 3600) -> str:
        """Create a signed URL for a file"""
        try:
            result = self.client.storage.from_(bucket).create_signed_url(path, expires_in)
            return result
        except Exception as e:
            self.logger.error(f"Create signed URL error: {e}")
            raise

    # Utility methods
    @staticmethod
    def is_production():
        """Check if running in production environment"""
        return os.getenv("ENV") == "production"

    @staticmethod
    def is_development():
        """Check if running in development environment"""
        return os.getenv("ENV") == "development"

    @staticmethod
    def timestamp_now():
        """Get current timestamp"""
        return datetime.now(timezone.utc)

    @staticmethod
    def get_created_at():
        """Get creation timestamp"""
        return datetime.now(timezone.utc)