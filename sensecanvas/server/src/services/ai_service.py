"""
SenseCanvas AI Generation Service
Google Genkit integration for widget and layout generation with rate limiting and caching.
"""

import asyncio
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import hashlib
import logging
from pydantic import BaseModel, Field

# For production, use actual Genkit imports
# from genkit import genkit, generate
# from genkit.models import gemini15Pro

# Mock implementation for development/testing
class MockGenkitResponse:
    def __init__(self, text: str):
        self.text = text

logger = logging.getLogger(__name__)

class PromptContext(BaseModel):
    """Context for AI generation requests."""
    user_id: str = Field(default="anonymous", description="User identifier for rate limiting")
    timestamp: int = Field(default_factory=lambda: int(time.time() * 1000))
    user_preferences: Dict[str, Any] = Field(default_factory=dict)
    session_id: Optional[str] = Field(default=None)
    existing_widgets: List[Dict[str, Any]] = Field(default_factory=list)

class GenerationRequest(BaseModel):
    """Request model for AI generation."""
    prompt: str = Field(..., min_length=10, max_length=500, description="User prompt for generation")
    context: PromptContext = Field(default_factory=PromptContext)
    generation_type: str = Field(default="widget", description="Type of generation: widget or layout")

class GenerationResponse(BaseModel):
    """Response model for AI generation."""
    widget: Dict[str, Any] = Field(..., description="Generated widget configuration")
    confidence: float = Field(..., ge=0, le=1, description="Generation confidence score")
    reasoning: str = Field(..., description="Explanation of generation choices")
    alternatives: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RateLimitEntry(BaseModel):
    """Rate limiting entry."""
    last_request: float
    request_count: int
    window_start: float

class AiWidgetService:
    """AI-powered widget generation service using Google Genkit."""
    
    def __init__(self, rate_limit_window: int = 600, max_requests_per_window: int = 10):
        self.rate_limit_window = rate_limit_window  # 10 minutes
        self.max_requests_per_window = max_requests_per_window
        self.rate_limiter: Dict[str, RateLimitEntry] = {}
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = 3600  # 1 hour cache TTL
        
        # Widget generation templates for prompt engineering
        self.widget_templates = {
            "gauge": {
                "base_config": {
                    "type": "gauge",
                    "size": {"width": 200, "height": 200},
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
                    }
                },
                "style_variations": {
                    "gaming": {
                        "theme": "gaming",
                        "colors": ["#22c55e", "#eab308", "#dc2626"],
                        "borderRadius": 16
                    },
                    "cyberpunk": {
                        "theme": "cyberpunk", 
                        "colors": ["#a855f7", "#ec4899", "#06b6d4"],
                        "borderRadius": 8
                    },
                    "minimal": {
                        "theme": "minimal",
                        "colors": ["#6b7280", "#f59e0b", "#ef4444"],
                        "borderRadius": 4
                    }
                }
            },
            "graph": {
                "base_config": {
                    "type": "graph",
                    "size": {"width": 400, "height": 200},
                    "graphConfig": {
                        "timeRange": 60,
                        "maxDataPoints": 120,
                        "showGrid": True,
                        "showAxes": True,
                        "lineWidth": 2,
                        "fillArea": True,
                        "smoothing": True,
                        "yAxisMin": 0,
                        "yAxisMax": 100
                    }
                }
            },
            "text": {
                "base_config": {
                    "type": "text",
                    "size": {"width": 180, "height": 80},
                    "textConfig": {
                        "format": "{value}%",
                        "fontSize": 18,
                        "fontWeight": "bold",
                        "alignment": "center",
                        "showIcon": True,
                        "iconPosition": "left",
                        "iconSize": 24
                    }
                }
            },
            "multi-sensor": {
                "base_config": {
                    "type": "multi-sensor",
                    "size": {"width": 300, "height": 250},
                    "multiSensorConfig": {
                        "sensors": ["cpu", "gpu", "memory"],
                        "layout": "grid",
                        "showLabels": True,
                        "showValues": True,
                        "compactMode": False
                    }
                }
            }
        }
        
        logger.info("AI Widget Service initialized with rate limiting and caching")

    def _is_rate_limited(self, user_id: str) -> bool:
        """Check if user has exceeded rate limits."""
        current_time = time.time()
        
        if user_id not in self.rate_limiter:
            self.rate_limiter[user_id] = RateLimitEntry(
                last_request=current_time,
                request_count=0,
                window_start=current_time
            )
            return False
        
        entry = self.rate_limiter[user_id]
        
        # Reset window if expired
        if current_time - entry.window_start > self.rate_limit_window:
            entry.window_start = current_time
            entry.request_count = 0
        
        # Check if within limits
        if entry.request_count >= self.max_requests_per_window:
            time_until_reset = self.rate_limit_window - (current_time - entry.window_start)
            logger.warning(f"Rate limit exceeded for user {user_id}. Reset in {time_until_reset:.1f}s")
            return True
        
        return False

    def _update_rate_limit(self, user_id: str) -> None:
        """Update rate limit counters."""
        current_time = time.time()
        if user_id in self.rate_limiter:
            self.rate_limiter[user_id].last_request = current_time
            self.rate_limiter[user_id].request_count += 1

    def _get_cache_key(self, prompt: str, context: PromptContext) -> str:
        """Generate cache key for request."""
        cache_data = {
            "prompt": prompt.lower().strip(),
            "preferences": context.user_preferences,
            "generation_type": getattr(context, 'generation_type', 'widget')
        }
        return hashlib.md5(json.dumps(cache_data, sort_keys=True).encode()).hexdigest()

    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid."""
        return time.time() - cache_entry.get("timestamp", 0) < self.cache_ttl

    def _extract_widget_type_from_prompt(self, prompt: str) -> str:
        """Extract the intended widget type from user prompt."""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ["gauge", "circular", "dial", "meter", "progress"]):
            return "gauge"
        elif any(word in prompt_lower for word in ["graph", "chart", "timeline", "history", "line"]):
            return "graph"
        elif any(word in prompt_lower for word in ["text", "display", "label", "readout", "number"]):
            return "text"
        elif any(word in prompt_lower for word in ["multi", "multiple", "system", "overview", "dashboard"]):
            return "multi-sensor"
        else:
            # Default based on sensor type mentions
            if any(word in prompt_lower for word in ["cpu", "processor"]):
                return "gauge"
            elif any(word in prompt_lower for word in ["temperature", "temp"]):
                return "gauge"
            else:
                return "gauge"  # Default fallback

    def _extract_sensor_type_from_prompt(self, prompt: str) -> str:
        """Extract the sensor type from user prompt."""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ["cpu", "processor", "core"]):
            return "cpu"
        elif any(word in prompt_lower for word in ["gpu", "graphics", "video", "vram"]):
            return "gpu"
        elif any(word in prompt_lower for word in ["memory", "ram"]):
            return "memory"
        elif any(word in prompt_lower for word in ["storage", "disk", "ssd", "hdd"]):
            return "storage"
        elif any(word in prompt_lower for word in ["network", "bandwidth", "internet"]):
            return "network"
        else:
            return "cpu"  # Default fallback

    def _extract_theme_from_prompt(self, prompt: str) -> str:
        """Extract theme preference from user prompt."""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ["gaming", "rgb", "colorful", "bright"]):
            return "gaming"
        elif any(word in prompt_lower for word in ["cyberpunk", "neon", "futuristic", "sci-fi"]):
            return "cyberpunk"
        elif any(word in prompt_lower for word in ["minimal", "clean", "simple", "basic"]):
            return "minimal"
        elif any(word in prompt_lower for word in ["rainbow", "multi-color", "spectrum"]):
            return "rgb"
        else:
            return "default"

    def _extract_colors_from_prompt(self, prompt: str, theme: str) -> List[str]:
        """Extract color preferences from user prompt."""
        prompt_lower = prompt.lower()
        colors = []
        
        color_map = {
            "red": "#ef4444",
            "green": "#22c55e", 
            "blue": "#3b82f6",
            "yellow": "#eab308",
            "purple": "#a855f7",
            "pink": "#ec4899",
            "cyan": "#06b6d4",
            "orange": "#f97316",
            "white": "#ffffff",
            "black": "#000000"
        }
        
        for color_name, color_value in color_map.items():
            if color_name in prompt_lower:
                colors.append(color_value)
        
        # If no colors specified, use theme defaults
        if not colors:
            theme_colors = {
                "gaming": ["#22c55e", "#eab308", "#dc2626"],
                "cyberpunk": ["#a855f7", "#ec4899", "#06b6d4"],
                "minimal": ["#6b7280", "#f59e0b", "#ef4444"],
                "rgb": ["#ff0000", "#00ff00", "#0000ff"],
                "default": ["#22d3ee", "#ef4444", "#f59e0b"]
            }
            colors = theme_colors.get(theme, theme_colors["default"])
        
        return colors[:3]  # Limit to 3 colors

    def _extract_alerts_from_prompt(self, prompt: str) -> Dict[str, Any]:
        """Extract alert configuration from user prompt."""
        prompt_lower = prompt.lower()
        alerts = {
            "enabled": False,
            "thresholds": {"warning": 75, "critical": 90},
            "showNotifications": True,
            "playSound": False,
            "flashWidget": True
        }
        
        if any(word in prompt_lower for word in ["alert", "warning", "notify", "alarm", "threshold"]):
            alerts["enabled"] = True
            
            # Try to extract threshold values
            import re
            threshold_matches = re.findall(r'(\d+)(?:%|\s*(?:percent|degrees?))', prompt_lower)
            if threshold_matches:
                thresholds = [int(match) for match in threshold_matches]
                if len(thresholds) >= 2:
                    alerts["thresholds"]["warning"] = min(thresholds)
                    alerts["thresholds"]["critical"] = max(thresholds)
                elif len(thresholds) == 1:
                    if thresholds[0] > 80:
                        alerts["thresholds"]["critical"] = thresholds[0]
                    else:
                        alerts["thresholds"]["warning"] = thresholds[0]
        
        return alerts

    def _build_widget_prompt(self, user_prompt: str, context: PromptContext) -> str:
        """Build comprehensive prompt for Genkit generation."""
        widget_type = self._extract_widget_type_from_prompt(user_prompt)
        sensor_type = self._extract_sensor_type_from_prompt(user_prompt)
        theme = self._extract_theme_from_prompt(user_prompt)
        
        system_prompt = f"""
You are an expert widget configuration generator for a PC hardware monitoring dashboard called SenseCanvas.

USER REQUEST: "{user_prompt}"

CONTEXT:
- Widget Type: {widget_type}
- Sensor Type: {sensor_type}
- Theme Preference: {theme}
- User Preferences: {context.user_preferences}
- Existing Widgets: {len(context.existing_widgets)} widgets already on dashboard

REQUIREMENTS:
1. Generate a complete widget configuration that matches the user's request
2. Use appropriate colors, sizing, and styling for the theme
3. Include proper alert thresholds if monitoring is mentioned
4. Ensure the widget is visually distinct from existing widgets
5. Follow SenseCanvas widget schema exactly

WIDGET SCHEMA:
{{
  "type": "{widget_type}",
  "title": "User-friendly title",
  "sensorType": "{sensor_type}",
  "size": {{"width": number, "height": number}},
  "style": {{
    "theme": "{theme}",
    "colors": ["#hex1", "#hex2", "#hex3"],
    "opacity": 1,
    "borderRadius": number
  }},
  "alerts": {{
    "enabled": boolean,
    "thresholds": {{"warning": number, "critical": number}}
  }}
}}

Generate ONLY a valid JSON configuration that precisely matches the user's request.
"""
        
        return system_prompt

    async def _mock_genkit_generate(self, prompt: str) -> MockGenkitResponse:
        """Mock Genkit generation for development/testing."""
        # Simulate API delay
        await asyncio.sleep(0.5)
        
        # Extract configuration elements from prompt
        widget_type = self._extract_widget_type_from_prompt(prompt)
        sensor_type = self._extract_sensor_type_from_prompt(prompt)
        theme = self._extract_theme_from_prompt(prompt)
        colors = self._extract_colors_from_prompt(prompt, theme)
        alerts = self._extract_alerts_from_prompt(prompt)
        
        # Generate title from prompt
        title_keywords = {
            "cpu": "CPU",
            "gpu": "GPU", 
            "memory": "Memory",
            "storage": "Storage",
            "network": "Network"
        }
        
        base_title = title_keywords.get(sensor_type, "System")
        
        if "temperature" in prompt.lower():
            title = f"{base_title} Temperature"
        elif "usage" in prompt.lower() or "load" in prompt.lower():
            title = f"{base_title} Usage"
        elif "speed" in prompt.lower():
            title = f"{base_title} Speed"
        else:
            title = f"{base_title} Monitor"
        
        # Build base configuration
        base_config = self.widget_templates[widget_type]["base_config"].copy()
        
        # Apply theme styling
        if theme in self.widget_templates[widget_type].get("style_variations", {}):
            theme_style = self.widget_templates[widget_type]["style_variations"][theme]
            base_config.setdefault("style", {}).update(theme_style)
        
        config = {
            **base_config,
            "title": title,
            "sensorType": sensor_type,
            "style": {
                **base_config.get("style", {}),
                "theme": theme,
                "colors": colors,
                "opacity": 1,
                "borderRadius": 8 if theme == "cyberpunk" else 16 if theme == "gaming" else 4
            },
            "alerts": alerts,
            "createdAt": int(time.time() * 1000),
            "updatedAt": int(time.time() * 1000),
            "version": "1.0.0",
            "tags": [theme, sensor_type, widget_type],
            "isSelected": False,
            "isResizing": False,
            "isDragging": False,
            "zIndex": 1
        }
        
        return MockGenkitResponse(json.dumps(config, indent=2))

    async def generate_widget(self, request: GenerationRequest) -> GenerationResponse:
        """Generate a widget configuration using AI."""
        # Check rate limiting
        if self._is_rate_limited(request.context.user_id):
            time_until_reset = self.rate_limit_window - (time.time() - self.rate_limiter[request.context.user_id].window_start)
            raise ValueError(f"Rate limit exceeded. Try again in {time_until_reset:.0f} seconds.")
        
        # Check cache
        cache_key = self._get_cache_key(request.prompt, request.context)
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            logger.info(f"Cache hit for user {request.context.user_id}")
            cached_response = self.cache[cache_key]
            return GenerationResponse(**cached_response["response"])
        
        try:
            # Build comprehensive prompt
            full_prompt = self._build_widget_prompt(request.prompt, request.context)
            
            # For production, use actual Genkit
            # result = await generate(
            #     model=gemini15Pro,
            #     prompt=full_prompt,
            #     config={
            #         'temperature': 0.7,
            #         'max_output_tokens': 1000,
            #         'top_p': 0.9
            #     }
            # )
            
            # Mock implementation for development
            result = await self._mock_genkit_generate(request.prompt)
            
            # Parse and validate generated configuration
            widget_config = self._parse_and_validate_widget_config(result.text, request.context)
            
            # Build response
            response = GenerationResponse(
                widget=widget_config,
                confidence=0.85,  # Mock confidence score
                reasoning=f"Generated {widget_config['type']} widget for {widget_config['sensorType']} monitoring based on user requirements.",
                alternatives=[],
                metadata={
                    "generation_time": time.time(),
                    "prompt_length": len(request.prompt),
                    "cache_key": cache_key
                }
            )
            
            # Cache the result
            self.cache[cache_key] = {
                "response": response.model_dump(),
                "timestamp": time.time()
            }
            
            # Update rate limiting
            self._update_rate_limit(request.context.user_id)
            
            logger.info(f"Generated widget for user {request.context.user_id}: {widget_config['type']}")
            return response
            
        except Exception as e:
            logger.error(f"Widget generation failed for user {request.context.user_id}: {str(e)}")
            raise ValueError(f"Widget generation failed: {str(e)}")

    def _parse_and_validate_widget_config(self, generated_text: str, context: PromptContext) -> Dict[str, Any]:
        """Parse and validate generated widget configuration."""
        try:
            # Try to extract JSON from the response
            config = json.loads(generated_text.strip())
            
            # Validate required fields
            required_fields = ["type", "title", "sensorType", "size", "style"]
            for field in required_fields:
                if field not in config:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure proper structure
            if "colors" not in config.get("style", {}):
                config["style"]["colors"] = ["#22d3ee", "#ef4444", "#f59e0b"]
            
            if "alerts" not in config:
                config["alerts"] = {
                    "enabled": False,
                    "thresholds": {"warning": 75, "critical": 90}
                }
            
            # Add metadata
            config.update({
                "id": f"widget-{int(time.time() * 1000)}-{hash(generated_text) % 10000}",
                "position": {"x": 0, "y": 0},
                "createdAt": int(time.time() * 1000),
                "updatedAt": int(time.time() * 1000),
                "version": "1.0.0",
                "tags": [],
                "isSelected": False,
                "isResizing": False,
                "isDragging": False,
                "zIndex": 1
            })
            
            return config
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse generated JSON: {e}")
            raise ValueError("Generated configuration is not valid JSON")
        except Exception as e:
            logger.error(f"Configuration validation failed: {e}")
            raise ValueError(f"Invalid widget configuration: {str(e)}")

    async def generate_layout(self, widgets_prompt: str, context: PromptContext) -> Dict[str, Any]:
        """Generate a complete dashboard layout with multiple widgets."""
        # This would be implemented for layout generation
        # For now, return a simple layout
        return {
            "name": "AI Generated Layout",
            "description": f"Layout based on: {widgets_prompt}",
            "widgets": [],
            "metadata": {
                "generated_at": int(time.time() * 1000),
                "prompt": widgets_prompt
            }
        }

    def get_rate_limit_status(self, user_id: str) -> Dict[str, Any]:
        """Get current rate limit status for a user."""
        if user_id not in self.rate_limiter:
            return {
                "requests_remaining": self.max_requests_per_window,
                "window_reset_time": None,
                "is_limited": False
            }
        
        entry = self.rate_limiter[user_id]
        current_time = time.time()
        
        # Check if window has reset
        if current_time - entry.window_start > self.rate_limit_window:
            requests_remaining = self.max_requests_per_window
            is_limited = False
            window_reset_time = None
        else:
            requests_remaining = max(0, self.max_requests_per_window - entry.request_count)
            is_limited = requests_remaining <= 0
            window_reset_time = entry.window_start + self.rate_limit_window
        
        return {
            "requests_remaining": requests_remaining,
            "window_reset_time": window_reset_time,
            "is_limited": is_limited
        }

    def clear_cache(self) -> int:
        """Clear expired cache entries."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.cache.items()
            if current_time - entry.get("timestamp", 0) > self.cache_ttl
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        logger.info(f"Cleared {len(expired_keys)} expired cache entries")
        return len(expired_keys)


# Global service instance
ai_service = AiWidgetService()