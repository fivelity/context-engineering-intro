"""
SenseCanvas API Response Models
Pydantic models for standardized API responses.
"""

from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

# Generic type for response data
DataT = TypeVar('DataT')


class APIResponse(GenericModel, Generic[DataT]):
    """Standardized API response format."""
    
    success: bool = Field(..., description="Whether the request was successful")
    data: Optional[DataT] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Response message")
    timestamp: int = Field(..., description="Response timestamp in milliseconds")
    requestId: Optional[str] = Field(None, description="Request tracking ID")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {},
                "message": "Request completed successfully",
                "timestamp": 1640995200000,
                "requestId": "req-123-456-789"
            }
        }


class ErrorDetail(BaseModel):
    """Detailed error information."""
    
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    field: Optional[str] = Field(None, description="Field that caused the error")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class ErrorResponse(BaseModel):
    """Error response format."""
    
    success: bool = Field(False, description="Always false for error responses")
    error: ErrorDetail = Field(..., description="Error details")
    timestamp: int = Field(..., description="Error timestamp in milliseconds")
    requestId: Optional[str] = Field(None, description="Request tracking ID")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid widget configuration",
                    "field": "style.colors",
                    "details": {"invalidColor": "#gggggg"}
                },
                "timestamp": 1640995200000,
                "requestId": "req-123-456-789"
            }
        }


class ValidationErrorResponse(BaseModel):
    """Validation error response with multiple errors."""
    
    success: bool = Field(False, description="Always false for error responses")
    errors: List[ErrorDetail] = Field(..., description="List of validation errors")
    timestamp: int = Field(..., description="Error timestamp in milliseconds")
    requestId: Optional[str] = Field(None, description="Request tracking ID")


class HealthCheckResponse(BaseModel):
    """Health check endpoint response."""
    
    status: str = Field(..., description="Health status")
    timestamp: int = Field(..., description="Health check timestamp")
    version: str = Field(..., description="Application version")
    uptime: int = Field(..., description="Uptime in seconds")
    activeConnections: int = Field(..., ge=0, description="Number of active WebSocket connections")
    hardwareMonitorStatus: str = Field(..., description="Hardware monitor status")
    lastMetricsUpdate: Optional[int] = Field(None, description="Last metrics update timestamp")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": 1640995200000,
                "version": "1.0.0",
                "uptime": 86400,
                "activeConnections": 5,
                "hardwareMonitorStatus": "active",
                "lastMetricsUpdate": 1640995199000
            }
        }


class MetricsResponse(APIResponse[Dict[str, Any]]):
    """Hardware metrics API response."""
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "timestamp": 1640995200000,
                    "cpu": {"usage": 45.2, "temperature": 65.0},
                    "gpu": {"usage": 85.0, "temperature": 72.0},
                    "memory": {"usage": 68.0, "used": 10987, "total": 16384}
                },
                "message": "Hardware metrics retrieved successfully",
                "timestamp": 1640995200000,
                "requestId": "req-metrics-001"
            }
        }


class WebSocketMessage(BaseModel):
    """WebSocket message format."""
    
    type: str = Field(..., description="Message type")
    timestamp: int = Field(..., description="Message timestamp")
    data: Optional[Dict[str, Any]] = Field(None, description="Message data")
    clientId: Optional[str] = Field(None, description="Client identifier")
    subscriptionType: Optional[str] = Field(None, description="Subscription type")
    message: Optional[str] = Field(None, description="Text message")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "type": "hardware_metrics",
                "timestamp": 1640995200000,
                "data": {
                    "cpu": {"usage": 45.2},
                    "gpu": {"usage": 85.0}
                },
                "clientId": "client-123",
                "subscriptionType": "hardware_metrics"
            }
        }


class ConnectionEstablishedMessage(WebSocketMessage):
    """WebSocket connection established message."""
    
    type: str = Field("connection_established", const=True)
    clientId: str = Field(..., description="Assigned client ID")


class SubscriptionConfirmedMessage(WebSocketMessage):
    """WebSocket subscription confirmed message."""
    
    type: str = Field("subscription_confirmed", const=True)
    subscriptionType: str = Field(..., description="Confirmed subscription type")


class HardwareMetricsMessage(WebSocketMessage):
    """Hardware metrics WebSocket message."""
    
    type: str = Field("hardware_metrics", const=True)
    data: Dict[str, Any] = Field(..., description="Hardware metrics data")


class AlertsMessage(WebSocketMessage):
    """Hardware alerts WebSocket message."""
    
    type: str = Field("alerts", const=True)
    alerts: List[Dict[str, Any]] = Field(..., description="Alert information")


class ErrorMessage(WebSocketMessage):
    """Error WebSocket message."""
    
    type: str = Field("error", const=True)
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class PingMessage(WebSocketMessage):
    """Ping WebSocket message."""
    
    type: str = Field("ping", const=True)


class PongMessage(WebSocketMessage):
    """Pong WebSocket message."""
    
    type: str = Field("pong", const=True)


class AiGenerationRequest(BaseModel):
    """AI widget generation request."""
    
    prompt: str = Field(..., min_length=10, max_length=500, description="Widget generation prompt")
    context: Optional[Dict[str, Any]] = Field(None, description="Generation context")
    options: Optional[Dict[str, Any]] = Field(None, description="Generation options")


class AiGenerationResponse(APIResponse[Dict[str, Any]]):
    """AI widget generation response."""
    
    confidence: Optional[float] = Field(None, ge=0, le=1, description="Generation confidence score")
    suggestions: Optional[List[str]] = Field(None, description="Additional suggestions")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "id": "ai-widget-001",
                    "type": "gauge",
                    "title": "CPU Temperature",
                    "config": {}
                },
                "message": "Widget generated successfully",
                "timestamp": 1640995200000,
                "confidence": 0.95,
                "suggestions": [
                    "Consider adding temperature alerts",
                    "Try a gradient color scheme"
                ]
            }
        }


class WidgetConfigResponse(APIResponse[Dict[str, Any]]):
    """Widget configuration response."""
    
    validationErrors: Optional[List[ErrorDetail]] = Field(None, description="Validation errors")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "id": "widget-001",
                    "type": "gauge",
                    "title": "CPU Usage",
                    "valid": True
                },
                "message": "Widget configuration valid",
                "timestamp": 1640995200000,
                "validationErrors": []
            }
        }


class ExportResponse(APIResponse[Dict[str, Any]]):
    """Configuration export response."""
    
    downloadUrl: Optional[str] = Field(None, description="Download URL for exported file")
    fileName: Optional[str] = Field(None, description="Generated file name")
    fileSize: Optional[int] = Field(None, description="File size in bytes")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "version": "1.0.0",
                    "widgets": [],
                    "layout": {}
                },
                "message": "Configuration exported successfully",
                "timestamp": 1640995200000,
                "downloadUrl": "/api/download/export-123.json",
                "fileName": "sensecanvas-export-2024-01-01.json",
                "fileSize": 4096
            }
        }


class ImportResponse(APIResponse[Dict[str, Any]]):
    """Configuration import response."""
    
    importedCount: int = Field(..., ge=0, description="Number of items imported")
    skippedCount: int = Field(..., ge=0, description="Number of items skipped")
    errorCount: int = Field(..., ge=0, description="Number of items with errors")
    warnings: Optional[List[str]] = Field(None, description="Import warnings")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "widgets": [],
                    "layout": {}
                },
                "message": "Configuration imported successfully",
                "timestamp": 1640995200000,
                "importedCount": 5,
                "skippedCount": 1,
                "errorCount": 0,
                "warnings": ["Widget 'old-gauge' uses deprecated configuration"]
            }
        }


class ThemeResponse(APIResponse[Dict[str, Any]]):
    """Theme configuration response."""
    
    availableThemes: List[str] = Field(..., description="Available theme names")
    currentTheme: str = Field(..., description="Currently active theme")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "theme": "cyberpunk",
                    "colors": {},
                    "settings": {}
                },
                "message": "Theme applied successfully",
                "timestamp": 1640995200000,
                "availableThemes": ["default", "cyberpunk", "gaming", "minimal", "rgb"],
                "currentTheme": "cyberpunk"
            }
        }


class ConnectionsResponse(APIResponse[Dict[str, Any]]):
    """WebSocket connections information response."""
    
    activeConnections: int = Field(..., ge=0, description="Number of active connections")
    totalConnections: int = Field(..., ge=0, description="Total connections since startup")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "connections": [
                        {
                            "clientId": "client-123",
                            "connectedAt": "2024-01-01T12:00:00Z",
                            "subscriptions": ["hardware_metrics", "alerts"]
                        }
                    ]
                },
                "message": "Connections retrieved successfully",
                "timestamp": 1640995200000,
                "activeConnections": 5,
                "totalConnections": 127
            }
        }