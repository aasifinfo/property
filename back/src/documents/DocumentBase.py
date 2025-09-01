"""Document base class for Supabase operations."""

from datetime import datetime, timezone
from typing import Type, Optional, TypeVar, Generic, Dict
import logging
import uuid
from src.apis.SupabaseClient import SupabaseClient
from src.models.supabase_types import BaseDoc

DocLike = TypeVar('DocLike', bound=BaseDoc)


def remove_none_values(d):
    """Recursively remove None values from dictionaries."""
    if isinstance(d, dict):
        return {k: remove_none_values(v) for k, v in d.items() if v is not None}
    elif isinstance(d, list):
        return [remove_none_values(v) for v in d if v is not None]
    else:
        return d


def ignore_none(func):
    """Decorator to remove None values from the data argument."""

    def wrapper(*args, **kwargs):
        if 'data' in kwargs:
            kwargs['data'] = remove_none_values(kwargs['data'])
        return func(*args, **kwargs)

    return wrapper


class DocumentBase(Generic[DocLike]):
    table_name: str = None  # type: ignore
    _doc: Optional[DocLike] = None
    _client: Optional[SupabaseClient] = None
    pydantic_model: Type[DocLike] = None  # type: ignore

    @property
    def client(self) -> SupabaseClient:
        if self._client is None:
            self._client = SupabaseClient.get_instance()
        return self._client

    def __init__(self, id: Optional[str] = None, doc: dict | None = None):
        """
        Initialize the document.
        :param id: Id of the document, if id and doc are None, a new id will be created.
        """
        self.id = id or str(uuid.uuid4())
        self.debug = SupabaseClient.is_development()
        self.default_error = Exception("Error. Please contact support.")

        if not doc:
            # Document will be loaded later with load() method
            self._doc = None
        else:
            self._doc = self.pydantic_model(**doc)

    async def load(self):
        """Load the document from the database"""
        if not self.pydantic_model:
            raise ValueError("You forgot to set pydantic_model.")
        if not self.table_name:
            raise ValueError("You forgot to set table_name.")
        if not self.id:
            raise ValueError("Document ID is required to load.")

        doc_data = await self.client.get_by_id(self.table_name, self.id)
        
        if not doc_data:
            raise ValueError(f"Doc not found for entity: {self.id}")

        # Convert database timestamps to Python datetime objects if needed
        if "updated_at" in doc_data:
            doc_data["lastUpdatedAt"] = doc_data["updated_at"]
        if "created_at" in doc_data:
            doc_data["createdAt"] = doc_data["created_at"]

        self._doc = self.pydantic_model(**doc_data)

    @property
    def doc(self) -> DocLike:
        if self._doc:
            return self._doc
        else:
            raise ValueError("Document is None - call load() first")

    async def create(self, data: dict):
        """Create a new document in the database"""
        if not self.table_name:
            raise ValueError("You forgot to set table_name.")
        
        # Ensure we have an ID
        if not self.id:
            self.id = str(uuid.uuid4())
        
        # Add ID to data
        data["id"] = self.id
        
        # Create the document in the database
        created_doc = await self.client.insert(self.table_name, data)
        
        # Convert database fields to model fields
        if "created_at" in created_doc:
            created_doc["createdAt"] = created_doc["created_at"]
        if "updated_at" in created_doc:
            created_doc["lastUpdatedAt"] = created_doc["updated_at"]
            
        self._doc = self.pydantic_model(**created_doc)

    async def save(self):
        """Save the current document state to the database"""
        if not self._doc:
            raise ValueError("No document to save")
        
        # Convert model to dict and update
        data = self.doc.model_dump(exclude_none=True)
        data.pop("id", None)  # Remove ID from update data
        
        await self.client.update(self.table_name, data, {"id": self.id})

    @ignore_none
    async def update(self, data: dict):
        """Update the document with new data"""
        if not self.table_name:
            raise ValueError("You forgot to set table_name.")
        
        # Update in database
        updated_doc = await self.client.update(self.table_name, data, {"id": self.id})
        
        # Update local model if we have one
        if self._doc:
            for key, value in data.items():
                if hasattr(self._doc, key):
                    setattr(self._doc, key, value)
        
        return updated_doc

    async def delete(self):
        """Delete the document from the database"""
        if not self.table_name:
            raise ValueError("You forgot to set table_name.")
        
        await self.client.delete(self.table_name, {"id": self.id})
        self._doc = None

    def get_doc_id(self):
        """Get the document ID"""
        return self.id