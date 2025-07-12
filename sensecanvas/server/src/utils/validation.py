"""
SenseCanvas Server Validation Utilities
Server-side validation helpers for data integrity and security
"""

import re
import json
import logging
from typing import Any, Dict, List, Optional, Union, Tuple
from datetime import datetime
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


def validate_json_string(json_str: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """Validate and parse JSON string."""
    try:
        data = json.loads(json_str)
        if isinstance(data, dict):
            return True, data
        return False, None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON: {e}")
        return False, None


def validate_widget_id(widget_id: str) -> bool:
    """Validate widget ID format."""
    # Widget ID should be alphanumeric with hyphens, 1-100 chars
    pattern = r'^[a-zA-Z0-9\-_]{1,100}$'
    return bool(re.match(pattern, widget_id))


def validate_theme_id(theme_id: str) -> bool:
    """Validate theme ID format."""
    valid_themes = ['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']
    return theme_id in valid_themes


def validate_sensor_type(sensor_type: str) -> bool:
    """Validate sensor type."""
    valid_types = ['cpu', 'gpu', 'memory', 'storage', 'network', 'system']
    return sensor_type in valid_types


def validate_color_hex(color: str) -> bool:
    """Validate hex color format."""
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(pattern, color))


def validate_position(position: Dict[str, Any]) -> bool:
    """Validate widget position."""
    if not isinstance(position, dict):
        return False
    
    x = position.get('x')
    y = position.get('y')
    
    if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
        return False
    
    # Position should be non-negative
    return x >= 0 and y >= 0


def validate_size(size: Dict[str, Any], min_width: int = 100, min_height: int = 100) -> bool:
    """Validate widget size."""
    if not isinstance(size, dict):
        return False
    
    width = size.get('width')
    height = size.get('height')
    
    if not isinstance(width, (int, float)) or not isinstance(height, (int, float)):
        return False
    
    return width >= min_width and height >= min_height


def validate_percentage(value: Any) -> bool:
    """Validate percentage value (0-100)."""
    if not isinstance(value, (int, float)):
        return False
    return 0 <= value <= 100


def validate_temperature(value: Any) -> bool:
    """Validate temperature value."""
    if not isinstance(value, (int, float)):
        return False
    # Reasonable temperature range: -50°C to 150°C
    return -50 <= value <= 150


def validate_timestamp(timestamp: Any) -> bool:
    """Validate Unix timestamp in milliseconds."""
    if not isinstance(timestamp, int):
        return False
    
    # Check if timestamp is reasonable (not too far in past/future)
    now = int(datetime.now().timestamp() * 1000)
    # Allow 1 day tolerance
    tolerance = 24 * 60 * 60 * 1000
    
    return abs(timestamp - now) <= tolerance


def sanitize_string(value: str, max_length: int = 255, allow_html: bool = False) -> str:
    """Sanitize string input."""
    if not isinstance(value, str):
        return ""
    
    # Trim to max length
    value = value[:max_length]
    
    # Remove null bytes
    value = value.replace('\x00', '')
    
    # Strip control characters
    value = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
    
    if not allow_html:
        # Basic HTML escaping
        value = value.replace('<', '&lt;').replace('>', '&gt;')
        value = value.replace('"', '&quot;').replace("'", '&#x27;')
    
    return value.strip()


def sanitize_widget_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize widget configuration."""
    sanitized = {}
    
    # Required fields
    if 'id' in config:
        sanitized['id'] = sanitize_string(config['id'], max_length=100)
    
    if 'type' in config:
        widget_type = config['type']
        if widget_type in ['gauge', 'graph', 'text', 'multi-sensor']:
            sanitized['type'] = widget_type
    
    if 'title' in config:
        sanitized['title'] = sanitize_string(config['title'], max_length=50)
    
    if 'sensorType' in config and validate_sensor_type(config['sensorType']):
        sanitized['sensorType'] = config['sensorType']
    
    # Position and size
    if 'position' in config and validate_position(config['position']):
        sanitized['position'] = config['position']
    
    if 'size' in config and validate_size(config['size']):
        sanitized['size'] = config['size']
    
    # Style
    if 'style' in config and isinstance(config['style'], dict):
        style = {}
        
        if 'theme' in config['style'] and validate_theme_id(config['style']['theme']):
            style['theme'] = config['style']['theme']
        
        if 'colors' in config['style'] and isinstance(config['style']['colors'], list):
            style['colors'] = [
                color for color in config['style']['colors']
                if validate_color_hex(color)
            ][:10]  # Max 10 colors
        
        if 'opacity' in config['style']:
            opacity = config['style']['opacity']
            if isinstance(opacity, (int, float)) and 0 <= opacity <= 1:
                style['opacity'] = opacity
        
        sanitized['style'] = style
    
    return sanitized


def validate_pydantic_model(model_class: type[BaseModel], data: Dict[str, Any]) -> Tuple[bool, Optional[BaseModel], Optional[List[str]]]:
    """Validate data against a Pydantic model."""
    try:
        instance = model_class(**data)
        return True, instance, None
    except ValidationError as e:
        errors = [f"{err['loc']}: {err['msg']}" for err in e.errors()]
        return False, None, errors


def validate_file_size(size_bytes: int, max_size_mb: int = 10) -> bool:
    """Validate file size."""
    max_size_bytes = max_size_mb * 1024 * 1024
    return 0 < size_bytes <= max_size_bytes


def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate file extension."""
    if not filename:
        return False
    
    extension = filename.rsplit('.', 1)[-1].lower()
    return extension in allowed_extensions


def rate_limit_check(
    client_id: str,
    action: str,
    limit: int,
    window_seconds: int,
    tracker: Dict[str, List[float]]
) -> bool:
    """Check if action is within rate limit."""
    now = datetime.now().timestamp()
    key = f"{client_id}:{action}"
    
    if key not in tracker:
        tracker[key] = []
    
    # Remove old entries outside the window
    tracker[key] = [
        timestamp for timestamp in tracker[key]
        if now - timestamp < window_seconds
    ]
    
    # Check if within limit
    if len(tracker[key]) >= limit:
        return False
    
    # Add current timestamp
    tracker[key].append(now)
    return True


def validate_dashboard_layout(layout: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate complete dashboard layout."""
    errors = []
    
    # Check required fields
    required_fields = ['id', 'name', 'widgets']
    for field in required_fields:
        if field not in layout:
            errors.append(f"Missing required field: {field}")
    
    # Validate widgets
    if 'widgets' in layout:
        if not isinstance(layout['widgets'], list):
            errors.append("Widgets must be a list")
        else:
            # Check for duplicate widget IDs
            widget_ids = [w.get('id') for w in layout['widgets'] if isinstance(w, dict)]
            if len(widget_ids) != len(set(widget_ids)):
                errors.append("Duplicate widget IDs found")
            
            # Validate each widget
            for i, widget in enumerate(layout['widgets']):
                if not isinstance(widget, dict):
                    errors.append(f"Widget {i} is not a valid object")
                    continue
                
                if not validate_widget_id(widget.get('id', '')):
                    errors.append(f"Widget {i} has invalid ID")
    
    # Validate grid size if present
    if 'gridSize' in layout:
        grid = layout['gridSize']
        if not isinstance(grid, dict):
            errors.append("Grid size must be an object")
        else:
            for field in ['cols', 'rows', 'cellSize']:
                if field not in grid or not isinstance(grid[field], (int, float)):
                    errors.append(f"Invalid grid {field}")
    
    return len(errors) == 0, errors


def clean_sensor_name(name: str) -> str:
    """Clean and normalize sensor names."""
    # Remove special characters and normalize
    cleaned = re.sub(r'[^\w\s\-]', '', name)
    # Replace multiple spaces with single space
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()


def validate_alert_config(config: Dict[str, Any]) -> bool:
    """Validate alert configuration."""
    if not isinstance(config, dict):
        return False
    
    # Check enabled flag
    if 'enabled' not in config or not isinstance(config['enabled'], bool):
        return False
    
    # Check thresholds
    if 'thresholds' in config:
        thresholds = config['thresholds']
        if not isinstance(thresholds, dict):
            return False
        
        warning = thresholds.get('warning')
        critical = thresholds.get('critical')
        
        if warning is not None:
            if not isinstance(warning, (int, float)) or warning < 0:
                return False
        
        if critical is not None:
            if not isinstance(critical, (int, float)) or critical < 0:
                return False
        
        # Warning should be less than critical
        if warning is not None and critical is not None and warning >= critical:
            return False
    
    return True