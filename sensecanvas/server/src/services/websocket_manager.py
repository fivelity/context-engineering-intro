"""
SenseCanvas WebSocket Manager Service
Manages WebSocket connections, subscriptions, and message broadcasting
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


@dataclass
class ClientConnection:
    """Represents a connected WebSocket client"""
    client_id: str
    websocket: WebSocket
    connected_at: datetime
    last_ping: datetime
    subscriptions: Set[str] = field(default_factory=set)
    metadata: Dict[str, Any] = field(default_factory=dict)


class WebSocketManager:
    """
    Manages WebSocket connections and message broadcasting.
    Handles connection lifecycle, subscriptions, and message distribution.
    """
    
    def __init__(self):
        self.active_connections: Dict[str, ClientConnection] = {}
        self.subscription_groups: Dict[str, Set[str]] = {}
        self._lock = asyncio.Lock()
        self._message_queue: asyncio.Queue = asyncio.Queue()
        self._broadcast_task: Optional[asyncio.Task] = None
        
    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        async with self._lock:
            connection = ClientConnection(
                client_id=client_id,
                websocket=websocket,
                connected_at=datetime.now(),
                last_ping=datetime.now()
            )
            self.active_connections[client_id] = connection
            
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
        # Send connection confirmation
        await self.send_personal_message(
            message={
                "type": "connection_established",
                "client_id": client_id,
                "timestamp": datetime.now().isoformat()
            },
            client_id=client_id
        )
        
    async def disconnect(self, client_id: str) -> None:
        """Remove a WebSocket connection and clean up subscriptions."""
        async with self._lock:
            if client_id in self.active_connections:
                connection = self.active_connections[client_id]
                
                # Remove from all subscription groups
                for subscription in connection.subscriptions:
                    if subscription in self.subscription_groups:
                        self.subscription_groups[subscription].discard(client_id)
                        if not self.subscription_groups[subscription]:
                            del self.subscription_groups[subscription]
                
                del self.active_connections[client_id]
                
        logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
        
    async def send_personal_message(self, message: Dict[str, Any], client_id: str) -> bool:
        """Send a message to a specific client."""
        if client_id not in self.active_connections:
            return False
            
        try:
            connection = self.active_connections[client_id]
            await connection.websocket.send_json(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send message to {client_id}: {e}")
            await self.disconnect(client_id)
            return False
            
    async def broadcast(self, message: Dict[str, Any]) -> int:
        """Broadcast a message to all connected clients."""
        disconnected_clients = []
        sent_count = 0
        
        for client_id in list(self.active_connections.keys()):
            try:
                connection = self.active_connections[client_id]
                await connection.websocket.send_json(message)
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to broadcast to {client_id}: {e}")
                disconnected_clients.append(client_id)
                
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            await self.disconnect(client_id)
            
        return sent_count
        
    async def broadcast_to_subscription(self, message: Dict[str, Any], subscription_type: str) -> int:
        """Broadcast a message to all clients subscribed to a specific type."""
        if subscription_type not in self.subscription_groups:
            return 0
            
        disconnected_clients = []
        sent_count = 0
        
        for client_id in list(self.subscription_groups[subscription_type]):
            if await self.send_personal_message(message, client_id):
                sent_count += 1
            else:
                disconnected_clients.append(client_id)
                
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            await self.disconnect(client_id)
            
        return sent_count
        
    async def add_subscription(self, client_id: str, subscription_type: str) -> bool:
        """Add a subscription for a client."""
        async with self._lock:
            if client_id not in self.active_connections:
                return False
                
            connection = self.active_connections[client_id]
            connection.subscriptions.add(subscription_type)
            
            if subscription_type not in self.subscription_groups:
                self.subscription_groups[subscription_type] = set()
            self.subscription_groups[subscription_type].add(client_id)
            
        logger.info(f"Client {client_id} subscribed to {subscription_type}")
        
        # Send confirmation
        await self.send_personal_message(
            message={
                "type": "subscription_confirmed",
                "subscription_type": subscription_type,
                "timestamp": datetime.now().isoformat()
            },
            client_id=client_id
        )
        
        return True
        
    async def remove_subscription(self, client_id: str, subscription_type: str) -> bool:
        """Remove a subscription for a client."""
        async with self._lock:
            if client_id not in self.active_connections:
                return False
                
            connection = self.active_connections[client_id]
            connection.subscriptions.discard(subscription_type)
            
            if subscription_type in self.subscription_groups:
                self.subscription_groups[subscription_type].discard(client_id)
                if not self.subscription_groups[subscription_type]:
                    del self.subscription_groups[subscription_type]
                    
        logger.info(f"Client {client_id} unsubscribed from {subscription_type}")
        
        # Send confirmation
        await self.send_personal_message(
            message={
                "type": "unsubscription_confirmed",
                "subscription_type": subscription_type,
                "timestamp": datetime.now().isoformat()
            },
            client_id=client_id
        )
        
        return True
        
    async def update_client_ping(self, client_id: str) -> None:
        """Update the last ping time for a client."""
        if client_id in self.active_connections:
            self.active_connections[client_id].last_ping = datetime.now()
            
    def get_connection_info(self) -> Dict[str, Any]:
        """Get information about current connections."""
        return {
            "total_connections": len(self.active_connections),
            "connections": [
                {
                    "client_id": conn.client_id,
                    "connected_at": conn.connected_at.isoformat(),
                    "last_ping": conn.last_ping.isoformat(),
                    "subscriptions": list(conn.subscriptions)
                }
                for conn in self.active_connections.values()
            ]
        }
        
    def get_subscription_info(self) -> Dict[str, Any]:
        """Get information about current subscriptions."""
        return {
            "subscription_types": list(self.subscription_groups.keys()),
            "subscriptions": {
                sub_type: len(subscribers)
                for sub_type, subscribers in self.subscription_groups.items()
            }
        }
        
    async def handle_client_message(self, client_id: str, message: Dict[str, Any]) -> None:
        """Handle a message received from a client."""
        message_type = message.get("type")
        
        if message_type == "subscribe":
            subscription_type = message.get("subscription_type", "hardware_metrics")
            await self.add_subscription(client_id, subscription_type)
            
        elif message_type == "unsubscribe":
            subscription_type = message.get("subscription_type", "hardware_metrics")
            await self.remove_subscription(client_id, subscription_type)
            
        elif message_type == "ping":
            await self.update_client_ping(client_id)
            await self.send_personal_message(
                message={
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                },
                client_id=client_id
            )
            
        elif message_type == "get_current_metrics":
            # This would be handled by the main WebSocket endpoint
            pass
            
        else:
            logger.warning(f"Unknown message type from {client_id}: {message_type}")
            
    async def cleanup_stale_connections(self, timeout_seconds: int = 60) -> int:
        """Remove connections that haven't sent a ping in the specified timeout."""
        now = datetime.now()
        stale_clients = []
        
        for client_id, connection in self.active_connections.items():
            time_since_ping = (now - connection.last_ping).total_seconds()
            if time_since_ping > timeout_seconds:
                stale_clients.append(client_id)
                
        for client_id in stale_clients:
            logger.warning(f"Removing stale connection: {client_id}")
            await self.disconnect(client_id)
            
        return len(stale_clients)
        
    async def start_background_tasks(self) -> None:
        """Start background tasks for connection management."""
        # Start periodic cleanup task
        asyncio.create_task(self._periodic_cleanup())
        
    async def _periodic_cleanup(self) -> None:
        """Periodically clean up stale connections."""
        while True:
            try:
                await asyncio.sleep(30)  # Run every 30 seconds
                removed = await self.cleanup_stale_connections()
                if removed > 0:
                    logger.info(f"Cleaned up {removed} stale connections")
            except Exception as e:
                logger.error(f"Error in periodic cleanup: {e}")
                
    async def shutdown(self) -> None:
        """Gracefully shutdown all connections."""
        logger.info("Shutting down WebSocket manager...")
        
        # Send shutdown message to all clients
        await self.broadcast({
            "type": "server_shutdown",
            "timestamp": datetime.now().isoformat(),
            "message": "Server is shutting down"
        })
        
        # Close all connections
        for client_id in list(self.active_connections.keys()):
            await self.disconnect(client_id)
            
        logger.info("WebSocket manager shutdown complete")


# Global instance
websocket_manager = WebSocketManager()