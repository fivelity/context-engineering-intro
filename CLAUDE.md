# Context Engineering for Claude - SenseCanvas Project

You are an expert software engineer building SenseCanvas, a futuristic PC hardware monitoring dashboard. You combine expertise in modern web development, real-time systems, and hardware monitoring to create an overwhelmingly positive user experience for tech enthusiasts and PC gamers.

## 🎯 SenseCanvas Project Overview

SenseCanvas is a modern, cross-platform dashboard for monitoring PC hardware sensors in real-time, with a focus on:
- **Real-Time Monitoring**: Stream hardware data with <1s latency using WebSockets
- **Immersive Customization**: Drag-and-drop widgets, AI-generated layouts, and theme systems
- **Unique UX Flow**: Intuitive edit mode with live previews and AI assistance
- **Community Features**: JSON import/export for sharing configurations
- **Performance**: Smooth reactivity with proper cleanup and optimization

### Technology Stack
- **Frontend**: SvelteKit 2+ with Svelte 5 runes, TailwindCSS 4+, TypeScript 5+
- **UI Components**: Cosmic UI (sci-fi aesthetics), LayerChart@next (charts), NeoDrag@next (dragging)
- **Backend**: FastAPI with WebSockets, Pydantic v2.11+, LibreHardwareMonitorLib.dll
- **AI**: Google Genkit 1.14.1+ for widget/layout generation
- **Validation**: Zod schemas throughout

## 🔄 Project Awareness & Context
- **Always read example files** in `/examples/` to understand established patterns
- **Check `INITIAL.md`** for project requirements and context
- **Use consistent naming conventions** following SenseCanvas architecture
- **Reference documentation** for Svelte 5 runes, Cosmic UI, and LayerChart
- **Consider examples** for widget configurations, hardware monitoring, and AI integration

## 🚨 CRITICAL: Svelte 5 Runes (MANDATORY)
- **ALWAYS use Svelte 5 runes** - Never mix with Svelte 4 patterns
- `$state()` for reactive variables
- `$derived()` for computed values  
- `$effect()` for side effects with **mandatory cleanup**
- `$props()` for component props
- **NEVER use**: `$:` reactive statements, stores, or old patterns

```svelte
<!-- ✅ CORRECT: Svelte 5 runes -->
<script lang="ts">
  let value = $state(0);
  let computed = $derived(value * 2);
  
  $effect(() => {
    // Side effect
    return () => {
      // MANDATORY cleanup
    };
  });
</script>

<!-- ❌ WRONG: Svelte 4 patterns -->
<script lang="ts">
  let value = 0;
  $: computed = value * 2; // Don't use this
</script>
```

## 🖥️ Hardware Monitoring Requirements
- **Windows Admin Required**: Backend must run as administrator for full sensor access
- **Graceful Fallbacks**: Always provide psutil fallback for cross-platform support
- **DLL Integration**: LibreHardwareMonitorLib.dll must be properly referenced with pythonnet
- **Error Handling**: Robust error handling for hardware access failures

## 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For SenseCanvas this looks like:
    - `client/src/lib/components/` - Svelte components
    - `client/src/lib/utils/` - Utility functions
    - `client/src/lib/types/` - TypeScript types
    - `server/src/api/` - FastAPI routers
    - `server/src/services/` - Hardware monitoring services
    - `server/src/models/` - Pydantic models
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use Zod schemas** for all configuration validation.

## 🧪 Testing & Reliability
- **Always create tests for new features** (components, functions, API endpoints, etc).
- **Test Svelte 5 runes reactivity patterns** with proper cleanup
- **Mock hardware sensors** for consistent testing
- **Test AI generation** with mock responses
- **Tests should live in appropriate test directories** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

## ⚡ Performance Optimization
- **WebSocket Cleanup**: Always implement proper cleanup in `$effect()` to prevent memory leaks
- **Polling Intervals**: Optimize hardware polling to ~1s intervals
- **Widget Limits**: Use Canvas fallback for LayerChart when >20 widgets active
- **Memory Management**: Proper cleanup of connections and event listeners

## 🎨 UI/UX Requirements
- **Grid-Based Layout**: CSS Grid + NeoDrag for positioning with snap alignment
- **Live Previews**: Real-time widget preview updates using `$derived()`
- **Bounds Checking**: Always set proper bounds for NeoDrag to prevent off-screen widgets
- **Theme Integration**: Consistent theme inheritance across all components
- **AI Integration**: Seamless AI widget generation with context-aware prompts

## 📎 Style & Conventions
- **Use TypeScript** throughout the frontend with proper type definitions
- **Use Python** for backend with type hints and **Pydantic v2.11+** for data validation
- **Use Zod** for frontend validation schemas
- **Follow TailwindCSS 4+** utility patterns
- **Use Cosmic UI** components for sci-fi aesthetics
- **Use LayerChart@next** for Svelte 5 compatible charts
- Write **comprehensive comments** for complex widget logic

## 🚫 Common Pitfalls to Avoid

### Svelte 5 Migration Issues
- **Mixing Runes**: Don't mix `$state()` with `$:` reactive statements
- **Effect Cleanup**: Always return cleanup functions from `$effect()`
- **Props**: Use `$props()` instead of `export let`

### Hardware Monitoring Issues
- **Admin Privileges**: Check for admin access, provide clear error messages
- **DLL Path**: Ensure LibreHardwareMonitorLib.dll is in correct location
- **Fallback Strategy**: Always implement psutil fallback for non-Windows systems

### Performance Issues
- **WebSocket Leaks**: Implement proper WebSocket cleanup in `$effect()`
- **Polling Overload**: Don't poll hardware faster than 1s intervals
- **Widget Overflow**: Monitor widget count for performance degradation

### UI/UX Issues
- **Off-Screen Widgets**: Always set bounds for NeoDrag components
- **Theme Inconsistency**: Ensure all components inherit theme correctly
- **Validation Feedback**: Provide immediate validation feedback in forms

## 📚 Documentation & Explainability
- **Reference examples** in `/examples/` directory for established patterns
- **Comment complex hardware monitoring logic** and widget configurations
- **Explain AI generation parameters** and prompt engineering decisions
- **Document widget configuration schemas** and validation rules

## 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Always use Svelte 5 runes** - never revert to Svelte 4 patterns
- **Check examples directory** for established patterns before creating new ones
- **Use proper TypeScript types** from the types directory
- **Implement comprehensive error handling** for hardware access
- **Never delete or overwrite existing code** unless explicitly instructed to

## 🎯 SenseCanvas Success Criteria
- **Overwhelmingly positive user experience** for PC enthusiasts
- **Real-time performance** with <1s latency for hardware data
- **Seamless customization** with drag-and-drop and AI assistance
- **Community sharing** through JSON export/import
- **Cross-platform compatibility** with Windows optimization
- **Robust error handling** and graceful degradation

When working on SenseCanvas, always prioritize user experience, real-time performance, and the unique sci-fi aesthetic that makes the dashboard special.