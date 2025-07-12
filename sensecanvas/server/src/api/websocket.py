"""
SenseCanvas WebSocket API
Real-time hardware data streaming endpoints with subscription management.
"""

import asyncio
import json
import logging
from typing import Optional
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from ..core.websocket_manager import ConnectionManager
from ..services.hardware_monitor import HardwareMonitor
from ..models.hardware import HardwareMetrics, HardwareAlert

logger = logging.getLogger(__name__)

# Global instances
manager = ConnectionManager()
hardware_monitor: Optional[HardwareMonitor] = None
data_collection_task: Optional[asyncio.Task] = None


async def get_hardware_monitor() -> HardwareMonitor:
    """Dependency to get the hardware monitor instance."""
    if hardware_monitor is None:
        raise HTTPException(status_code=503, detail="Hardware monitor not initialized")
    return hardware_monitor


async def collect_and_broadcast_data():
    """Background task to collect hardware data and broadcast to clients."""
    logger.info("Starting hardware data collection and broadcasting")
    
    while True:
        try:
            if hardware_monitor and len(manager.active_connections) > 0:
                # Collect hardware metrics
                metrics = await hardware_monitor.get_metrics()
                
                # Serialize and broadcast to hardware_metrics subscribers
                message = json.dumps({
                    'type': 'hardware_metrics',
                    'timestamp': datetime.now().isoformat(),
                    'data': metrics.model_dump()
                })
                
                sent_count = await manager.broadcast_to_subscribers(message, 'hardware_metrics')
                if sent_count > 0:
                    logger.debug(f"Broadcasted metrics to {sent_count} subscribers")
                
                # Check for alerts and broadcast to alert subscribers
                alerts = await hardware_monitor.check_alerts(metrics)
                if alerts:
                    alert_message = json.dumps({
                        'type': 'alerts',
                        'timestamp': datetime.now().isoformat(),
                        'alerts': [alert.model_dump() for alert in alerts]
                    })
                    alert_sent_count = await manager.broadcast_to_subscribers(alert_message, 'alerts')
                    logger.info(f"Broadcasted {len(alerts)} alerts to {alert_sent_count} subscribers")
                    
        except Exception as e:
            logger.error(f"Error in data collection: {e}")
            
        # Wait before next collection (1 second interval as per SenseCanvas requirements)
        await asyncio.sleep(1.0)


async def start_background_tasks():
    """Start background data collection task."""
    global data_collection_task
    if data_collection_task is None or data_collection_task.done():
        data_collection_task = asyncio.create_task(collect_and_broadcast_data())
        logger.info("Background data collection task started")


async def stop_background_tasks():
    """Stop background data collection task."""
    global data_collection_task
    if data_collection_task and not data_collection_task.done():
        data_collection_task.cancel()
        try:
            await data_collection_task
        except asyncio.CancelledError:
            pass
        logger.info("Background data collection task stopped")


async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time data streaming."""
    client_id = f"client_{int(datetime.now().timestamp() * 1000)}"
    
    try:
        await manager.connect(websocket, client_id)
        
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            'type': 'connection_established',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat(),
            'available_subscriptions': ['hardware_metrics', 'alerts', 'system_status']
        }))
        
        # Start background tasks if not already running
        await start_background_tasks()
        
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
                    valid_subscriptions = ['hardware_metrics', 'alerts', 'system_status']
                    
                    if subscription_type in valid_subscriptions:
                        manager.add_subscription(client_id, subscription_type)
                        
                        await websocket.send_text(json.dumps({
                            'type': 'subscription_confirmed',
                            'subscription_type': subscription_type,
                            'timestamp': datetime.now().isoformat()
                        }))
                    else:
                        await websocket.send_text(json.dumps({
                            'type': 'error',
                            'message': f'Invalid subscription type: {subscription_type}',
                            'valid_types': valid_subscriptions,
                            'timestamp': datetime.now().isoformat()
                        }))
                    
                elif message_type == 'unsubscribe':
                    # Handle unsubscription
                    subscription_type = data.get('subscription_type', 'hardware_metrics')
                    manager.remove_subscription(client_id, subscription_type)
                    
                    await websocket.send_text(json.dumps({
                        'type': 'unsubscription_confirmed',
                        'subscription_type': subscription_type,
                        'timestamp': datetime.now().isoformat()
                    }))
                    
                elif message_type == 'ping':
                    # Handle ping for connection health
                    manager.update_ping(client_id)
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
                        
                elif message_type == 'get_hardware_status':
                    # Send hardware monitoring status
                    if hardware_monitor:
                        status = await hardware_monitor.get_status()
                        await websocket.send_text(json.dumps({
                            'type': 'hardware_status',
                            'timestamp': datetime.now().isoformat(),
                            'status': status.model_dump()
                        }))
                        
                elif message_type == 'set_alert_threshold':
                    # Update alert thresholds
                    alert_type = data.get('alert_type')
                    threshold_value = data.get('value')
                    
                    if hardware_monitor and alert_type and threshold_value is not None:
                        hardware_monitor.set_alert_threshold(alert_type, float(threshold_value))
                        await websocket.send_text(json.dumps({
                            'type': 'alert_threshold_updated',
                            'alert_type': alert_type,
                            'value': threshold_value,
                            'timestamp': datetime.now().isoformat()
                        }))
                    else:
                        await websocket.send_text(json.dumps({
                            'type': 'error',
                            'message': 'Invalid alert threshold parameters',
                            'timestamp': datetime.now().isoformat()
                        }))
                        
                else:
                    # Unknown message type
                    await websocket.send_text(json.dumps({
                        'type': 'error',
                        'message': f'Unknown message type: {message_type}',
                        'timestamp': datetime.now().isoformat()
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


# HTTP API endpoints for monitoring and health checks

async def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_connections': len(manager.active_connections),
        'hardware_monitor_status': 'active' if hardware_monitor else 'inactive',
        'data_collection_running': data_collection_task is not None and not data_collection_task.done()
    }


async def get_current_metrics(monitor: HardwareMonitor = Depends(get_hardware_monitor)):
    """HTTP endpoint to get current hardware metrics."""
    metrics = await monitor.get_metrics()
    return {
        'timestamp': datetime.now().isoformat(),
        'data': metrics.model_dump()
    }


async def get_hardware_status(monitor: HardwareMonitor = Depends(get_hardware_monitor)):
    """HTTP endpoint to get hardware monitoring status."""
    status = await monitor.get_status()
    return {
        'timestamp': datetime.now().isoformat(),
        'status': status.model_dump()
    }


async def get_connections():
    """Get information about active WebSocket connections."""
    return manager.get_connection_info()


async def get_subscriptions():
    """Get subscription information."""
    return {
        'hardware_metrics_subscribers': manager.get_subscribers('hardware_metrics'),
        'alerts_subscribers': manager.get_subscribers('alerts'),
        'system_status_subscribers': manager.get_subscribers('system_status'),
        'total_connections': len(manager.active_connections)
    }


# Initialization function for the hardware monitor
async def initialize_hardware_monitor():
    """Initialize the hardware monitoring system."""
    global hardware_monitor
    
    try:
        logger.info("Initializing hardware monitor...")
        hardware_monitor = HardwareMonitor(polling_interval=1.0)
        await hardware_monitor.initialize()
        logger.info("Hardware monitor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize hardware monitor: {e}")
        raise


# Cleanup function
async def cleanup_websocket_service():
    """Clean up WebSocket service resources."""
    logger.info("Cleaning up WebSocket service...")
    
    # Stop background tasks
    await stop_background_tasks()
    
    # Cleanup hardware monitor
    if hardware_monitor:
        await hardware_monitor.cleanup()
        
    logger.info("WebSocket service cleanup completed")