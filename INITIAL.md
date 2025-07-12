# SenseCanvas: Complete PC Hardware Monitoring Dashboard

## FEATURE:
Build SenseCanvas - a futuristic, real-time PC hardware monitoring dashboard that transforms raw hardware metrics into visually captivating, customizable widgets. The dashboard should deliver an overwhelmingly positive user experience for tech enthusiasts and PC gamers, blending sci-fi aesthetics with deep customization, AI-powered intelligence, and seamless performance.

### Core Requirements:
1. **Real-Time Hardware Monitoring**: Stream CPU/GPU usage, temperatures, fan speeds, and other metrics with low latency (<1s intervals)
2. **Immersive Widget System**: Drag-and-drop widgets with live previews, supporting gauges, graphs, and multi-sensor displays
3. **AI-Powered Customization**: Generate widgets, layouts, and SVG graphics from natural language prompts
4. **Advanced Widget Configurator**: Modal-based configurator with tabs for Library, AI Generate, and Create Custom
5. **Theme System**: Support for Gaming, RGB, cyberpunk, and minimalist themes
6. **Community Sharing**: JSON import/export for sharing widget configurations and dashboard layouts
7. **Cross-Platform**: Primary Windows optimization with fallbacks for other OS

### Technical Architecture:
- **Frontend**: SvelteKit 2+ with Svelte 5 runes, TailwindCSS 4+, TypeScript 5+
- **UI Components**: Cosmic UI (sci-fi aesthetics), LayerChart@next (Svelte 5 compatible charts), NeoDrag@next (draggable widgets)
- **Backend**: FastAPI with WebSockets for real-time data streaming
- **Hardware Integration**: LibreHardwareMonitorLib.dll via pythonnet, psutil fallback
- **AI Integration**: Google Genkit 1.14.1+ for widget/layout generation
- **Validation**: Zod schemas for configuration validation

### Widget Configurator Workflow:
1. **Library Tab**: Browse preset widgets with LayerChart thumbnails, quick-add functionality
2. **AI Generate Tab**: Natural language widget creation using Genkit integration
3. **Create Custom Tab**: Granular customization with accordion sections (General, Style, Alerts)
4. **Live Preview**: Real-time rendering with Cosmic UI frames and LayerChart visualizations
5. **Export/Import**: JSON configuration sharing for community

### Dashboard Features:
- Grid-based layout with CSS Grid + NeoDrag for positioning
- Edit mode with snapping, collision detection, and bounds checking
- Separate AI layout suggestions for macro-level dashboard optimization
- Theme inheritance and customization
- Browser notification API for alerts

## EXAMPLES:
Reference the following example patterns from the `examples/` folder:

### Frontend Examples:
- `examples/svelte5-runes/`: Svelte 5 runes pattern for reactive state management
- `examples/widget-configurator/`: Modal configurator implementation with tabs
- `examples/cosmic-ui-integration/`: Cosmic UI Frame and SVG extension patterns
- `examples/layerchart-widgets/`: LayerChart Arc and Chart component usage
- `examples/neodrag-grid/`: Draggable grid layout with bounds and collision
- `examples/websocket-client/`: Real-time sensor data streaming client
- `examples/theme-system/`: TailwindCSS 4+ theme switching implementation

### Backend Examples:
- `examples/fastapi-websockets/`: FastAPI WebSocket implementation for real-time data
- `examples/hardware-monitor/`: LibreHardwareMonitorLib.dll integration with pythonnet
- `examples/pydantic-models/`: Pydantic v2.11+ data validation models
- `examples/genkit-integration/`: Google Genkit AI generation endpoints

### Configuration Examples:
- `examples/widget-configs/`: Zod schema definitions for widget configurations
- `examples/dashboard-layouts/`: JSON structure for dashboard exports
- `examples/ai-prompts/`: Genkit prompt templates for widget/layout generation

## DOCUMENTATION:
Include the following documentation resources:

### Framework Documentation:
- **Svelte 5 Runes**: https://svelte.dev/docs/svelte/what-are-runes
- **SvelteKit 2+**: https://kit.svelte.dev/
- **Svelte 5 Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide
- **TailwindCSS 4+**: https://tailwindcss.com/blog/tailwindcss-v4
- **TypeScript 5+**: https://www.typescriptlang.org/docs/

### UI Library Documentation:
- **Cosmic UI**: https://www.cosmic-ui.com/docs (Getting Started, Components, Customization)
- **LayerChart@next**: https://next.layerchart.com/getting-started
- **NeoDrag@next**: https://next.neodrag.dev/docs/svelte
- **Zod**: https://zod.dev/

### Backend Documentation:
- **FastAPI**: https://fastapi.tiangolo.com/
- **Pydantic v2.11+**: https://docs.pydantic.dev/latest/
- **LibreHardwareMonitor**: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor
- **pythonnet**: http://pythonnet.github.io/

### AI Integration Documentation:
- **Google Genkit**: https://firebase.google.com/docs/genkit
- **Genkit Models**: https://firebase.google.com/docs/genkit/models
- **Genkit Content Generation**: https://firebase.google.com/docs/genkit/get-started

### Hardware Monitoring Documentation:
- **PyHardwareMonitor**: https://github.com/snip3rnick/PyHardwareMonitor
- **psutil**: https://psutil.readthedocs.io/

## OTHER CONSIDERATIONS:

### Critical Implementation Details:
1. **Admin Privileges**: Backend must run as administrator on Windows for full hardware sensor access
2. **DLL Integration**: LibreHardwareMonitorLib.dll must be in the correct path with proper pythonnet references
3. **Svelte 5 Migration**: Avoid mixing runes with old Svelte 4 patterns ($: labels, stores)
4. **Performance**: Use Canvas fallback for LayerChart when >20 widgets are active
5. **WebSocket Cleanup**: Implement proper cleanup in $effect to prevent memory leaks

### Common Pitfalls to Avoid:
1. **Runes Reactivity**: Always return cleanup functions in $effect
2. **TailwindCSS v4**: Update to new color palette syntax
3. **NeoDrag Bounds**: Set proper bounds to prevent off-screen dragging
4. **Zod Validation**: Use discriminated unions for different widget types
5. **AI Rate Limiting**: Implement client-side caching for Genkit suggestions
6. **Hardware Access**: Graceful fallback to psutil when admin privileges unavailable

### Security Considerations:
1. **Environment Variables**: Never hardcode API keys - use .env files
2. **Input Sanitization**: Validate all user inputs and AI-generated content
3. **CORS Configuration**: Proper CORS setup for frontend-backend communication
4. **Authentication**: Secure Genkit API calls with proper Firebase auth

### Performance Optimization:
1. **Polling Intervals**: Optimize hardware polling to ~1s intervals
2. **WebSocket Throttling**: Implement throttling for high-frequency updates
3. **Widget Rendering**: Use virtual scrolling for large widget collections
4. **Memory Management**: Proper cleanup of WebSocket connections and event listeners

### Community Features:
1. **JSON Export**: Complete widget and dashboard configuration export
2. **Import Validation**: Robust validation of imported configurations
3. **Versioning**: Configuration version compatibility handling
4. **Sharing Protocol**: Standard format for community widget sharing

### Testing Requirements:
1. **Hardware Mocking**: Mock hardware sensors for development/testing
2. **Cross-Platform Testing**: Test psutil fallbacks on non-Windows systems
3. **Performance Testing**: Load testing with multiple widgets and real-time data
4. **AI Integration Testing**: Mock Genkit responses for consistent testing

This project should result in a production-ready dashboard that PC enthusiasts will find both powerful and delightful to use, with seamless customization and community sharing capabilities.
