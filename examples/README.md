# SenseCanvas Widget Configurator Examples

This directory contains implementation examples for the SenseCanvas widget configurator system. These examples demonstrate key patterns and best practices for building the widget system.

## File Overview

### Core Component Examples
- **`WidgetConfigurator.svelte`** - Main configurator modal with two-column layout and tab system
- **`WidgetWrapper.svelte`** - Live preview component using Svelte 5 runes and Cosmic UI
- **`GaugeWidget.svelte`** - Example gauge widget implementation with LayerChart integration

### Configuration & Validation
- **`widget-schemas.ts`** - Zod schemas for widget configuration validation
- **`widget-types.ts`** - TypeScript interfaces for widget system
- **`preset-examples.ts`** - Example widget presets for the library

### AI Integration
- **`genkit-integration.ts`** - Google Genkit integration patterns for AI generation
- **`ai-widget-generation.ts`** - AI-powered widget creation with context-aware prompts

### Real-time Data
- **`websocket-client.ts`** - WebSocket client for real-time hardware monitoring data
- **`sensor-data-store.ts`** - Svelte 5 runes-based store for sensor data management

### Testing Patterns
- **`widget-tests.ts`** - Unit testing patterns for widget components
- **`configurator-tests.ts`** - Integration testing for the configurator system

## Key Patterns Demonstrated

### Svelte 5 Runes Usage
- `$state` for reactive component state
- `$derived` for computed values and live preview updates
- `$effect` for side effects and WebSocket management
- No legacy stores - pure runes architecture

### Cosmic UI Integration
- SVG-first component extension patterns
- Theme inheritance and customization
- Programmatic SVG generation for AI-created widgets

### AI Integration Patterns
- Context-aware prompt construction
- Streaming response handling
- Error recovery and fallback behavior
- Rate limiting and performance optimization

### Real-time Data Handling
- WebSocket connection management
- Efficient data streaming and updates
- Cross-platform hardware monitoring
- Graceful error handling and reconnection

## Usage Notes

These examples are designed to be:
- **Copy-pasteable** - Core patterns can be directly used in implementation
- **Extensible** - Easy to adapt for new widget types and features
- **Type-safe** - Full TypeScript integration with proper inference
- **Testable** - Clear separation of concerns for unit testing
- **Performance-focused** - Optimized patterns for real-time applications

## Implementation Order

1. Start with `widget-schemas.ts` and `widget-types.ts` for type foundation
2. Implement `WidgetWrapper.svelte` for live preview functionality
3. Create `websocket-client.ts` for real-time data integration
4. Build `WidgetConfigurator.svelte` with tab system and AI integration
5. Add specific widget implementations like `GaugeWidget.svelte`
6. Integrate AI generation with `genkit-integration.ts` patterns

## Dependencies

All examples assume the following dependencies are installed:
- `@sveltejs/kit` - SvelteKit framework
- `svelte` - Svelte 5 with runes support
- `tailwindcss` - Styling framework
- `cosmic-ui` - Sci-fi component library
- `layerchart` - Chart visualization library
- `@neodrag/svelte` - Drag and drop functionality
- `zod` - Schema validation
- `@genkit/core` - AI generation framework
- `typescript` - Type checking

## Security Notes

- All AI prompts should be sanitized before sending to Genkit
- WebSocket connections should include proper authentication
- User-uploaded configurations must be validated with Zod schemas
- Rate limiting should be implemented for AI API calls 