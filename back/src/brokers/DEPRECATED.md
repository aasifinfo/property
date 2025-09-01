# DEPRECATED Firebase Functions

This directory contains deprecated Firebase Functions that have been migrated to FastAPI endpoints.

## Migration Status ✅ COMPLETED

All Firebase Functions have been successfully migrated to FastAPI:

### Callable Functions → FastAPI Endpoints
- ✅ `callable/example_callable.py` → `/api/example` POST endpoint
- ✅ `callable/get_item.py` → `/api/items/{item_id}` GET endpoint (enhanced)  
- ✅ `callable/create_item.py` → `/api/items` POST endpoint (enhanced)

### HTTPS Functions → FastAPI Routes
- ✅ `https/health_check.py` → `/health` GET endpoint (enhanced)
- ✅ `https/webhook_handler.py` → `/api/webhook` POST endpoint

### Trigger Functions → API-Integrated Logic
- ✅ `triggered/on_item_created.py` → `_handle_item_created()` in items.py
- ✅ `triggered/on_item_updated.py` → `_handle_item_updated()` in items.py
- ✅ `triggered/on_item_deleted.py` → `_handle_item_deleted()` in items.py

## New FastAPI Endpoints

All functionality is now available through FastAPI endpoints:

- **Health**: `GET /health`
- **Authentication**: `POST /auth/signin`, `POST /auth/signup`, `POST /auth/signout`
- **Items**: `GET|POST|PUT|DELETE /api/items`
- **Categories**: `GET|POST|PUT|DELETE /api/categories` 
- **Webhooks**: `POST /api/webhook`
- **Example**: `POST /api/example`

## Database Migration

- ✅ Firebase Admin SDK → Supabase client
- ✅ Firestore → Supabase PostgreSQL database
- ✅ Firebase Storage → Supabase Storage
- ✅ Firebase Auth → Supabase Auth with JWT validation

## Cleanup

These deprecated directories can be safely removed once you've confirmed all functionality works in the new FastAPI implementation.