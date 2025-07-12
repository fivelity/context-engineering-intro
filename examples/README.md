# SenseCanvas Examples

This directory contains comprehensive examples and patterns for building SenseCanvas, a futuristic PC hardware monitoring dashboard. Each example demonstrates specific implementation patterns that should be followed throughout the project.

## Frontend Examples

### Svelte 5 Runes (`svelte5-runes/`)
Demonstrates the new Svelte 5 runes system for reactive state management. Critical for avoiding migration issues from Svelte 4.

**Key Patterns:**
- `$state()` for reactive variables
- `$derived()` for computed values
- `$effect()` for side effects with proper cleanup
- Avoiding old `$:` reactive statements

### Widget Configurator (`widget-configurator/`)
Complete modal configurator implementation with tabbed interface for widget creation and editing.

**Key Patterns:**
- Modal dialog with backdrop
- Tab navigation with Svelte 5 runes
- Form validation with Zod
- Live preview integration

### Cosmic UI Integration (`cosmic-ui-integration/`)
Shows how to integrate Cosmic UI components for sci-fi aesthetics and extend them with custom SVG methods.

**Key Patterns:**
- Frame component usage
- SVG path generation
- Theme integration
- Custom extension methods

### LayerChart Widgets (`layerchart-widgets/`)
Demonstrates LayerChart@next usage for creating various chart types compatible with Svelte 5.

**Key Patterns:**
- Arc gauges for temperature/usage metrics
- Line charts for historical data
- Responsive chart sizing
- Theme-aware styling

### NeoDrag Grid (`neodrag-grid/`)
Shows draggable grid layout implementation with bounds checking and collision detection.

**Key Patterns:**
- Grid snapping
- Collision detection
- Bounds enforcement
- Resize handles

### WebSocket Client (`websocket-client/`)
Real-time sensor data streaming client with proper connection management.

**Key Patterns:**
- WebSocket connection lifecycle
- Error handling and reconnection
- Data parsing and validation
- Memory leak prevention

### Theme System (`theme-system/`)
TailwindCSS 4+ theme switching implementation with multiple dashboard themes.

**Key Patterns:**
- CSS custom properties
- Theme switching logic
- Component theme inheritance
- Color palette management

## Backend Examples

### FastAPI WebSockets (`fastapi-websockets/`)
FastAPI WebSocket implementation for real-time hardware data streaming.

**Key Patterns:**
- WebSocket endpoint setup
- Connection management
- Data broadcasting
- Error handling

### Hardware Monitor (`hardware-monitor/`)
LibreHardwareMonitorLib.dll integration with pythonnet for Windows hardware monitoring.

**Key Patterns:**
- DLL loading and initialization
- Hardware sensor polling
- Data serialization
- Fallback to psutil

### Pydantic Models (`pydantic-models/`)
Pydantic v2.11+ data validation models for hardware metrics and configurations.

**Key Patterns:**
- Model definitions
- Validation rules
- Serialization/deserialization
- Type safety

### Genkit Integration (`genkit-integration/`)
Google Genkit AI generation endpoints for widget and layout creation.

**Key Patterns:**
- Genkit setup and configuration
- Prompt engineering
- Response parsing
- Rate limiting

## Configuration Examples

### Widget Configs (`widget-configs/`)
Zod schema definitions for widget configurations with validation.

**Key Patterns:**
- Schema definitions
- Discriminated unions
- Validation logic
- Type inference

### Dashboard Layouts (`dashboard-layouts/`)
JSON structure examples for dashboard exports and imports.

**Key Patterns:**
- Layout serialization
- Widget positioning
- Theme settings
- Metadata handling

### AI Prompts (`ai-prompts/`)
Genkit prompt templates for widget and layout generation.

**Key Patterns:**
- Prompt structure
- Context injection
- Response formatting
- Error handling

## Usage Guidelines

1. **Study Before Implementation**: Review relevant examples before starting new features
2. **Follow Patterns**: Stick to the established patterns for consistency
3. **Update Examples**: Add new patterns as the project evolves
4. **Test Coverage**: Each example should have corresponding tests
5. **Documentation**: Keep examples well-documented with inline comments

## Common Patterns Across Examples

- **Error Handling**: Consistent error handling patterns
- **TypeScript**: Full TypeScript coverage with proper types
- **Validation**: Zod schema validation everywhere
- **Performance**: Optimized patterns for real-time updates
- **Cleanup**: Proper resource cleanup in all examples
- **Security**: Secure coding practices throughout

These examples serve as the foundation for SenseCanvas development, ensuring consistent, high-quality implementations across all components. 