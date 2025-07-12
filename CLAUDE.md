# Global Rules for Claude Code Assistant

## Project Awareness
- **Always read planning documents first** - Look for INITIAL.md, PRPs/, and project documentation
- **Check for active tasks** - Look for TODO lists and current implementation status
- **Understand the codebase structure** - This is a SenseCanvas dashboard project with widget configurator functionality

## SenseCanvas Project Context
- **Project**: SenseCanvas - Ultimate PC Hardware Sensor Monitoring Dashboard
- **Primary Feature**: Advanced Widget Configurator with AI integration
- **Tech Stack**: SvelteKit 2/Svelte 5, TailwindCSS 4, TypeScript 5, Cosmic UI, LayerChart@next, NeoDrag@next
- **Backend**: FastAPI, Python, PyHardwareMonitor, Google Genkit for AI
- **Architecture**: Full-stack with real-time WebSocket data streaming
- **UI Framework**: Cosmic UI (sci-fi SVG-first components) for consistent aesthetic
- **Memory**: The sensor-dash-react project integrates Cosmic UI as the primary UI framework

## Code Structure Requirements
- **File Size Limit**: Keep individual files under 500 lines when possible
- **Module Organization**: Separate concerns - components, stores, utilities, types
- **Svelte 5 Runes**: Use $state, $derived, $effect exclusively (no legacy stores)
- **Component Structure**: All widgets extend Cosmic UI's SVG frames for consistency
- **Reactive Architecture**: WebSocket client updates Svelte 5 runes-based stores

## Widget Configurator Specific Rules
- **Widget Configurator**: Single modal with two-column layout (controls + live preview)
- **Tabs**: Library, AI Generate, Create Custom (with sub-tabs: General, Style, Alerts)
- **Live Preview**: Real-time updates via $derived from left column's $state
- **AI Integration**: Google Genkit for widget/layout generation, context-aware prompts
- **Validation**: Zod schemas for all widget configs and forms
- **Export/Import**: JSON configurations for community sharing

## Testing Requirements
- **Unit Tests**: Focus on widget configuration logic, AI integration, state management
- **Integration Tests**: WebSocket connections, hardware monitoring, drag-and-drop
- **Test Pattern**: Use Vitest for unit tests, Playwright for E2E
- **Coverage**: Prioritize core widget functionality and AI generation features

## Style Conventions
- **TypeScript**: Strict mode, interfaces for sensors/widgets/AI responses
- **Svelte 5**: Use runes pattern, avoid legacy reactive statements
- **TailwindCSS 4**: New color palette syntax, integrate with Cosmic UI themes
- **Cosmic UI**: Extend SVG components, use programmatic API for custom frames
- **Naming**: PascalCase for components, camelCase for functions/variables

## AI Integration Guidelines
- **Context-Aware Prompts**: Include dashboard state, user preferences, sensor data
- **Two-Level AI**: Widget-level (in configurator) and Dashboard-level (separate modal)
- **Genkit Integration**: Server-side via SvelteKit routes, client-side async calls
- **AI Outputs**: Parse to editable configs, seamless handover to live preview
- **Error Handling**: Graceful fallbacks when AI services unavailable

## Documentation Standards
- **JSDoc**: For public APIs, complex functions, AI integration points
- **Component Props**: Document all props with types and defaults
- **Widget Schemas**: Clear documentation of widget configuration options
- **AI Prompts**: Document prompt templates and context injection patterns
- **README**: Keep updated with setup instructions, AI configuration

## Hardware Monitoring Specifics
- **Real-time Data**: WebSocket streaming from FastAPI backend
- **Cross-Platform**: Full Windows support, psutil fallback for other OS
- **Sensor Types**: CPU, GPU, memory, storage, network, fans, voltages
- **Data Validation**: Pydantic models for hardware metrics
- **Performance**: Configurable refresh rates, efficient data structures

## Never Downgrade Dependencies
- Always troubleshoot compatibility issues without downgrading package versions
- Use latest stable versions: Svelte 5, LayerChart@next, NeoDrag@next
- Maintain forward compatibility with breaking changes in dependencies

## Security Considerations
- **No Hardcoded Secrets**: Use environment variables for API keys
- **Input Validation**: Sanitize all user inputs, especially AI prompts
- **WebSocket Security**: Implement proper authentication and rate limiting
- **Admin Privileges**: Handle Windows hardware monitoring permissions gracefully
- **AI Rate Limits**: Implement proper rate limiting for Genkit API calls

## Performance Optimization
- **Lazy Loading**: Load widget components and AI features on demand
- **Canvas Fallback**: Use Canvas for complex visualizations in LayerChart
- **Memory Management**: Efficient cleanup of WebSocket connections and timers
- **Drag Performance**: Optimize NeoDrag bounds and collision detection
- **AI Streaming**: Progressive loading of AI-generated content

## User Experience Priorities
- **Customization-First**: All features should enable deep personalization
- **Real-time Feedback**: Immediate visual updates in widget configurator
- **Accessibility**: Proper ARIA labels, keyboard navigation support
- **Error Recovery**: Clear error messages, undo/redo functionality
- **Community Sharing**: JSON export/import for widget configurations

## Common Pitfalls to Avoid
- **Don't mix Svelte 4 and 5 patterns** - Use runes exclusively
- **Don't bypass Cosmic UI** - Extend components rather than creating custom SVG
- **Don't ignore WebSocket errors** - Handle connection failures gracefully
- **Don't block UI with AI calls** - Always use async patterns with loading states
- **Don't hardcode sensor types** - Make system extensible for new hardware

## Context Engineering
- **Always provide comprehensive context** when implementing features
- **Include relevant examples** from the codebase and documentation
- **Reference specific documentation** for hardware monitoring, AI integration
- **Consider the full user journey** from widget creation to dashboard sharing
- **Plan for extensibility** - new widget types, AI capabilities, hardware sensors