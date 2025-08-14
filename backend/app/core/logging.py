"""
Structured logging configuration using structlog.
"""

import sys
import logging
from typing import Any, Dict
import structlog
from structlog.stdlib import LoggerFactory
from structlog.processors import JSONRenderer, TimeStamper, StackInfoRenderer
from structlog.stdlib import filter_by_level


def setup_logging() -> None:
    """Configure structured logging for the application."""
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, "INFO"),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            filter_by_level,
            StackInfoRenderer(),
            TimeStamper(fmt="iso"),
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.format_exc_info,
            JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Set log level from settings
    try:
        from app.core.config import settings
        log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
        logging.getLogger().setLevel(log_level)
    except ImportError:
        # Fallback if settings not available
        logging.getLogger().setLevel(logging.INFO)


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


def log_context(**kwargs: Any) -> Dict[str, Any]:
    """Create a log context dictionary."""
    return kwargs


# Convenience functions for common logging patterns
def log_request(request_id: str, method: str, url: str, **kwargs: Any) -> None:
    """Log HTTP request information."""
    logger = get_logger("http.request")
    logger.info(
        "HTTP request",
        request_id=request_id,
        method=method,
        url=url,
        **kwargs
    )


def log_response(request_id: str, status_code: int, response_time: float, **kwargs: Any) -> None:
    """Log HTTP response information."""
    logger = get_logger("http.response")
    logger.info(
        "HTTP response",
        request_id=request_id,
        status_code=status_code,
        response_time=response_time,
        **kwargs
    )


def log_user_action(user_id: str, action: str, **kwargs: Any) -> None:
    """Log user actions for analytics."""
    logger = get_logger("user.action")
    logger.info(
        "User action",
        user_id=user_id,
        action=action,
        **kwargs
    )


def log_learning_progress(user_id: str, lesson_id: str, progress: float, **kwargs: Any) -> None:
    """Log learning progress for analytics."""
    logger = get_logger("learning.progress")
    logger.info(
        "Learning progress",
        user_id=user_id,
        lesson_id=lesson_id,
        progress=progress,
        **kwargs
    )


def log_ai_interaction(interaction_type: str, model: str, **kwargs: Any) -> None:
    """Log AI service interactions."""
    logger = get_logger("ai.interaction")
    logger.info(
        "AI interaction",
        interaction_type=interaction_type,
        model=model,
        **kwargs
    )
