"""Webhook handler endpoints."""

import json
import hmac
import hashlib
import os
from fastapi import APIRouter, HTTPException, Request, status
from typing import Any
import logging
from src.models.function_types import WebhookPayload

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify webhook signature.
    
    Args:
        payload: Request payload as string
        signature: Signature from webhook header
        secret: Webhook secret
        
    Returns:
        True if signature is valid
    """
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)


@router.post("/webhook")
async def webhook_handler(request: Request):
    """Handle incoming webhooks.
    
    Args:
        request: FastAPI HTTP request
        
    Returns:
        Webhook processing response
    """
    try:
        # Get webhook secret from environment
        webhook_secret = os.environ.get("WEBHOOK_SECRET")
        
        # Get raw body for signature verification
        raw_body = await request.body()
        body_str = raw_body.decode()
        
        # Verify signature if secret is configured
        if webhook_secret:
            signature = request.headers.get("X-Webhook-Signature")
            if not signature:
                logger.warning("Webhook received without signature")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing signature"
                )
            
            if not verify_webhook_signature(body_str, signature, webhook_secret):
                logger.warning("Invalid webhook signature")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid signature"
                )
        
        # Parse webhook payload
        try:
            data = json.loads(body_str)
            webhook = WebhookPayload(**data)
        except Exception as e:
            logger.error(f"Invalid webhook payload: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload"
            )
        
        # Process webhook based on event type
        logger.info(f"Processing webhook event: {webhook.event}")
        
        # Route to appropriate handler based on event type
        if webhook.event == "item.created":
            # Handle item created event
            await _handle_item_created(webhook)
        elif webhook.event == "item.updated":
            # Handle item updated event
            await _handle_item_updated(webhook)
        elif webhook.event == "item.deleted":
            # Handle item deleted event
            await _handle_item_deleted(webhook)
        else:
            logger.warning(f"Unknown webhook event: {webhook.event}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown event: {webhook.event}"
            )
        
        # Return success response
        return {
            "success": True,
            "event": webhook.event,
            "message": "Webhook processed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


async def _handle_item_created(webhook: WebhookPayload):
    """Handle item created webhook event.
    
    Args:
        webhook: Webhook payload
    """
    logger.info(f"Item created: {webhook.data}")
    # Add custom logic for item creation events
    pass


async def _handle_item_updated(webhook: WebhookPayload):
    """Handle item updated webhook event.
    
    Args:
        webhook: Webhook payload
    """
    logger.info(f"Item updated: {webhook.data}")
    # Add custom logic for item update events
    pass


async def _handle_item_deleted(webhook: WebhookPayload):
    """Handle item deleted webhook event.
    
    Args:
        webhook: Webhook payload
    """
    logger.info(f"Item deleted: {webhook.data}")
    # Add custom logic for item deletion events
    pass