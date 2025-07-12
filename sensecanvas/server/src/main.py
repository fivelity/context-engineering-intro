"""
SenseCanvas FastAPI Server
Main server application with WebSocket support for real-time hardware monitoring.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from .api.websocket import (
    websocket_endpoint,
    health_check,
    get_current_metrics,
    get_hardware_status,
    get_connections,
    get_subscriptions,
    initialize_hardware_monitor,
    cleanup_websocket_service
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle for SenseCanvas server."""
    logger.info("🚀 Starting SenseCanvas WebSocket server...")
    
    try:
        # Initialize hardware monitoring
        await initialize_hardware_monitor()
        logger.info("✅ Hardware monitor initialized")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize server: {e}")
        raise
    finally:
        # Cleanup on shutdown
        logger.info("🛑 Shutting down SenseCanvas WebSocket server...")
        await cleanup_websocket_service()
        logger.info("✅ Server shutdown completed")


# Create FastAPI app with lifecycle management
app = FastAPI(
    title="SenseCanvas API",
    description="Real-time hardware monitoring API for SenseCanvas dashboard with WebSocket streaming",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for SvelteKit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # SvelteKit dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket endpoints
@app.websocket("/ws")
async def websocket_handler(websocket: WebSocket):
    """Main WebSocket endpoint for real-time hardware data streaming."""
    await websocket_endpoint(websocket)


# HTTP API endpoints
@app.get("/health")
async def health():
    """Health check endpoint."""
    return await health_check()


@app.get("/api/metrics")
async def current_metrics():
    """Get current hardware metrics via HTTP."""
    return await get_current_metrics()


@app.get("/api/hardware/status")
async def hardware_status():
    """Get hardware monitoring system status."""
    return await get_hardware_status()


@app.get("/api/websocket/connections")
async def websocket_connections():
    """Get information about active WebSocket connections."""
    return await get_connections()


@app.get("/api/websocket/subscriptions")
async def websocket_subscriptions():
    """Get WebSocket subscription information."""
    return await get_subscriptions()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "SenseCanvas API Server",
        "version": "1.0.0",
        "endpoints": {
            "websocket": "/ws",
            "health": "/health",
            "metrics": "/api/metrics",
            "hardware_status": "/api/hardware/status",
            "connections": "/api/websocket/connections",
            "subscriptions": "/api/websocket/subscriptions"
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting SenseCanvas server in development mode...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )