"""
SenseCanvas WebSocket Connection Manager
Manages WebSocket connections, subscriptions, and real-time broadcasting for hardware data.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasting for SenseCanvas."""
    
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
            'subscriptions': set(),
            'user_agent': getattr(websocket.headers, 'user-agent', 'Unknown')
        }
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, client_id: str) -> None:
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            del self.connection_metadata[client_id]
            logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
            
    async def send_personal_message(self, message: str, client_id: str) -> bool:
        """Send a message to a specific client. Returns True if successful."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
                return True
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)
                return False
        return False
                
    async def broadcast(self, message: str) -> int:
        """Broadcast a message to all connected clients. Returns number of successful sends."""
        disconnected_clients = []
        successful_sends = 0
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
                successful_sends += 1
            except Exception as e:
                logger.error(f"Failed to broadcast to {client_id}: {e}")
                disconnected_clients.append(client_id)
                
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
            
        return successful_sends
            
    async def broadcast_to_subscribers(self, message: str, subscription_type: str) -> int:
        """Broadcast to clients subscribed to a specific data type. Returns number of successful sends."""
        disconnected_clients = []
        successful_sends = 0
        
        for client_id, websocket in self.active_connections.items():
            metadata = self.connection_metadata.get(client_id, {})
            subscriptions = metadata.get('subscriptions', set())
            
            if subscription_type in subscriptions:
                try:
                    await websocket.send_text(message)
                    successful_sends += 1
                except Exception as e:
                    logger.error(f"Failed to send to subscriber {client_id}: {e}")
                    disconnected_clients.append(client_id)
                    
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
            
        return successful_sends
    
    def add_subscription(self, client_id: str, subscription_type: str) -> bool:
        """Add a subscription for a client. Returns True if successful."""
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]['subscriptions'].add(subscription_type)
            logger.info(f"Client {client_id} subscribed to {subscription_type}")
            return True
        return False
    
    def remove_subscription(self, client_id: str, subscription_type: str) -> bool:
        """Remove a subscription for a client. Returns True if successful."""
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]['subscriptions'].discard(subscription_type)
            logger.info(f"Client {client_id} unsubscribed from {subscription_type}")
            return True
        return False
    
    def update_ping(self, client_id: str) -> None:
        """Update the last ping time for a client."""
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]['last_ping'] = datetime.now()
    
    def get_connection_info(self) -> dict:
        """Get information about all active connections."""
        return {
            'total_connections': len(self.active_connections),
            'connections': [
                {
                    'client_id': client_id,
                    'connected_at': metadata['connected_at'].isoformat(),
                    'last_ping': metadata['last_ping'].isoformat(),
                    'subscriptions': list(metadata['subscriptions']),
                    'user_agent': metadata.get('user_agent', 'Unknown')
                }
                for client_id, metadata in self.connection_metadata.items()
            ]
        }
    
    def get_subscribers(self, subscription_type: str) -> List[str]:
        """Get list of client IDs subscribed to a specific data type."""
        subscribers = []
        for client_id, metadata in self.connection_metadata.items():
            if subscription_type in metadata.get('subscriptions', set()):
                subscribers.append(client_id)
        return subscribers
    
    async def cleanup_stale_connections(self, timeout_seconds: int = 300) -> int:
        """Clean up connections that haven't pinged in the specified timeout. Returns number cleaned."""
        cutoff_time = datetime.now().timestamp() - timeout_seconds
        stale_clients = []
        
        for client_id, metadata in self.connection_metadata.items():
            last_ping = metadata.get('last_ping', datetime.now())
            if last_ping.timestamp() < cutoff_time:
                stale_clients.append(client_id)
        
        for client_id in stale_clients:
            logger.info(f"Cleaning up stale connection: {client_id}")
            self.disconnect(client_id)
            
        return len(stale_clients)