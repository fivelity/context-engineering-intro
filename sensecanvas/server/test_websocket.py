#!/usr/bin/env python3
"""
SenseCanvas WebSocket Test Client
Test script to verify WebSocket functionality and hardware data streaming.
"""

import asyncio
import json
import logging
import sys
from pathlib import Path

import websockets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_websocket_connection():
    """Test basic WebSocket connection and message exchange."""
    uri = "ws://localhost:8000/ws"
    
    try:
        logger.info(f"Connecting to {uri}...")
        
        async with websockets.connect(uri) as websocket:
            logger.info("✅ Connected to SenseCanvas WebSocket server")
            
            # Wait for connection confirmation
            initial_message = await websocket.recv()
            initial_data = json.loads(initial_message)
            logger.info(f"Initial message: {initial_data}")
            
            # Test subscription to hardware metrics
            subscribe_message = {
                "type": "subscribe",
                "subscription_type": "hardware_metrics"
            }
            await websocket.send(json.dumps(subscribe_message))
            logger.info("📡 Subscribed to hardware_metrics")
            
            # Wait for subscription confirmation
            confirm_message = await websocket.recv()
            confirm_data = json.loads(confirm_message)
            logger.info(f"Subscription confirmed: {confirm_data}")
            
            # Test getting current metrics
            metrics_request = {
                "type": "get_current_metrics"
            }
            await websocket.send(json.dumps(metrics_request))
            logger.info("📊 Requested current metrics")
            
            # Listen for a few messages
            message_count = 0
            max_messages = 5
            
            while message_count < max_messages:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(message)
                    message_type = data.get('type')
                    
                    if message_type == 'hardware_metrics':
                        logger.info("📈 Received hardware metrics")
                        # Print basic CPU and memory info
                        metrics_data = data.get('data', {})
                        cpu = metrics_data.get('cpu', {})
                        memory = metrics_data.get('memory', {})
                        logger.info(f"  CPU Usage: {cpu.get('usage', 0):.1f}%")
                        logger.info(f"  Memory Usage: {memory.get('usage', 0):.1f}%")
                        
                    elif message_type == 'current_metrics':
                        logger.info("📊 Received current metrics response")
                        
                    elif message_type == 'alerts':
                        alerts = data.get('alerts', [])
                        logger.info(f"🚨 Received {len(alerts)} alerts")
                        
                    elif message_type == 'ping':
                        # Respond to ping with pong
                        pong_message = {"type": "ping"}
                        await websocket.send(json.dumps(pong_message))
                        logger.info("🏓 Responded to ping")
                        
                    else:
                        logger.info(f"📨 Received message type: {message_type}")
                    
                    message_count += 1
                    
                except asyncio.TimeoutError:
                    logger.warning("⏰ Timeout waiting for message")
                    break
                    
            # Test subscription to alerts
            alert_subscribe = {
                "type": "subscribe",
                "subscription_type": "alerts"
            }
            await websocket.send(json.dumps(alert_subscribe))
            logger.info("🚨 Subscribed to alerts")
            
            # Test ping/pong
            ping_message = {"type": "ping"}
            await websocket.send(json.dumps(ping_message))
            logger.info("🏓 Sent ping")
            
            # Wait for pong
            pong_response = await websocket.recv()
            pong_data = json.loads(pong_response)
            if pong_data.get('type') == 'pong':
                logger.info("✅ Received pong response")
            
            logger.info("✅ WebSocket test completed successfully")
            
    except websockets.exceptions.ConnectionRefused:
        logger.error("❌ Could not connect to WebSocket server")
        logger.info("Make sure the SenseCanvas server is running on port 8000")
        return False
        
    except Exception as e:
        logger.error(f"❌ WebSocket test failed: {e}")
        return False
        
    return True


async def test_http_endpoints():
    """Test HTTP API endpoints."""
    import httpx
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient() as client:
            # Test health endpoint
            health_response = await client.get(f"{base_url}/health")
            if health_response.status_code == 200:
                logger.info("✅ Health endpoint working")
                health_data = health_response.json()
                logger.info(f"  Status: {health_data.get('status')}")
                logger.info(f"  Connections: {health_data.get('active_connections')}")
            else:
                logger.error(f"❌ Health endpoint failed: {health_response.status_code}")
                
            # Test metrics endpoint
            metrics_response = await client.get(f"{base_url}/api/metrics")
            if metrics_response.status_code == 200:
                logger.info("✅ Metrics endpoint working")
            else:
                logger.error(f"❌ Metrics endpoint failed: {metrics_response.status_code}")
                
            # Test root endpoint
            root_response = await client.get(f"{base_url}/")
            if root_response.status_code == 200:
                logger.info("✅ Root endpoint working")
                root_data = root_response.json()
                logger.info(f"  Server: {root_data.get('message')}")
            else:
                logger.error(f"❌ Root endpoint failed: {root_response.status_code}")
                
    except Exception as e:
        logger.error(f"❌ HTTP test failed: {e}")
        return False
        
    return True


async def main():
    """Main test function."""
    print("🧪 SenseCanvas WebSocket Test Suite")
    print("="*50)
    
    # Test HTTP endpoints first
    logger.info("Testing HTTP endpoints...")
    http_success = await test_http_endpoints()
    
    if not http_success:
        logger.error("❌ HTTP tests failed - skipping WebSocket tests")
        return
    
    # Test WebSocket connection
    logger.info("Testing WebSocket connection...")
    websocket_success = await test_websocket_connection()
    
    if websocket_success:
        logger.info("🎉 All tests passed!")
    else:
        logger.error("❌ Some tests failed")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Test interrupted by user")
    except Exception as e:
        logger.error(f"❌ Test suite error: {e}")
        sys.exit(1)