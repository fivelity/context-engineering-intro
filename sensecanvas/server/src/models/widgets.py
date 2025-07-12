"""
SenseCanvas Widget Configuration Models
Pydantic models for widget configurations and dashboard layouts.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from enum import Enum

from pydantic import BaseModel, Field, validator


class WidgetType(str, Enum):
    """Supported widget types."""
    GAUGE = "gauge"
    GRAPH = "graph"
    TEXT = "text"
    MULTI_SENSOR = "multi-sensor"


class SensorType(str, Enum):
    """Supported sensor types for hardware monitoring."""
    CPU = "cpu"
    GPU = "gpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"


class ThemeType(str, Enum):
    """Supported theme types."""
    DEFAULT = "default"
    CYBERPUNK = "cyberpunk"
    GAMING = "gaming"
    MINIMAL = "minimal"
    RGB = "rgb"


class Position(BaseModel):
    """Widget position coordinates."""
    x: float = Field(..., ge=0, le=10000, description="X coordinate in pixels")
    y: float = Field(..., ge=0, le=10000, description="Y coordinate in pixels")


class Size(BaseModel):
    """Widget size dimensions."""
    width: float = Field(..., ge=100, le=800, description="Widget width in pixels")
    height: float = Field(..., ge=100, le=600, description="Widget height in pixels")


class WidgetStyle(BaseModel):
    """Widget styling configuration."""
    theme: ThemeType = Field(..., description="Widget theme")
    colors: List[str] = Field(..., min_items=1, max_items=10, description="Color palette (hex colors)")
    opacity: float = Field(..., ge=0, le=1, description="Widget opacity")
    borderRadius: float = Field(..., ge=0, le=50, description="Border radius in pixels")
    backgroundImage: Optional[str] = Field(None, description="Background image URL")
    fontSize: Optional[float] = Field(None, ge=8, le=48, description="Font size in pixels")
    fontFamily: Optional[str] = Field(None, description="Font family")
    borderWidth: Optional[float] = Field(None, ge=0, le=10, description="Border width in pixels")
    borderColor: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$", description="Border color")
    shadowEnabled: Optional[bool] = Field(None, description="Enable drop shadow")
    shadowColor: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$", description="Shadow color")
    shadowBlur: Optional[float] = Field(None, ge=0, le=20, description="Shadow blur radius")
    gradientEnabled: Optional[bool] = Field(None, description="Enable gradient background")
    gradientDirection: Optional[str] = Field(None, regex="^(horizontal|vertical|radial)$", description="Gradient direction")
    
    @validator('colors')
    def validate_colors(cls, colors):
        """Validate color hex codes."""
        import re
        hex_pattern = re.compile(r'^#[0-9A-Fa-f]{6}$')
        for color in colors:
            if not hex_pattern.match(color):
                raise ValueError(f"Invalid hex color: {color}")
        return colors


class AlertThresholds(BaseModel):
    """Alert threshold configuration."""
    warning: float = Field(..., ge=0, le=100, description="Warning threshold percentage")
    critical: float = Field(..., ge=0, le=100, description="Critical threshold percentage")
    
    @validator('critical')
    def validate_critical_higher(cls, critical, values):
        """Ensure critical threshold is higher than warning."""
        if 'warning' in values and critical <= values['warning']:
            raise ValueError("Critical threshold must be higher than warning threshold")
        return critical


class WidgetAlerts(BaseModel):
    """Widget alert configuration."""
    enabled: bool = Field(..., description="Enable alerts for this widget")
    thresholds: AlertThresholds = Field(..., description="Alert thresholds")
    showNotifications: Optional[bool] = Field(True, description="Show browser notifications")
    playSound: Optional[bool] = Field(False, description="Play sound on alerts")
    flashWidget: Optional[bool] = Field(True, description="Flash widget on alerts")


class GaugeConfig(BaseModel):
    """Gauge widget specific configuration."""
    minValue: float = Field(..., description="Minimum gauge value")
    maxValue: float = Field(..., description="Maximum gauge value")
    startAngle: float = Field(..., ge=-360, le=360, description="Start angle in degrees")
    endAngle: float = Field(..., ge=-360, le=360, description="End angle in degrees") 
    arcWidth: float = Field(..., ge=1, le=50, description="Arc width in pixels")
    showValue: bool = Field(..., description="Show numeric value")
    showLabel: bool = Field(..., description="Show label text")
    showTicks: bool = Field(..., description="Show tick marks")
    tickInterval: float = Field(..., ge=1, le=100, description="Tick mark interval")
    unit: str = Field(..., max_length=10, description="Unit of measurement")
    
    @validator('maxValue')
    def validate_max_greater_than_min(cls, max_value, values):
        """Ensure max value is greater than min value."""
        if 'minValue' in values and max_value <= values['minValue']:
            raise ValueError("Max value must be greater than min value")
        return max_value


class GraphConfig(BaseModel):
    """Graph widget specific configuration."""
    timeRange: int = Field(..., ge=1, le=1440, description="Time range in minutes")
    maxDataPoints: int = Field(..., ge=10, le=1000, description="Maximum data points to display")
    showGrid: bool = Field(..., description="Show grid lines")
    showAxes: bool = Field(..., description="Show axis labels")
    lineWidth: float = Field(..., ge=1, le=10, description="Line width in pixels")
    fillArea: bool = Field(..., description="Fill area under line")
    smoothing: bool = Field(..., description="Apply line smoothing")
    yAxisMin: Optional[float] = Field(None, description="Y-axis minimum value")
    yAxisMax: Optional[float] = Field(None, description="Y-axis maximum value")
    
    @validator('yAxisMax')
    def validate_y_axis_range(cls, y_max, values):
        """Validate Y-axis range."""
        if y_max is not None and 'yAxisMin' in values and values['yAxisMin'] is not None:
            if y_max <= values['yAxisMin']:
                raise ValueError("Y-axis max must be greater than min")
        return y_max


class TextConfig(BaseModel):
    """Text widget specific configuration."""
    format: str = Field(..., min_length=1, max_length=100, description="Text format string")
    fontSize: float = Field(..., ge=8, le=72, description="Font size in pixels")
    fontWeight: str = Field(..., regex="^(normal|bold|light)$", description="Font weight")
    alignment: str = Field(..., regex="^(left|center|right)$", description="Text alignment")
    showIcon: bool = Field(..., description="Show icon")
    iconPosition: str = Field(..., regex="^(left|right|top|bottom)$", description="Icon position")
    iconSize: float = Field(..., ge=8, le=64, description="Icon size in pixels")


class MultiSensorConfig(BaseModel):
    """Multi-sensor widget specific configuration."""
    sensors: List[SensorType] = Field(..., min_items=1, max_items=10, description="Sensor types to display")
    layout: str = Field(..., regex="^(grid|list|radial)$", description="Layout style")
    showLabels: bool = Field(..., description="Show sensor labels")
    showValues: bool = Field(..., description="Show sensor values")
    compactMode: bool = Field(..., description="Use compact display mode")


class WidgetConfig(BaseModel):
    """Complete widget configuration."""
    id: str = Field(..., min_length=1, max_length=100, description="Unique widget identifier")
    type: WidgetType = Field(..., description="Widget type")
    title: str = Field(..., min_length=1, max_length=50, description="Widget title")
    sensorType: SensorType = Field(..., description="Primary sensor type")
    position: Position = Field(..., description="Widget position")
    size: Size = Field(..., description="Widget size")
    style: WidgetStyle = Field(..., description="Widget styling")
    alerts: WidgetAlerts = Field(..., description="Alert configuration")
    
    # Type-specific configurations (only one should be present based on type)
    gaugeConfig: Optional[GaugeConfig] = Field(None, description="Gauge-specific configuration")
    graphConfig: Optional[GraphConfig] = Field(None, description="Graph-specific configuration")
    textConfig: Optional[TextConfig] = Field(None, description="Text-specific configuration")
    multiSensorConfig: Optional[MultiSensorConfig] = Field(None, description="Multi-sensor-specific configuration")
    
    # Metadata
    createdAt: int = Field(..., description="Creation timestamp in milliseconds")
    updatedAt: int = Field(..., description="Last update timestamp in milliseconds")
    version: str = Field(..., regex=r'^\d+\.\d+\.\d+$', description="Configuration version")
    tags: List[str] = Field(..., max_items=10, description="Widget tags")
    description: Optional[str] = Field(None, max_length=200, description="Widget description")
    author: Optional[str] = Field(None, max_length=50, description="Widget author")
    
    # Runtime state (not serialized to JSON exports)
    isSelected: Optional[bool] = Field(None, description="Whether widget is selected")
    isResizing: Optional[bool] = Field(None, description="Whether widget is being resized")
    isDragging: Optional[bool] = Field(None, description="Whether widget is being dragged")
    zIndex: Optional[int] = Field(None, ge=0, le=1000, description="Z-index for layering")
    
    @validator('updatedAt')
    def validate_updated_after_created(cls, updated_at, values):
        """Ensure updated timestamp is after created timestamp."""
        if 'createdAt' in values and updated_at < values['createdAt']:
            raise ValueError("Updated timestamp must be after created timestamp")
        return updated_at
    
    @validator('type')
    def validate_type_specific_config(cls, widget_type, values):
        """Ensure type-specific configuration is present based on widget type."""
        # This will be validated in a root_validator since we need access to all fields
        return widget_type
    
    @validator('tags')
    def validate_tags(cls, tags):
        """Validate tag format."""
        for tag in tags:
            if len(tag) > 20 or not tag.strip():
                raise ValueError("Tags must be non-empty and max 20 characters")
        return tags
    
    class Config:
        """Pydantic configuration."""
        
        use_enum_values = True
        schema_extra = {
            "example": {
                "id": "widget-cpu-gauge-001",
                "type": "gauge",
                "title": "CPU Usage",
                "sensorType": "cpu",
                "position": {"x": 100, "y": 100},
                "size": {"width": 200, "height": 200},
                "style": {
                    "theme": "cyberpunk",
                    "colors": ["#00ffff", "#ff006e"],
                    "opacity": 1.0,
                    "borderRadius": 8,
                    "fontSize": 14,
                    "fontFamily": "Orbitron"
                },
                "alerts": {
                    "enabled": True,
                    "thresholds": {
                        "warning": 75,
                        "critical": 90
                    },
                    "showNotifications": True,
                    "playSound": False,
                    "flashWidget": True
                },
                "gaugeConfig": {
                    "minValue": 0,
                    "maxValue": 100,
                    "startAngle": -135,
                    "endAngle": 135,
                    "arcWidth": 10,
                    "showValue": True,
                    "showLabel": True,
                    "showTicks": True,
                    "tickInterval": 20,
                    "unit": "%"
                },
                "createdAt": 1640995200000,
                "updatedAt": 1640995200000,
                "version": "1.0.0",
                "tags": ["cpu", "performance", "monitoring"],
                "description": "Real-time CPU usage monitoring gauge",
                "author": "SenseCanvas"
            }
        }


class GridSize(BaseModel):
    """Dashboard grid configuration."""
    cols: int = Field(..., ge=1, le=20, description="Number of grid columns")
    rows: int = Field(..., ge=1, le=20, description="Number of grid rows")
    cellSize: int = Field(..., ge=50, le=200, description="Grid cell size in pixels")


class DashboardLayout(BaseModel):
    """Complete dashboard layout configuration."""
    id: str = Field(..., min_length=1, max_length=100, description="Unique layout identifier")
    name: str = Field(..., min_length=1, max_length=50, description="Layout name")
    description: str = Field(..., max_length=200, description="Layout description")
    widgets: List[WidgetConfig] = Field(..., max_items=50, description="Widget configurations")
    gridSize: GridSize = Field(..., description="Grid configuration")
    theme: ThemeType = Field(..., description="Default theme")
    backgroundImage: Optional[str] = Field(None, description="Background image URL")
    backgroundColor: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$", description="Background color")
    
    # Metadata
    createdAt: int = Field(..., description="Creation timestamp in milliseconds")
    updatedAt: int = Field(..., description="Last update timestamp in milliseconds")
    version: str = Field(..., regex=r'^\d+\.\d+\.\d+$', description="Layout version")
    author: Optional[str] = Field(None, max_length=50, description="Layout author")
    tags: List[str] = Field(..., max_items=10, description="Layout tags")
    
    # Export/Import
    isPublic: bool = Field(..., description="Whether layout is public")
    shareKey: Optional[str] = Field(None, description="Sharing key for public layouts")
    
    @validator('widgets')
    def validate_widget_ids_unique(cls, widgets):
        """Ensure all widget IDs are unique within the layout."""
        widget_ids = [w.id for w in widgets]
        if len(widget_ids) != len(set(widget_ids)):
            raise ValueError("Widget IDs must be unique within a layout")
        return widgets
    
    class Config:
        """Pydantic configuration."""
        
        use_enum_values = True
        schema_extra = {
            "example": {
                "id": "layout-gaming-001",
                "name": "Gaming Dashboard",
                "description": "Optimized layout for gaming performance monitoring",
                "widgets": [],
                "gridSize": {
                    "cols": 12,
                    "rows": 8,
                    "cellSize": 80
                },
                "theme": "gaming",
                "backgroundColor": "#0a0a0a",
                "createdAt": 1640995200000,
                "updatedAt": 1640995200000,
                "version": "1.0.0",
                "author": "SenseCanvas",
                "tags": ["gaming", "performance", "rgb"],
                "isPublic": True,
                "shareKey": "gaming-dash-001"
            }
        }


class WidgetLibraryItem(BaseModel):
    """Widget library/preset item."""
    id: str = Field(..., min_length=1, max_length=100, description="Library item identifier")
    name: str = Field(..., min_length=1, max_length=50, description="Widget name")
    description: str = Field(..., min_length=1, max_length=200, description="Widget description")
    category: str = Field(..., min_length=1, max_length=30, description="Widget category")
    tags: List[str] = Field(..., max_items=10, description="Widget tags")
    thumbnail: str = Field(..., description="Thumbnail image URL or data URI")
    config: WidgetConfig = Field(..., description="Widget configuration")
    popularity: float = Field(..., ge=0, le=100, description="Popularity score")
    author: str = Field(..., max_length=50, description="Widget author")
    createdAt: int = Field(..., description="Creation timestamp")
    downloads: int = Field(..., ge=0, description="Download count")


class AiGenerationPrompt(BaseModel):
    """AI widget generation prompt and result."""
    id: str = Field(..., min_length=1, max_length=100, description="Prompt identifier")
    prompt: str = Field(..., min_length=10, max_length=500, description="User prompt")
    context: Dict[str, Any] = Field(..., description="Generation context")
    generatedConfig: Dict[str, Any] = Field(..., description="Generated widget configuration")
    rating: Optional[int] = Field(None, ge=1, le=5, description="User rating")
    createdAt: int = Field(..., description="Creation timestamp")


class WidgetExportData(BaseModel):
    """Widget configuration export data."""
    version: str = Field(..., regex=r'^\d+\.\d+\.\d+$', description="Export format version")
    exportedAt: int = Field(..., description="Export timestamp")
    exportedBy: Optional[str] = Field(None, max_length=50, description="Exporter name")
    widgets: List[WidgetConfig] = Field(..., min_items=1, max_items=50, description="Exported widgets")
    layout: Optional[DashboardLayout] = Field(None, description="Optional layout information")


class ConfigImportOptions(BaseModel):
    """Configuration import options."""
    preserveIds: Optional[bool] = Field(False, description="Preserve original widget IDs")
    replaceExisting: Optional[bool] = Field(False, description="Replace existing widgets with same IDs")
    validateCompatibility: Optional[bool] = Field(True, description="Validate version compatibility")