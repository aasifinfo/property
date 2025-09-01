"""Database authentication wrapper utility.

DEPRECATED: This module is deprecated as Firebase Functions have been migrated to FastAPI.
Use the `get_current_user` dependency in FastAPI endpoints instead.
"""

import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def db_auth_wrapper(req=None) -> str:
    """DEPRECATED: Firebase authentication wrapper.
    
    This function is deprecated. Use FastAPI's `get_current_user` dependency instead.
    
    Args:
        req: Deprecated Firebase callable request object
        
    Returns:
        Raises deprecation error
        
    Raises:
        HTTPException: Always raises as this function is deprecated
    """
    logger.warning("db_auth_wrapper is deprecated. Use FastAPI's get_current_user dependency instead.")
    raise HTTPException(
        status_code=500,
        detail="db_auth_wrapper is deprecated. Use FastAPI's get_current_user dependency instead."
    )