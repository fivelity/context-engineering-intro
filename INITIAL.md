# SenseCanvas Widget Configurator Implementation

## FEATURE:
Implement a comprehensive Widget Configurator system for SenseCanvas, a PC hardware monitoring dashboard. The configurator should be a single, immersive modal dialog that serves as the central hub for widget creation, editing, and AI-assisted generation.

### Core Requirements:

**Two-Column Layout:**
- Left Column: Tabbed interface for structured input (Controls)
- Right Column: Live preview using reactive `<WidgetWrapper>` component

**Tab Structure:**
1. **Library Tab** (default view)
   - Browse pre-designed widget presets with LayerChart thumbnails
   - Quick-add functionality with "Add from Library" button
   - Context menu with Edit/Duplicate/Delete/Export options
   - "Edit from Library" feature that populates Create Custom tab with preset configs

2. **AI Generate Tab** (NEW)
   - Natural language prompt input for widget generation
   - Context-aware prompts (current sensors, dashboard state, user preferences)
   - Google Genkit integration for AI-powered widget creation
   - Generation options: creativity level, model selection, refinements
   - Output parsing to editable widget config objects
   - "Apply and Edit" functionality to jump to Create Custom tabs

3. **Create Custom Tab**
   - **General Sub-tab**: Widget title, display type, data source/sensors, orientation
   - **Style Sub-tab**: Appearance (colors, thickness, arc options), Icon (picker/style), Typography & Text, Border
   - **Alerts Sub-tab**: Enable/disable alerts, threshold configuration (value/color/message)

**Live Preview System:**
- Real-time updates using Svelte 5 `$derived` values from left column's `$state`
- Built with Cosmic UI's `<Frame>` components for sci-fi aesthetics
- LayerChart integration for dynamic gauges and graphs
- Instant updates via runes (`$effect(() => updatePreview(config))`)
- Theme inheritance from dashboard, JSON export capability

**AI Integration Architecture:**
- **Widget-Level AI**: Integrated into configurator via new "AI Generate" tab
- **Dashboard-Level AI**: Separate modal accessed via toolbar "AI Suggest Layout" button
- Server-side Genkit integration via SvelteKit server routes
- Context injection (dashboard state, available sensors, user themes)
- Streaming responses with progressive previews

### Technical Implementation:

**Frontend Stack:**
- SvelteKit 2 with Svelte 5 runes ($state, $derived, $effect)
- TailwindCSS 4 with new color palette syntax
- TypeScript 5 with strict mode
- Cosmic UI for SVG-first sci-fi components
- LayerChart@next for visualizations
- NeoDrag@next for drag-and-drop functionality
- Zod for schema validation

**Backend Integration:**
- FastAPI with WebSocket streaming for real-time data
- PyHardwareMonitor for Windows hardware access
- Google Genkit 1.14.1 for AI generation
- Pydantic models for data validation
- psutil fallback for cross-platform compatibility

**Widget Types to Support:**
- Gauges (arc, speedometer, radial) for single metrics
- Charts (line, bar, area) for trend visualization
- Meters (horizontal bars) for progress displays
- Simple widgets for single-value readouts
- Multi-resource widgets (e.g., CPU cores, GPU essentials)

**Data Flow:**
1. User opens configurator via "+" button or right-click context menu
2. Tab selection determines input method (Library/AI/Custom)
3. Configuration changes trigger `$effect` to update live preview
4. Final widget added to dashboard via NeoDrag positioning
5. Optional save to library as preset for future use

## EXAMPLES:
Reference the following files for implementation patterns:
- `Widget_Configuration_Overview.md` - Complete widget system architecture
- `WidgetConfigurator-Walkthrough.md` - Detailed user flow and UI specifications
- `grok_report.doc` - Comprehensive project overview and technical requirements
- `grok_report (1).doc` - Enhanced workflow and AI integration details

## DOCUMENTATION:
- **Svelte 5 Runes**: https://svelte.dev/docs/svelte/reactivity
- **Svelte 5 Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide
- **SvelteKit Documentation**: https://kit.svelte.dev/docs/introduction
- **Cosmic UI Documentation**: https://github.com/CosmicUI/cosmic-ui (SVG-first component library)
- **LayerChart Documentation**: https://layerchart.com/docs/introduction
- **LayerChart@next GitHub**: https://github.com/techniq/layerchart
- **NeoDrag@next**: https://github.com/PuruVJ/neodrag/tree/next
- **Google Genkit Documentation**: https://firebase.google.com/docs/genkit
- **Genkit AI Generation**: https://firebase.google.com/docs/genkit/ai
- **TailwindCSS 4 Documentation**: https://tailwindcss.com/docs
- **TailwindCSS 4 Beta**: https://tailwindcss.com/blog/tailwindcss-v4-beta
- **Zod Documentation**: https://zod.dev/
- **Zod Schema Validation**: https://github.com/colinhacks/zod
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **FastAPI WebSockets**: https://fastapi.tiangolo.com/advanced/websockets/
- **PyHardwareMonitor**: https://github.com/jackbenny/pyhardwaremonitor
- **psutil Documentation**: https://psutil.readthedocs.io/en/latest/
- **TypeScript 5 Documentation**: https://www.typescriptlang.org/docs/
- **Pydantic Documentation**: https://docs.pydantic.dev/latest/
- **WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **ARIA Best Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Web Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## OTHER CONSIDERATIONS:

**Performance Optimizations:**
- Canvas fallback for complex LayerChart visualizations
- Lazy loading of AI features and widget components
- Efficient WebSocket connection management
- Optimized NeoDrag bounds and collision detection

**User Experience:**
- Customization-first mindset with JSON export/import
- Real-time feedback with tight feedback loops
- Accessibility with proper ARIA labels and keyboard navigation
- Error recovery with undo/redo functionality
- Community sharing capabilities

**Security & Reliability:**
- Input validation and sanitization, especially for AI prompts
- Rate limiting for Genkit API calls
- Graceful WebSocket error handling
- Admin privilege handling for Windows hardware monitoring
- Zod validation for all imported configurations

**AI Integration Specifics:**
- Context-aware prompts that include current dashboard state
- Multi-sensor widget generation (e.g., "CPU cores with RGB theme")
- SVG extension capabilities via Cosmic UI programmatic API
- Streaming responses with progressive preview updates
- Fallback behavior when AI services are unavailable

**Widget Configuration Schema:**
- Comprehensive validation for all widget types and properties
- Support for theme inheritance and customization
- Export/import functionality for community sharing
- Version compatibility for future widget type additions

**Hardware Monitoring Integration:**
- Real-time sensor data streaming via WebSocket
- Support for CPU, GPU, memory, storage, network, fans, voltages
- Configurable refresh rates and data retention
- Cross-platform compatibility with graceful fallbacks

This implementation should create an intuitive, powerful widget configurator that enables both quick setup via presets and deep customization via AI generation and manual configuration, all while maintaining the sci-fi aesthetic and real-time responsiveness that defines the SenseCanvas experience.
