"""Factory for creating Item documents."""

import csv
import json
from typing import List, Dict, Any, Optional
from src.models.supabase_types import ItemDoc
from src.apis.Db import Db
from src.util.logger import get_logger

logger = get_logger(__name__)


class ItemFactory:
    """Factory for creating Item documents from various sources."""
    
    def __init__(self, user_id: str, category_id: str):
        """Initialize ItemFactory.
        
        Args:
            user_id: Owner user ID for created items
            category_id: Default category ID for created items
        """
        self.user_id = user_id
        self.category_id = category_id
        self.db = Db.get_instance()
    
    def from_csv(self, csv_path: str) -> List[ItemDoc]:
        """Create items from a CSV file.
        
        Expected CSV format:
        name,description,tags,metadata
        
        Args:
            csv_path: Path to CSV file
            
        Returns:
            List of created ItemDoc objects
        """
        items = []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                for row in reader:
                    item = self._create_item_from_row(row)
                    items.append(item)
                    
            logger.info(f"Created {len(items)} items from CSV {csv_path}")
            
        except Exception as e:
            logger.error(f"Failed to create items from CSV: {e}")
            raise
        
        return items
    
    def from_json(self, json_path: str) -> List[ItemDoc]:
        """Create items from a JSON file.
        
        Args:
            json_path: Path to JSON file
            
        Returns:
            List of created ItemDoc objects
        """
        items = []
        
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Handle both single item and array of items
                if isinstance(data, list):
                    for item_data in data:
                        item = self._create_item_from_dict(item_data)
                        items.append(item)
                else:
                    item = self._create_item_from_dict(data)
                    items.append(item)
            
            logger.info(f"Created {len(items)} items from JSON {json_path}")
            
        except Exception as e:
            logger.error(f"Failed to create items from JSON: {e}")
            raise
        
        return items
    
    def from_template(self, template_name: str, count: int = 1) -> List[ItemDoc]:
        """Create items from predefined templates.
        
        Args:
            template_name: Name of the template to use
            count: Number of items to create
            
        Returns:
            List of created ItemDoc objects
        """
        templates = {
            "basic": {
                "name": "Basic Item",
                "description": "A basic item template",
                "tags": ["template", "basic"],
                "metadata": {"template": "basic"}
            },
            "product": {
                "name": "Product Item",
                "description": "A product item template",
                "tags": ["template", "product"],
                "metadata": {
                    "template": "product",
                    "price": 0,
                    "currency": "USD",
                    "in_stock": True
                }
            },
            "task": {
                "name": "Task Item",
                "description": "A task item template",
                "tags": ["template", "task"],
                "metadata": {
                    "template": "task",
                    "priority": "medium",
                    "assigned_to": None,
                    "due_date": None
                }
            }
        }
        
        if template_name not in templates:
            raise ValueError(f"Unknown template: {template_name}")
        
        template = templates[template_name]
        items = []
        
        for i in range(count):
            item_data = template.copy()
            if count > 1:
                item_data["name"] = f"{template['name']} {i+1}"
            
            item = self._create_item_from_dict(item_data)
            items.append(item)
        
        logger.info(f"Created {count} items from template '{template_name}'")
        return items
    
    def batch_create(self, items_data: List[Dict[str, Any]]) -> List[ItemDoc]:
        """Create multiple items in batch.
        
        Args:
            items_data: List of item data dictionaries
            
        Returns:
            List of created ItemDoc objects
        """
        items = []
        
        for item_data in items_data:
            item = self._create_item_from_dict(item_data)
            items.append(item)
        
        logger.info(f"Batch created {len(items)} items")
        return items

    async def create_item(
        self,
        name: str,
        description: Optional[str] = None,
        category_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        owner_uid: Optional[str] = None
    ) -> "Item":
        """Create a single item and return Item instance.
        
        Args:
            name: Item name
            description: Item description
            category_id: Category ID
            tags: Item tags
            metadata: Item metadata
            owner_uid: Owner user ID (uses factory default if not provided)
            
        Returns:
            Item instance
        """
        from src.documents.items.Item import Item
        
        # Use provided owner_uid or factory default
        owner = owner_uid or self.user_id
        category = category_id or self.category_id
        
        doc_ref = self.db.collections["items"].document()
        
        item_doc = ItemDoc(
            id=doc_ref.id,
            name=name,
            description=description,
            categoryId=category,
            ownerUid=owner,
            status="active",
            tags=tags or [],
            metadata=metadata or {},
            createdAt=self.db.get_created_at(),
            lastUpdatedAt=self.db.get_created_at(),
        )
        
        # Save to Supabase database
        doc_ref.set(item_doc.model_dump())
        
        # Return Item instance
        item = Item(doc_ref.id, item_doc.model_dump())
        
        logger.info(f"Created item {doc_ref.id} for user {owner}")
        return item

    async def get_items_for_user(self, user_id: str) -> List["Item"]:
        """Get all items for a specific user.
        
        Args:
            user_id: User ID to get items for
            
        Returns:
            List of Item instances
        """
        from src.documents.items.Item import Item
        
        items_query = (
            self.db.collections["items"]
            .where("ownerUid", "==", user_id)
            .where("status", "==", "active")
            .order_by("lastUpdatedAt", direction="DESCENDING")
        )
        
        item_docs = items_query.get()
        items = []
        
        for item_doc in item_docs:
            item = Item(item_doc.id, item_doc.to_dict())
            items.append(item)
        
        logger.info(f"Retrieved {len(items)} items for user {user_id}")
        return items
    
    def _create_item_from_row(self, row: Dict[str, str]) -> ItemDoc:
        """Create an ItemDoc from a CSV row.
        
        Args:
            row: Dictionary representing a CSV row
            
        Returns:
            Created ItemDoc object
        """
        # Parse tags
        tags = []
        if row.get("tags"):
            tags = [tag.strip() for tag in row["tags"].split(",")]
        
        # Parse metadata
        metadata = {}
        if row.get("metadata"):
            try:
                metadata = json.loads(row["metadata"])
            except json.JSONDecodeError:
                logger.warning(f"Invalid metadata JSON: {row.get('metadata')}")
        
        return self._create_item(
            name=row.get("name", "Unnamed Item"),
            description=row.get("description"),
            tags=tags,
            metadata=metadata
        )
    
    def _create_item_from_dict(self, data: Dict[str, Any]) -> ItemDoc:
        """Create an ItemDoc from a dictionary.
        
        Args:
            data: Item data dictionary
            
        Returns:
            Created ItemDoc object
        """
        return self._create_item(
            name=data.get("name", "Unnamed Item"),
            description=data.get("description"),
            category_id=data.get("categoryId", self.category_id),
            tags=data.get("tags", []),
            metadata=data.get("metadata", {}),
            status=data.get("status", "active")
        )
    
    def _create_item(
        self,
        name: str,
        description: Optional[str] = None,
        category_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        status: str = "active"
    ) -> ItemDoc:
        """Create a single ItemDoc.
        
        Args:
            name: Item name
            description: Item description
            category_id: Category ID (uses factory default if not provided)
            tags: Item tags
            metadata: Item metadata
            status: Item status
            
        Returns:
            Created ItemDoc object
        """
        doc_ref = self.db.collections["items"].document()
        
        item = ItemDoc(
            id=doc_ref.id,
            name=name,
            description=description,
            categoryId=category_id or self.category_id,
            ownerUid=self.user_id,
            status=status,
            tags=tags or [],
            metadata=metadata or {},
            createdAt=self.db.get_created_at(),
            lastUpdatedAt=self.db.get_created_at(),
        )
        
        # Save to Supabase database
        doc_ref.set(item.model_dump())
        
        return item