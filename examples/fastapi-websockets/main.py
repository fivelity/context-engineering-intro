"""
SenseCanvas: FastAPI WebSocket Server Example
Demonstrates real-time hardware data streaming with proper error handling and connection management.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from .hardware_monitor import HardwareMonitor
from .models import HardwareMetrics, SensorConfig, AlertConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global connection manager and hardware monitor
class ConnectionManager:
    """Manages WebSocket connections and broadcasting."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, dict] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.connection_metadata[client_id] = {
            'connected_at': datetime.now(),
            'last_ping': datetime.now(),
            'subscriptions': set()
        }
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, client_id: str) -> None:
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            del self.connection_metadata[client_id]
            logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
            
    async def send_personal_message(self, message: str, client_id: str) -> None:
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)
                
    async def broadcast(self, message: str) -> None:
        """Broadcast a message to all connected clients."""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to {client_id}: {e}")
                disconnected_clients.append(client_id)
                
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
            
    async def broadcast_to_subscribers(self, message: str, subscription_type: str) -> None:
        """Broadcast to clients subscribed to a specific data type."""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            metadata = self.connection_metadata.get(client_id, {})
            subscriptions = metadata.get('subscriptions', set())
            
            if subscription_type in subscriptions:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Failed to send to subscriber {client_id}: {e}")
                    disconnected_clients.append(client_id)
                    
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

# Global instances
manager = ConnectionManager()
hardware_monitor: Optional[HardwareMonitor] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    global hardware_monitor
    
    # Startup
    logger.info("Starting SenseCanvas WebSocket server...")
    hardware_monitor = HardwareMonitor()
    await hardware_monitor.initialize()
    
    # Start background data collection
    data_task = asyncio.create_task(collect_and_broadcast_data())
    
    try:
        yield
    finally:
        # Shutdown
        logger.info("Shutting down SenseCanvas WebSocket server...")
        data_task.cancel()
        if hardware_monitor:
            await hardware_monitor.cleanup()

# FastAPI app with lifespan management
app = FastAPI(
    title="SenseCanvas WebSocket API",
    description="Real-time hardware monitoring API for SenseCanvas dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # SvelteKit dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def collect_and_broadcast_data():
    """Background task to collect hardware data and broadcast to clients."""
    while True:
        try:
            if hardware_monitor and len(manager.active_connections) > 0:
                # Collect hardware metrics
                metrics = await hardware_monitor.get_metrics()
                
                # Serialize and broadcast
                message = json.dumps({
                    'type': 'hardware_metrics',
                    'timestamp': datetime.now().isoformat(),
                    'data': metrics.model_dump()
                })
                
                await manager.broadcast_to_subscribers(message, 'hardware_metrics')
                
                # Check for alerts
                alerts = await hardware_monitor.check_alerts(metrics)
                if alerts:
                    alert_message = json.dumps({
                        'type': 'alerts',
                        'timestamp': datetime.now().isoformat(),
                        'alerts': [alert.model_dump() for alert in alerts]
                    })
                    await manager.broadcast_to_subscribers(alert_message, 'alerts')
                    
        except Exception as e:
            logger.error(f"Error in data collection: {e}")
            
        # Wait before next collection (1 second interval)
        await asyncio.sleep(1.0)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time data streaming."""
    client_id = f"client_{datetime.now().timestamp()}"
    
    try:
        await manager.connect(websocket, client_id)
        
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            'type': 'connection_established',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat()
        }))
        
        # Listen for client messages
        while True:
            try:
                # Wait for client message with timeout
                message = await asyncio.wait_for(
                    websocket.receive_text(), 
                    timeout=30.0  # 30 second timeout
                )
                
                data = json.loads(message)
                message_type = data.get('type')
                
                if message_type == 'subscribe':
                    # Handle subscription to specific data types
                    subscription_type = data.get('subscription_type', 'hardware_metrics')
                    manager.connection_metadata[client_id]['subscriptions'].add(subscription_type)
                    
                    await websocket.send_text(json.dumps({
                        'type': 'subscription_confirmed',
                        'subscription_type': subscription_type,
                        'timestamp': datetime.now().isoformat()
                    }))
                    
                elif message_type == 'unsubscribe':
                    # Handle unsubscription
                    subscription_type = data.get('subscription_type', 'hardware_metrics')
                    manager.connection_metadata[client_id]['subscriptions'].discard(subscription_type)
                    
                elif message_type == 'ping':
                    # Handle ping for connection health
                    manager.connection_metadata[client_id]['last_ping'] = datetime.now()
                    await websocket.send_text(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }))
                    
                elif message_type == 'get_current_metrics':
                    # Send current metrics immediately
                    if hardware_monitor:
                        metrics = await hardware_monitor.get_metrics()
                        await websocket.send_text(json.dumps({
                            'type': 'current_metrics',
                            'timestamp': datetime.now().isoformat(),
                            'data': metrics.model_dump()
                        }))
                        
            except asyncio.TimeoutError:
                # Send ping to check if client is still alive
                await websocket.send_text(json.dumps({
                    'type': 'ping',
                    'timestamp': datetime.now().isoformat()
                }))
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from {client_id}")
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format',
                    'timestamp': datetime.now().isoformat()
                }))
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
        manager.disconnect(client_id)
        
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_connections': len(manager.active_connections),
        'hardware_monitor_status': 'active' if hardware_monitor else 'inactive'
    }

@app.get("/metrics")
async def get_current_metrics():
    """HTTP endpoint to get current hardware metrics."""
    if not hardware_monitor:
        raise HTTPException(status_code=503, detail="Hardware monitor not initialized")
        
    metrics = await hardware_monitor.get_metrics()
    return {
        'timestamp': datetime.now().isoformat(),
        'data': metrics.model_dump()
    }

@app.get("/connections")
async def get_connections():
    """Get information about active connections."""
    return {
        'active_connections': len(manager.active_connections),
        'connections': [
            {
                'client_id': client_id,
                'connected_at': metadata['connected_at'].isoformat(),
                'last_ping': metadata['last_ping'].isoformat(),
                'subscriptions': list(metadata['subscriptions'])
            }
            for client_id, metadata in manager.connection_metadata.items()
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 