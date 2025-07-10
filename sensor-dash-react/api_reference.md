# API Reference

This document provides a detailed reference for the backend API of the Sensor Dashboard. The backend is built using FastAPI and primarily communicates with the frontend via WebSockets for real-time hardware monitoring data.

## WebSocket API

The primary method of communication between the frontend and backend is through a WebSocket connection.

- **Endpoint**: `/ws`
- **Protocol**: WebSocket
- **Description**: This endpoint provides a continuous stream of real-time hardware sensor data from the server to connected clients.

### Messages

#### Server to Client

The server sends hardware metrics to the client at a regular interval (e.g., every second). The data is a JSON object that conforms to the `HardwareMetrics` Pydantic model, providing a structured representation of the system's current state.

**`HardwareMetrics` Model**

```python
from pydantic import BaseModel
from typing import List, Optional

class Sensor(BaseModel):
    name: str
    value: Optional[float]
    unit: Optional[str]

class HardwareComponent(BaseModel):
    name: str
    usage: Optional[float]
    temperature: Optional[float]
    sensors: List[Sensor] = []

class CpuMetrics(HardwareComponent):
    frequency: Optional[float]
    power: Optional[float]
    cores: List[HardwareComponent] = [] # For per-core usage/temp

class GpuMetrics(HardwareComponent):
    vram_usage: Optional[float]
    fan_speed: Optional[float]
    power: Optional[float]

class MemoryMetrics(BaseModel):
    total: Optional[float]
    used: Optional[float]
    available: Optional[float]
    usage: Optional[float]

class StorageMetrics(HardwareComponent):
    read_speed: Optional[float]
    write_speed: Optional[float]
    iops: Optional[float]

class NetworkMetrics(HardwareComponent):
    bandwidth_up: Optional[float]
    bandwidth_down: Optional[float]
    packets_sent: Optional[float]
    packets_received: Optional[float]

class HardwareMetrics(BaseModel):
    cpu: Optional[CpuMetrics]
    gpu: List[GpuMetrics] = []
    memory: Optional[MemoryMetrics]
    storage: List[StorageMetrics] = []
    network: List[NetworkMetrics] = []
    timestamp: float # Unix timestamp of when the data was collected
```

**Example JSON Payload (Server to Client)**

```json
{
  "cpu": {
    "name": "Intel Core i7-10700K",
    "usage": 25.5,
    "temperature": 65.2,
    "frequency": 4.8,
    "power": 85.1,
    "sensors": [
      {"name": "Core #1 Temp", "value": 63.5, "unit": "°C"},
      {"name": "Core #2 Temp", "value": 66.1, "unit": "°C"}
    ],
    "cores": [
      {"name": "Core #1", "usage": 30.1},
      {"name": "Core #2", "usage": 28.7}
    ]
  },
  "gpu": [
    {
      "name": "NVIDIA GeForce RTX 3070",
      "usage": 75.0,
      "temperature": 72.0,
      "vram_usage": 6.5,
      "fan_speed": 60.0,
      "power": 220.5,
      "sensors": [
        {"name": "GPU Core Clock", "value": 1800.0, "unit": "MHz"}
      ]
    }
  ],
  "memory": {
    "total": 32.0,
    "used": 18.5,
    "available": 13.5,
    "usage": 57.8
  },
  "storage": [
    {
      "name": "NVMe SSD (C:)",
      "usage": 45.0,
      "temperature": 40.0,
      "read_speed": 500.0,
      "write_speed": 300.0,
      "iops": 5000.0,
      "sensors": []
    }
  ],
  "network": [
    {
      "name": "Ethernet",
      "bandwidth_up": 10.5,
      "bandwidth_down": 80.2,
      "packets_sent": 12345.0,
      "packets_received": 67890.0,
      "sensors": []
    }
  ],
  "timestamp": 1678886400.0
}
```

#### Client to Server

At present, the client does not send any messages to the server via the WebSocket connection for hardware monitoring. All data flow is unidirectional from the server to the client. Future enhancements might include client-initiated requests for historical data or configuration changes.

## HTTP REST API (Future/Limited)

Currently, the primary data exchange is via WebSockets. Any HTTP REST API endpoints would be for specific, non-realtime operations such as:

-   **`/api/config`**: For loading/saving dashboard configurations (if not handled via WebSocket or local storage).
-   **`/api/status`**: For basic server health checks.

These endpoints are not yet fully defined or implemented in the current scope but represent potential areas for future expansion.