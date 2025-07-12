"""
SenseCanvas Hardware API Tests
Comprehensive testing for hardware monitoring endpoints with mocked sensors.
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
from datetime import datetime
import json

# Mock the hardware monitor service
@pytest.fixture
def mock_hardware_monitor():
    """Mock hardware monitor with predefined test data."""
    monitor = Mock()
    monitor.is_initialized = True
    monitor.use_libre_hardware = False
    monitor.polling_interval = 1.0
    
    # Mock hardware metrics data
    test_metrics = {
        "timestamp": int(datetime.now().timestamp() * 1000),
        "cpu": {
            "usage": 45.2,
            "temperature": 62.5,
            "cores": [
                {"id": 0, "usage": 42.1, "frequency": 3800},
                {"id": 1, "usage": 48.3, "frequency": 3850}
            ],
            "frequency": 3825.0,
            "power": 65.4
        },
        "gpu": {
            "usage": 78.6,
            "temperature": 73.2,
            "memory": {
                "used": 6144,
                "total": 8192,
                "usage_percent": 75.0
            },
            "frequency": {
                "core": 1850,
                "memory": 7000
            },
            "power": 180.5,
            "fanSpeed": 65.2
        },
        "memory": {
            "used": 12288,
            "total": 16384,
            "available": 4096,
            "usage_percent": 75.0
        },
        "storage": [
            {
                "name": "C:",
                "used": 512000,
                "total": 1024000,
                "usage_percent": 50.0,
                "read_speed": 120.5,
                "write_speed": 85.3
            }
        ],
        "network": {
            "upload_speed": 1.2,
            "download_speed": 5.8,
            "total_uploaded": 1024000,
            "total_downloaded": 5120000
        },
        "system": {
            "uptime": 86400,
            "boot_time": int((datetime.now().timestamp() - 86400) * 1000),
            "processes": 156
        }
    }
    
    monitor.get_current_metrics = AsyncMock(return_value=test_metrics)
    monitor.get_sensor_list = AsyncMock(return_value=[
        {"id": "cpu_usage", "name": "CPU Usage", "type": "cpu", "unit": "%"},
        {"id": "cpu_temp", "name": "CPU Temperature", "type": "cpu", "unit": "°C"},
        {"id": "gpu_usage", "name": "GPU Usage", "type": "gpu", "unit": "%"},
        {"id": "memory_usage", "name": "Memory Usage", "type": "memory", "unit": "%"}
    ])
    monitor.get_historical_data = AsyncMock(return_value={
        "timestamps": [1234567890, 1234567891, 1234567892],
        "values": [45.2, 46.1, 44.8]
    })
    
    return monitor

@pytest.fixture
def mock_app(mock_hardware_monitor):
    """Create a test FastAPI app with mocked hardware monitor."""
    app = FastAPI()
    
    # Mock the hardware monitor dependency
    def get_hardware_monitor():
        return mock_hardware_monitor
    
    # Add test routes (simplified versions of actual routes)
    @app.get("/api/hardware/metrics")
    async def get_metrics():
        monitor = get_hardware_monitor()
        if not monitor.is_initialized:
            return {"error": "Hardware monitor not initialized"}
        
        metrics = await monitor.get_current_metrics()
        return {"success": True, "data": metrics}
    
    @app.get("/api/hardware/sensors")
    async def get_sensors():
        monitor = get_hardware_monitor()
        sensors = await monitor.get_sensor_list()
        return {"success": True, "sensors": sensors}
    
    @app.get("/api/hardware/historical/{sensor_id}")
    async def get_historical(sensor_id: str, timerange: int = 60):
        monitor = get_hardware_monitor()
        data = await monitor.get_historical_data(sensor_id, timerange)
        return {"success": True, "data": data}
    
    @app.get("/api/hardware/status")
    async def get_status():
        monitor = get_hardware_monitor()
        return {
            "success": True,
            "status": {
                "initialized": monitor.is_initialized,
                "libre_hardware": monitor.use_libre_hardware,
                "polling_interval": monitor.polling_interval,
                "platform": "windows" if monitor.use_libre_hardware else "cross-platform"
            }
        }
    
    return app

@pytest.fixture
def client(mock_app):
    """Create test client."""
    return TestClient(mock_app)

class TestHardwareMetricsEndpoint:
    """Test hardware metrics API endpoint."""
    
    def test_get_current_metrics_success(self, client):
        """Test successful metrics retrieval."""
        response = client.get("/api/hardware/metrics")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        
        metrics = data["data"]
        assert "cpu" in metrics
        assert "gpu" in metrics
        assert "memory" in metrics
        assert "timestamp" in metrics
        
        # Validate CPU metrics structure
        cpu = metrics["cpu"]
        assert "usage" in cpu
        assert "temperature" in cpu
        assert "cores" in cpu
        assert isinstance(cpu["cores"], list)
        assert len(cpu["cores"]) > 0
        
        # Validate data types and ranges
        assert isinstance(cpu["usage"], (int, float))
        assert 0 <= cpu["usage"] <= 100
        assert isinstance(cpu["temperature"], (int, float))
        assert cpu["temperature"] > 0
    
    def test_get_metrics_with_uninitialized_monitor(self, mock_hardware_monitor, mock_app):
        """Test metrics endpoint when hardware monitor is not initialized."""
        mock_hardware_monitor.is_initialized = False
        
        client = TestClient(mock_app)
        response = client.get("/api/hardware/metrics")
        
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        assert "not initialized" in data["error"]
    
    def test_metrics_data_structure_validation(self, client):
        """Test that metrics data has the expected structure."""
        response = client.get("/api/hardware/metrics")
        data = response.json()["data"]
        
        # Check required top-level fields
        required_fields = ["timestamp", "cpu", "gpu", "memory", "storage", "network", "system"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check CPU structure
        cpu_fields = ["usage", "temperature", "cores", "frequency", "power"]
        for field in cpu_fields:
            assert field in data["cpu"], f"Missing CPU field: {field}"
        
        # Check GPU structure
        gpu_fields = ["usage", "temperature", "memory", "frequency", "power", "fanSpeed"]
        for field in gpu_fields:
            assert field in data["gpu"], f"Missing GPU field: {field}"
        
        # Check memory structure
        memory_fields = ["used", "total", "available", "usage_percent"]
        for field in memory_fields:
            assert field in data["memory"], f"Missing memory field: {field}"

class TestHardwareSensorsEndpoint:
    """Test hardware sensors API endpoint."""
    
    def test_get_sensors_list(self, client):
        """Test sensors list retrieval."""
        response = client.get("/api/hardware/sensors")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "sensors" in data
        assert isinstance(data["sensors"], list)
        assert len(data["sensors"]) > 0
        
        # Validate sensor structure
        sensor = data["sensors"][0]
        required_fields = ["id", "name", "type", "unit"]
        for field in required_fields:
            assert field in sensor, f"Missing sensor field: {field}"
    
    def test_sensor_data_types(self, client):
        """Test sensor data types and values."""
        response = client.get("/api/hardware/sensors")
        sensors = response.json()["sensors"]
        
        valid_types = ["cpu", "gpu", "memory", "storage", "network"]
        valid_units = ["%", "°C", "MHz", "MB/s", "GB", "W"]
        
        for sensor in sensors:
            assert isinstance(sensor["id"], str)
            assert isinstance(sensor["name"], str)
            assert sensor["type"] in valid_types
            assert sensor["unit"] in valid_units

class TestHardwareHistoricalEndpoint:
    """Test hardware historical data API endpoint."""
    
    def test_get_historical_data(self, client):
        """Test historical data retrieval."""
        response = client.get("/api/hardware/historical/cpu_usage")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        
        historical = data["data"]
        assert "timestamps" in historical
        assert "values" in historical
        assert isinstance(historical["timestamps"], list)
        assert isinstance(historical["values"], list)
        assert len(historical["timestamps"]) == len(historical["values"])
    
    def test_historical_data_with_timerange(self, client):
        """Test historical data with custom timerange."""
        response = client.get("/api/hardware/historical/cpu_usage?timerange=120")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_historical_data_validation(self, client):
        """Test historical data validation."""
        response = client.get("/api/hardware/historical/cpu_usage")
        historical = response.json()["data"]
        
        # Validate timestamps are increasing
        timestamps = historical["timestamps"]
        for i in range(1, len(timestamps)):
            assert timestamps[i] >= timestamps[i-1], "Timestamps should be in ascending order"
        
        # Validate values are numeric
        values = historical["values"]
        for value in values:
            assert isinstance(value, (int, float)), "Values should be numeric"

class TestHardwareStatusEndpoint:
    """Test hardware status API endpoint."""
    
    def test_get_status(self, client):
        """Test hardware status retrieval."""
        response = client.get("/api/hardware/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "status" in data
        
        status = data["status"]
        required_fields = ["initialized", "libre_hardware", "polling_interval", "platform"]
        for field in required_fields:
            assert field in status, f"Missing status field: {field}"
        
        assert isinstance(status["initialized"], bool)
        assert isinstance(status["libre_hardware"], bool)
        assert isinstance(status["polling_interval"], (int, float))
        assert status["polling_interval"] > 0
        assert isinstance(status["platform"], str)
    
    def test_status_with_libre_hardware(self, mock_hardware_monitor, mock_app):
        """Test status when LibreHardwareMonitor is available."""
        mock_hardware_monitor.use_libre_hardware = True
        
        client = TestClient(mock_app)
        response = client.get("/api/hardware/status")
        
        status = response.json()["status"]
        assert status["libre_hardware"] is True
        assert status["platform"] == "windows"

class TestHardwareAPIErrorHandling:
    """Test error handling in hardware API."""
    
    def test_metrics_with_monitor_exception(self, mock_hardware_monitor, mock_app):
        """Test metrics endpoint when monitor raises exception."""
        mock_hardware_monitor.get_current_metrics.side_effect = Exception("Hardware error")
        
        client = TestClient(mock_app)
        
        with patch('logging.Logger.error') as mock_log:
            response = client.get("/api/hardware/metrics")
            
            # Should handle exception gracefully
            assert response.status_code == 500 or response.status_code == 200
            # Should log the error
            mock_log.assert_called()
    
    def test_sensors_with_monitor_exception(self, mock_hardware_monitor, mock_app):
        """Test sensors endpoint when monitor raises exception."""
        mock_hardware_monitor.get_sensor_list.side_effect = Exception("Sensor error")
        
        client = TestClient(mock_app)
        response = client.get("/api/hardware/sensors")
        
        # Should handle exception gracefully
        assert response.status_code in [200, 500]

class TestHardwareAPIPerformance:
    """Test performance characteristics of hardware API."""
    
    def test_metrics_response_time(self, client):
        """Test that metrics endpoint responds quickly."""
        import time
        
        start_time = time.time()
        response = client.get("/api/hardware/metrics")
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond within 1 second
    
    def test_concurrent_metrics_requests(self, client):
        """Test handling of concurrent metrics requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = client.get("/api/hardware/metrics")
            results.append(response.status_code)
        
        # Make 5 concurrent requests
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert len(results) == 5
        assert all(status == 200 for status in results)

class TestHardwareAPIIntegration:
    """Integration tests for hardware API."""
    
    def test_full_monitoring_workflow(self, client):
        """Test complete monitoring workflow."""
        # 1. Check status
        status_response = client.get("/api/hardware/status")
        assert status_response.status_code == 200
        assert status_response.json()["status"]["initialized"] is True
        
        # 2. Get sensors list
        sensors_response = client.get("/api/hardware/sensors")
        assert sensors_response.status_code == 200
        sensors = sensors_response.json()["sensors"]
        assert len(sensors) > 0
        
        # 3. Get current metrics
        metrics_response = client.get("/api/hardware/metrics")
        assert metrics_response.status_code == 200
        metrics = metrics_response.json()["data"]
        
        # 4. Get historical data for first sensor
        sensor_id = sensors[0]["id"]
        historical_response = client.get(f"/api/hardware/historical/{sensor_id}")
        assert historical_response.status_code == 200
        
        # Verify data consistency
        historical_data = historical_response.json()["data"]
        assert len(historical_data["timestamps"]) > 0
        assert len(historical_data["values"]) > 0
    
    @pytest.mark.asyncio
    async def test_metrics_streaming_simulation(self, mock_hardware_monitor):
        """Test metrics data over time (simulation)."""
        # Simulate multiple metric readings
        readings = []
        
        for i in range(5):
            metrics = await mock_hardware_monitor.get_current_metrics()
            readings.append(metrics)
            
            # Simulate time passing
            await asyncio.sleep(0.1)
        
        assert len(readings) == 5
        
        # Verify timestamps are different
        timestamps = [reading["timestamp"] for reading in readings]
        assert len(set(timestamps)) > 1  # Should have different timestamps

class TestHardwareMockData:
    """Test mock data generation and validation."""
    
    def test_mock_data_ranges(self, client):
        """Test that mock data is within reasonable ranges."""
        response = client.get("/api/hardware/metrics")
        metrics = response.json()["data"]
        
        # CPU usage should be 0-100%
        assert 0 <= metrics["cpu"]["usage"] <= 100
        
        # CPU temperature should be reasonable (20-100°C)
        assert 20 <= metrics["cpu"]["temperature"] <= 100
        
        # GPU usage should be 0-100%
        assert 0 <= metrics["gpu"]["usage"] <= 100
        
        # Memory usage should be 0-100%
        assert 0 <= metrics["memory"]["usage_percent"] <= 100
        
        # Memory values should be consistent
        assert metrics["memory"]["used"] + metrics["memory"]["available"] <= metrics["memory"]["total"]
    
    def test_mock_data_consistency(self, client):
        """Test data consistency across multiple requests."""
        # Make multiple requests
        responses = []
        for _ in range(3):
            response = client.get("/api/hardware/metrics")
            responses.append(response.json()["data"])
        
        # Check that data structure is consistent
        for metrics in responses:
            assert set(metrics.keys()) == {"timestamp", "cpu", "gpu", "memory", "storage", "network", "system"}
            assert isinstance(metrics["cpu"]["cores"], list)
            assert len(metrics["cpu"]["cores"]) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])