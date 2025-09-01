"""Project database class with Supabase operations."""

import os
import json
import logging
from typing import Type, Dict, Any, Optional, List
from datetime import datetime, timedelta, timezone
from abc import ABC
from src.apis.SupabaseClient import SupabaseClient


class SupabaseTable:
    """Supabase table wrapper to provide Firestore-like interface."""
    
    def __init__(self, table_name: str, client: SupabaseClient, parent_filter: Optional[Dict] = None):
        self.table_name = table_name
        self.client = client
        self.parent_filter = parent_filter or {}
        
    def document(self, doc_id: Optional[str] = None):
        """Get a document reference (Supabase row)."""
        return SupabaseDocument(self.table_name, doc_id, self.client, self.parent_filter)
    
    def where(self, field: str, op: str, value: Any):
        """Add a where clause (returns new table instance with filter)."""
        new_filter = self.parent_filter.copy()
        if op == "==":
            new_filter[field] = value
        # For now, only support equality - can extend later
        return SupabaseTable(self.table_name, self.client, new_filter)
    
    def order_by(self, field: str, direction: str = "asc"):
        """Add ordering (returns new table instance)."""
        # Store ordering info for later use
        table_copy = SupabaseTable(self.table_name, self.client, self.parent_filter)
        table_copy._order_by = (field, direction.lower())
        return table_copy
    
    def limit(self, count: int):
        """Add limit (returns new table instance)."""
        table_copy = SupabaseTable(self.table_name, self.client, self.parent_filter)
        if hasattr(self, '_order_by'):
            table_copy._order_by = self._order_by
        table_copy._limit = count
        return table_copy
    
    def count(self):
        """Get count of matching records."""
        # Return a simple count query object
        return SupabaseCountQuery(self.table_name, self.client, self.parent_filter)
    
    def get(self):
        """Execute the query and get results."""
        try:
            query = self.client.client.table(self.table_name).select("*")
            
            # Apply filters
            for key, value in self.parent_filter.items():
                query = query.eq(key, value)
            
            # Apply ordering
            if hasattr(self, '_order_by'):
                field, direction = self._order_by
                ascending = direction == "asc"
                query = query.order(field, desc=not ascending)
            
            # Apply limit
            if hasattr(self, '_limit'):
                query = query.limit(self._limit)
            
            result = query.execute()
            return [SupabaseDocumentSnapshot(doc, self.table_name) for doc in (result.data or [])]
            
        except Exception as e:
            self.client.logger.error(f"Query error on {self.table_name}: {e}")
            raise


class SupabaseDocument:
    """Supabase document wrapper to provide Firestore-like interface."""
    
    def __init__(self, table_name: str, doc_id: Optional[str], client: SupabaseClient, parent_filter: Optional[Dict] = None):
        self.table_name = table_name
        self.doc_id = doc_id
        self.client = client
        self.parent_filter = parent_filter or {}
        if not self.doc_id:
            # Generate a new ID for new documents
            import uuid
            self.doc_id = str(uuid.uuid4())
    
    @property
    def id(self) -> str:
        return self.doc_id
    
    def set(self, data: Dict[str, Any]):
        """Set document data (insert or upsert)."""
        try:
            # Add parent filter data and document ID
            full_data = {**self.parent_filter, **data, "id": self.doc_id}
            
            # Use upsert to handle both insert and update
            result = self.client.client.table(self.table_name).upsert(full_data).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            self.client.logger.error(f"Set document error on {self.table_name}: {e}")
            raise
    
    def update(self, data: Dict[str, Any]):
        """Update document data."""
        try:
            # Add updated timestamp
            update_data = {**data, "updated_at": datetime.now(timezone.utc).isoformat()}
            
            query = self.client.client.table(self.table_name).update(update_data).eq("id", self.doc_id)
            
            # Apply parent filters
            for key, value in self.parent_filter.items():
                query = query.eq(key, value)
            
            result = query.execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            self.client.logger.error(f"Update document error on {self.table_name}: {e}")
            raise
    
    def get(self):
        """Get document data."""
        try:
            query = self.client.client.table(self.table_name).select("*").eq("id", self.doc_id)
            
            # Apply parent filters
            for key, value in self.parent_filter.items():
                query = query.eq(key, value)
            
            result = query.execute()
            doc_data = result.data[0] if result.data else None
            
            return SupabaseDocumentSnapshot(doc_data, self.table_name, self.doc_id)
            
        except Exception as e:
            self.client.logger.error(f"Get document error on {self.table_name}: {e}")
            raise
    
    def delete(self):
        """Delete the document."""
        try:
            query = self.client.client.table(self.table_name).delete().eq("id", self.doc_id)
            
            # Apply parent filters
            for key, value in self.parent_filter.items():
                query = query.eq(key, value)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            self.client.logger.error(f"Delete document error on {self.table_name}: {e}")
            raise


class SupabaseDocumentSnapshot:
    """Supabase document snapshot to provide Firestore-like interface."""
    
    def __init__(self, data: Optional[Dict], table_name: str, doc_id: Optional[str] = None):
        self._data = data
        self.table_name = table_name
        self._id = doc_id or (data.get("id") if data else None)
    
    @property
    def id(self) -> Optional[str]:
        return self._id
    
    @property
    def exists(self) -> bool:
        return self._data is not None
    
    def to_dict(self) -> Dict[str, Any]:
        return self._data or {}
    
    @property
    def reference(self):
        """Get document reference for this snapshot."""
        # Return a mock reference object that has delete method
        class DocumentReference:
            def __init__(self, doc_snapshot):
                self._snapshot = doc_snapshot
            
            def delete(self):
                # This would need access to the client to perform actual deletion
                # For now, this is a placeholder
                pass
        
        return DocumentReference(self)


class SupabaseCountQuery:
    """Handle count queries for Supabase."""
    
    def __init__(self, table_name: str, client: SupabaseClient, filters: Dict):
        self.table_name = table_name
        self.client = client
        self.filters = filters
    
    def get(self):
        """Execute count query."""
        try:
            # Supabase doesn't have a direct count method, so we'll select just the ID column and count
            query = self.client.client.table(self.table_name).select("id", count="exact")
            
            for key, value in self.filters.items():
                query = query.eq(key, value)
            
            result = query.execute()
            count = result.count if hasattr(result, 'count') else len(result.data or [])
            
            # Return in Firestore-like format: list with count result
            return [[type('CountResult', (), {'value': count})()]]
            
        except Exception as e:
            self.client.logger.error(f"Count query error on {self.table_name}: {e}")
            raise


class Db(ABC):
    """Database operations base class.

    This class provides the base singleton pattern and common database functionality.
    Uses Supabase as the backend database.
    """
    _instance: Optional['Db'] = None
    _supabase_client: Optional[SupabaseClient] = None

    collections: Dict[str, Any] = {}

    def __new__(cls):
        """Ensure only one instance exists"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the database - only runs once due to singleton"""
        # Skip initialization if already done for this instance
        if hasattr(self, "_initialized"):
            return

        self._init_supabase()
        self._init_collections()
        self._initialized = True

    def _init_supabase(self):
        """Initialize Supabase client and base configuration."""
        self._supabase_client = SupabaseClient.get_instance()
        self.logger = logging.getLogger("supabase-api")
        self.logger.info("Supabase client initialized")

    def _init_collections(self):
        """Initialize collection references (table mappings for Supabase)."""
        self.collections = {
            # Base tables that all projects need
            "users": SupabaseTable("users", self._supabase_client),
            
            # Project-specific tables
            "items": SupabaseTable("items", self._supabase_client),
            "categories": SupabaseTable("categories", self._supabase_client),
            "itemActivities": lambda item_id: SupabaseTable("item_activities", self._supabase_client, parent_filter={"item_id": item_id}),
            
            # Add more tables as needed
        }

    @classmethod
    def get_instance(cls):
        """Get or create the singleton instance for this class"""
        return cls()

    # Storage functions (using Supabase Storage)
    async def get_file_url(self, bucket: str, file_path: str):
        """Get a signed URL for a file in Supabase storage"""
        try:
            return await self._supabase_client.create_signed_url(bucket, file_path, expires_in=900)  # 15 minutes
        except Exception as e:
            self.logger.error(f"Get file URL error: {e}")
            raise

    async def get_public_url(self, bucket: str, file_path: str):
        """Get a public URL for a file in Supabase storage"""
        try:
            return await self._supabase_client.get_public_url(bucket, file_path)
        except Exception as e:
            self.logger.error(f"Get public URL error: {e}")
            raise

    async def upload_file(self, bucket: str, local_path: str, destination: str):
        """Upload a file from local path to Supabase storage"""
        try:
            with open(local_path, 'rb') as file:
                buffer = file.read()
            return await self._supabase_client.upload_file(bucket, destination, buffer)
        except Exception as e:
            self.logger.error(f"Upload file error: {e}")
            raise

    async def upload_file_buffer(self, bucket: str, buffer: bytes, destination: str, content_type: Optional[str] = None):
        """Upload a file buffer to Supabase storage"""
        try:
            return await self._supabase_client.upload_file(bucket, destination, buffer, content_type)
        except Exception as e:
            self.logger.error(f"Upload file buffer error: {e}")
            raise

    async def download_file(self, bucket: str, file_path: str, destination: str):
        """Download a file from Supabase storage to local path"""
        try:
            buffer = await self._supabase_client.download_file(bucket, file_path)
            with open(destination, 'wb') as file:
                file.write(buffer)
        except Exception as e:
            self.logger.error(f"Download file error: {e}")
            raise

    async def get_file_buffer(self, bucket: str, file_path: str):
        """Get file content as bytes buffer"""
        try:
            return await self._supabase_client.download_file(bucket, file_path)
        except Exception as e:
            self.logger.error(f"Get file buffer error: {e}")
            raise

    async def delete_file(self, bucket: str, file_path: str):
        """Delete a file from Supabase storage"""
        try:
            return await self._supabase_client.delete_file(bucket, file_path)
        except Exception as e:
            self.logger.error(f"Delete file error: {e}")
            raise

    def remove_folder_files(self, folder_path: str):
        """Remove files from a folder (placeholder for compatibility)"""
        # This would need to be implemented based on your storage structure
        # For now, just log the request
        self.logger.info(f"Remove folder files requested for: {folder_path}")
        # TODO: Implement based on specific storage needs
        pass

    # Utility functions
    @staticmethod
    def is_production():
        """Check if running in production environment"""
        return os.getenv("ENV") == "production"

    @staticmethod
    def is_development():
        """Check if running in development environment"""
        return os.getenv("ENV") == "development"

    # Timestamp functions
    @staticmethod
    def get_expires_at(days=0, hours=0, minutes=0, seconds=0):
        """Get expiration timestamp"""
        created_at = Db.get_created_at()
        expires_at_date = created_at + timedelta(
            days=days, hours=hours, minutes=minutes, seconds=seconds
        )
        return expires_at_date

    @staticmethod
    def timestamp_now():
        """Get current timestamp"""
        return datetime.now(timezone.utc)

    @staticmethod
    def get_timestamp_from_date(date):
        """Convert date to timestamp"""
        return date

    @staticmethod
    def get_date_from_timestamp(timestamp):
        """Convert timestamp to date"""
        if hasattr(timestamp, 'to_pydatetime'):
            return timestamp.to_pydatetime()
        return timestamp

    @staticmethod
    def get_created_at():
        """Get creation timestamp"""
        return datetime.now(timezone.utc)


