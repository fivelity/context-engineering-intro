"""
WebSocketManager - Manages WebSocket connections for real-time data streaming
Handles multiple clients with efficient broadcasting and connection management
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import List, Set, Dict, Any
from weakref import WeakSet

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections for real-time sensor data streaming
    Optimized for React 19+ concurrent features and automatic batching
    """
    
    def __init__(self):
        # Use WeakSet to automatically clean up closed connections
        self.active_connections: WeakSet[WebSocket] = WeakSet()
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
        self.message_queue: asyncio.Queue = asyncio.Queue()
        self.broadcast_task: Optional[asyncio.Task] = None
        self.stats = {
            "total_connections": 0,
            "active_connections": 0,
            "messages_sent": 0,
            "errors": 0,
            "last_broadcast": None
        }
        
    async def connect(self, websocket: WebSocket) -> bool:
        """Accept and register a new WebSocket connection"""
        try:
            await websocket.accept()
            
            # Add to active connections
            self.active_connections.add(websocket)
            
            # Store connection metadata
            self.connection_info[websocket] = {
                "connected_at": datetime.utcnow(),
                "client_info": {
                    "headers": dict(websocket.headers),
                    "client": websocket.client,
                    "url": str(websocket.url) if websocket.url else None
                },
                "messages_sent": 0,
                "last_ping": None
            }
            
            # Update stats
            self.stats["total_connections"] += 1
            self.stats["active_connections"] = len(self.active_connections)
            
            logger.info(f"WebSocket client connected: {websocket.client}. Total active: {self.stats['active_connections']}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error accepting WebSocket connection: {e}")
            return False
    
    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        try:
            # Remove from active connections (WeakSet handles automatic cleanup)
            if websocket in self.connection_info:
                connection_time = datetime.utcnow() - self.connection_info[websocket]["connected_at"]
                logger.info(f"WebSocket client disconnected after {connection_time}. Messages sent: {self.connection_info[websocket]['messages_sent']}")
                
                # Clean up connection info
                del self.connection_info[websocket]
            
            # Update stats
            self.stats["active_connections"] = len(self.active_connections)
            
        except Exception as e:
            logger.error(f"Error during WebSocket disconnect: {e}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket) -> bool:
        """Send message to a specific WebSocket connection"""
        try:
            await websocket.send_text(message)
            
            # Update connection stats
            if websocket in self.connection_info:
                self.connection_info[websocket]["messages_sent"] += 1
            
            self.stats["messages_sent"] += 1
            return True
            
        except WebSocketDisconnect:
            logger.info("Client disconnected during message send")
            await self.disconnect(websocket)
            return False
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.stats["errors"] += 1
            return False
    
    async def broadcast(self, message: str, exclude: Set[WebSocket] = None) -> int:
        """Broadcast message to all active connections"""
        if not self.active_connections:
            return 0
        
        exclude = exclude or set()
        successful_sends = 0
        failed_connections = []
        
        # Create list of target connections
        target_connections = [
            ws for ws in self.active_connections 
            if ws not in exclude
        ]
        
        if not target_connections:
            return 0
        
        # Batch send messages for optimal performance
        send_tasks = []
        for websocket in target_connections:
            task = asyncio.create_task(self._safe_send(websocket, message))
            send_tasks.append((websocket, task))
        
        # Wait for all sends to complete
        for websocket, task in send_tasks:
            try:
                success = await task
                if success:
                    successful_sends += 1
                else:
                    failed_connections.append(websocket)
            except Exception as e:
                logger.error(f"Broadcast task error for {websocket.client}: {e}")
                failed_connections.append(websocket)
        
        # Clean up failed connections
        for websocket in failed_connections:
            await self.disconnect(websocket)
        
        # Update stats
        self.stats["last_broadcast"] = datetime.utcnow().isoformat()
        
        if successful_sends > 0:
            logger.debug(f"Broadcast sent to {successful_sends}/{len(target_connections)} clients")
        
        return successful_sends
    
    async def _safe_send(self, websocket: WebSocket, message: str) -> bool:
        """Safely send message to WebSocket with error handling"""
        try:
            await websocket.send_text(message)
            
            # Update connection stats
            if websocket in self.connection_info:
                self.connection_info[websocket]["messages_sent"] += 1
            
            self.stats["messages_sent"] += 1
            return True
            
        except WebSocketDisconnect:
            return False
        except Exception as e:
            logger.error(f"Error in safe send to {websocket.client}: {e}")
            self.stats["errors"] += 1
            return False
    
    async def broadcast_json(self, data: Dict[str, Any], exclude: Set[WebSocket] = None) -> int:
        """Broadcast JSON data to all active connections"""
        try:
            message = json.dumps(data, default=str)
            return await self.broadcast(message, exclude)
        except Exception as e:
            logger.error(f"Error serializing JSON for broadcast: {e}")
            return 0
    
    async def send_ping_to_all(self) -> int:
        """Send ping message to all connections to keep them alive"""
        ping_message = json.dumps({
            "type": "ping",
            "timestamp": datetime.utcnow().isoformat(),
            "server_time": datetime.utcnow().timestamp()
        })
        
        return await self.broadcast(ping_message)
    
    def has_connections(self) -> bool:
        """Check if there are any active connections"""
        return len(self.active_connections) > 0
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get detailed connection statistics"""
        active_count = len(self.active_connections)
        
        # Calculate connection details
        connection_details = []
        for websocket, info in self.connection_info.items():
            if websocket in self.active_connections:
                connection_time = datetime.utcnow() - info["connected_at"]
                connection_details.append({
                    "client": str(websocket.client),
                    "connected_for": str(connection_time),
                    "messages_sent": info["messages_sent"],
                    "last_ping": info.get("last_ping")
                })
        
        return {
            **self.stats,
            "active_connections": active_count,
            "connection_details": connection_details,
            "uptime_stats": {
                "avg_messages_per_connection": (
                    self.stats["messages_sent"] / max(1, self.stats["total_connections"])
                ),
                "error_rate": (
                    self.stats["errors"] / max(1, self.stats["messages_sent"])
                ) if self.stats["messages_sent"] > 0 else 0
            }
        }
    
    async def cleanup(self):
        """Cleanup WebSocket manager resources"""
        logger.info("Cleaning up WebSocket manager...")
        
        # Close all active connections
        close_tasks = []
        for websocket in list(self.active_connections):
            try:
                task = asyncio.create_task(websocket.close())
                close_tasks.append(task)
            except Exception as e:
                logger.error(f"Error creating close task for {websocket.client}: {e}")
        
        # Wait for all connections to close
        if close_tasks:
            try:
                await asyncio.wait_for(
                    asyncio.gather(*close_tasks, return_exceptions=True),
                    timeout=5.0
                )
            except asyncio.TimeoutError:
                logger.warning("Timeout waiting for WebSocket connections to close")
        
        # Clear connection info
        self.connection_info.clear()
        
        # Cancel broadcast task if running
        if self.broadcast_task and not self.broadcast_task.done():
            self.broadcast_task.cancel()
            try:
                await self.broadcast_task
            except asyncio.CancelledError:
                pass
        
        logger.info("WebSocket manager cleanup complete")
    
    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Handle incoming messages from WebSocket clients"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "ping":
                # Respond to ping with pong
                pong_message = json.dumps({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat(),
                    "original_timestamp": data.get("timestamp")
                })
                await self.send_personal_message(pong_message, websocket)
                
                # Update last ping time
                if websocket in self.connection_info:
                    self.connection_info[websocket]["last_ping"] = datetime.utcnow()
            
            elif message_type == "subscribe":
                # Handle subscription requests (future feature)
                logger.info(f"Client {websocket.client} subscription request: {data}")
            
            elif message_type == "unsubscribe":
                # Handle unsubscription requests (future feature)
                logger.info(f"Client {websocket.client} unsubscription request: {data}")
            
            else:
                logger.warning(f"Unknown message type from {websocket.client}: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from {websocket.client}: {message}")
        except Exception as e:
            logger.error(f"Error handling client message from {websocket.client}: {e}")