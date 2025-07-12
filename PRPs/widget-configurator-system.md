name: "SenseCanvas Widget Configurator System PRP"
description: |

## Purpose
Comprehensive PRP for implementing the SenseCanvas Widget Configurator - a powerful, AI-integrated modal system for creating, editing, and managing dashboard widgets with real-time preview capabilities and advanced customization options.

## Core Principles
1. **Context is King**: Complete documentation, examples, and technical patterns included
2. **Validation Loops**: Executable tests and validation for iterative refinement  
3. **Svelte 5 Runes**: Pure runes architecture with $state, $derived, $effect
4. **AI Integration**: Google Genkit for context-aware widget generation
5. **Real-time Preview**: Live updates via reactive Svelte stores and WebSocket data

---

## Goal
Implement a comprehensive Widget Configurator system that serves as the central hub for widget creation, editing, and AI-assisted generation in the SenseCanvas dashboard. The system must provide an intuitive two-column layout with tabbed controls and live preview, supporting both manual configuration and AI-powered generation while maintaining the sci-fi aesthetic and real-time responsiveness.

## Why
- **User Empowerment**: Enable deep customization without technical knowledge required
- **AI Integration**: Leverage modern AI to accelerate widget creation through natural language
- **Real-time Feedback**: Immediate visual feedback reduces iteration time and improves UX
- **Extensibility**: Foundation for community widget sharing and advanced dashboard features
- **Brand Consistency**: Maintains SenseCanvas sci-fi aesthetic with Cosmic UI integration

## What
A modal dialog system featuring:
- **Two-column layout**: Controls (left) + Live Preview (right)
- **Three main tabs**: Library (presets), AI Generate (Genkit), Create Custom (manual)
- **Real-time preview**: Svelte 5 runes-powered live updates
- **AI integration**: Google Genkit with context-aware prompts
- **Comprehensive validation**: Zod schemas for all configurations
- **Export/Import**: JSON-based widget sharing capabilities

### Success Criteria
- [ ] Widget Configurator opens via toolbar "+" button and dashboard right-click
- [ ] Library tab displays curated presets with "Add from Library" functionality  
- [ ] AI Generate tab creates widgets from natural language prompts
- [ ] Create Custom tab provides granular control across General/Style/Alerts sub-tabs
- [ ] Live preview updates in real-time using Svelte 5 $derived values
- [ ] All widget configurations validate against Zod schemas
- [ ] Export/Import functionality supports JSON widget sharing
- [ ] WebSocket integration provides real-time sensor data for preview
- [ ] Cosmic UI integration maintains sci-fi aesthetic throughout
- [ ] Keyboard shortcuts and accessibility support included

## All Needed Context

### Documentation & References
```yaml
# CRITICAL DOCUMENTATION - Include these in your context window

- url: https://svelte.dev/docs/svelte/v5-migration-guide
  why: Svelte 5 runes patterns ($state, $derived, $effect) - foundational to all components
  critical: Pure runes architecture required, no legacy reactive statements

- url: https://svelte.dev/blog/runes  
  why: Understanding $derived vs $effect distinction for live preview system
  critical: $derived for computed values, $effect for side effects only

- url: https://firebase.google.com/docs/genkit/models
  why: Google Genkit AI generation patterns and TypeScript integration
  critical: Context-aware prompts and streaming response handling

- url: https://www.layerchart.com/
  why: LayerChart Svelte chart library for widget visualizations
  critical: Composable components for gauge/graph/chart widgets

- file: examples/WidgetConfigurator.svelte
  why: Complete reference implementation showing two-column layout, tabs, live preview
  critical: Exact pattern to follow for component structure and runes usage

- file: examples/widget-schemas.ts  
  why: Comprehensive Zod validation schemas for all widget configurations
  critical: Type safety and validation patterns for all user inputs

- file: examples/genkit-integration.ts
  why: Google Genkit integration with rate limiting and context-aware generation
  critical: AI generation flow with proper error handling and streaming

- file: examples/websocket-client.ts
  why: Real-time sensor data management with Svelte 5 runes stores
  critical: WebSocket patterns for live preview data updates

- file: Widget_Configuration_Overview.md
  why: Complete UI/UX specifications and user flow requirements
  critical: Two-column layout, tab structure, and interaction patterns

- file: WidgetConfigurator-Walkthrough.md  
  why: Detailed walkthrough of widget customization process and sub-tabs
  critical: General/Style/Alerts tab organization and "Edit from Library" feature

- file: CLAUDE.md
  why: Project-specific rules, conventions, and technical constraints
  critical: Cosmic UI integration, Svelte 5 patterns, file size limits
```

### Current Codebase Structure
```bash
context-engineering-intro/
├── examples/
│   ├── WidgetConfigurator.svelte     # Main configurator reference
│   ├── widget-schemas.ts             # Zod validation schemas
│   ├── genkit-integration.ts         # AI generation patterns
│   ├── websocket-client.ts           # Real-time data management
│   └── README.md                     # Implementation guidance
├── Widget_Configuration_Overview.md  # UI/UX specifications
├── WidgetConfigurator-Walkthrough.md # User flow details
├── CLAUDE.md                         # Project conventions
└── INITIAL.md                        # Feature requirements
```

### Desired Codebase Structure (Files to Create)
```bash
src/
├── lib/
│   ├── components/
│   │   ├── WidgetConfigurator.svelte         # Main modal component
│   │   ├── WidgetWrapper.svelte              # Live preview wrapper
│   │   ├── WidgetLibrary.svelte              # Library tab component
│   │   ├── AIGenerateTab.svelte              # AI generation tab
│   │   ├── CustomTabs/                       # Create Custom sub-tabs
│   │   │   ├── GeneralTab.svelte             # General configuration
│   │   │   ├── StyleTab.svelte               # Style configuration  
│   │   │   └── AlertsTab.svelte              # Alerts configuration
│   │   └── widgets/                          # Widget implementations
│   │       ├── GaugeWidget.svelte            # Gauge widget component
│   │       ├── GraphWidget.svelte            # Graph widget component
│   │       └── SimpleWidget.svelte           # Simple widget component
│   ├── stores/
│   │   ├── sensor-data.ts                    # Sensor data store (runes)
│   │   ├── widget-presets.ts                 # Widget preset management
│   │   └── configurator-state.ts             # Configurator modal state
│   ├── schemas/
│   │   └── widget-schemas.ts                 # Zod validation schemas
│   ├── services/
│   │   ├── ai-generation.ts                  # Genkit integration
│   │   ├── websocket-client.ts               # WebSocket management
│   │   └── widget-export.ts                  # Export/import utilities
│   └── types/
│       └── widget-types.ts                   # TypeScript interfaces
├── routes/
│   └── api/
│       └── generate-widget/
│           └── +server.ts                    # SvelteKit API route for AI
└── tests/
    ├── widget-configurator.test.ts           # Component tests
    ├── widget-schemas.test.ts                # Schema validation tests
    └── ai-integration.test.ts                # AI generation tests
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Svelte 5 Runes Patterns
// ✅ Use $state for reactive variables
let widgetConfig = $state<CompleteWidget>({ /* initial config */ });

// ✅ Use $derived for computed values (live preview)
let previewConfig = $derived(() => {
  return {
    ...widgetConfig,
    sensorData: getSensorData(widgetConfig.sensors)
  };
});

// ✅ Use $effect for side effects only
$effect(() => {
  if (widgetConfig.sensors.length > 0) {
    subscribeSensors(widgetConfig.sensors);
  }
});

// ❌ NEVER use legacy reactive statements
// $: previewConfig = { ...widgetConfig }; // DON'T DO THIS

// CRITICAL: Google Genkit Rate Limiting
// Always check rate limits before AI generation
if (!(await aiRateLimiter.checkLimit())) {
  // Handle rate limit exceeded
}

// CRITICAL: Cosmic UI Integration  
// All widgets must extend Cosmic UI Frame components
<Frame type="enhanced" glowEffect={true}>
  <WidgetContent />
</Frame>

// CRITICAL: Zod Validation Required
// All user inputs must be validated with schemas
try {
  const validatedConfig = validateWidgetConfig(userInput);
} catch (error) {
  // Handle validation errors gracefully
}

// CRITICAL: WebSocket Connection Management
// Always handle connection state in stores
const sensorStore = createSensorDataStore();
// Auto-cleanup on component destroy
onDestroy(() => sensorStore.destroy());

// CRITICAL: LayerChart Integration
// Use LayerChart@next for all chart visualizations
import { AreaChart, BarChart, LineChart } from 'layerchart';

// CRITICAL: File Size Limits
// Keep individual files under 500 lines
// Split large components into sub-components
```

## Implementation Blueprint

### Data Models and Structure

Core data models provide type safety and consistency across the widget system:

```typescript
// Central widget configuration types (from widget-schemas.ts)
interface CompleteWidget {
  id: string;
  title: string;
  displayType: 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';
  orientation: 'vertical' | 'horizontal';
  position: { x: number; y: number; width: number; height: number };
  sensors: string[];
  theme: string;
  style: StyleConfig;
  alerts: AlertConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for runtime validation
const CompleteWidgetSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(50),
  displayType: z.enum(['gauge', 'graph', 'simple', 'meter', 'multi-resource']),
  // ... complete validation rules
});

// AI generation interfaces
interface AIGenerationRequest {
  prompt: string;
  context: {
    availableSensors: string[];
    currentTheme: string;
    dashboardState: DashboardState;
  };
  options: {
    creativity: number;
    model: 'gemini-1.5-pro' | 'gemini-1.5-flash';
    maxVariations: number;
  };
}
```

### Implementation Tasks (Ordered)

```yaml
Task 1: Create Core Widget Schemas and Types
MODIFY src/lib/schemas/widget-schemas.ts:
  - COPY complete schemas from examples/widget-schemas.ts
  - PRESERVE all Zod validation rules and TypeScript types
  - ADD export functions for validation helpers

CREATE src/lib/types/widget-types.ts:
  - EXTRACT TypeScript interfaces from schemas
  - ADD dashboard and sensor data interfaces
  - ENSURE consistency with Zod schema definitions

Task 2: Implement Sensor Data Store with Svelte 5 Runes  
CREATE src/lib/stores/sensor-data.ts:
  - MIRROR pattern from examples/websocket-client.ts
  - USE $state for reactive sensor data array
  - USE $derived for computed sensor groups (CPU, GPU, etc.)
  - IMPLEMENT WebSocket connection management with auto-reconnect

CREATE src/lib/services/websocket-client.ts:
  - COPY WebSocket client class from examples/
  - MAINTAIN connection state management
  - ADD subscription handling for specific sensors

Task 3: Create Widget Preset Management Store
CREATE src/lib/stores/widget-presets.ts:
  - USE $state for preset collection
  - IMPLEMENT CRUD operations for custom presets
  - ADD export/import functionality for JSON sharing
  - PROVIDE filtering and search capabilities

Task 4: Implement AI Generation Service
CREATE src/lib/services/ai-generation.ts:
  - COPY Genkit integration from examples/genkit-integration.ts
  - IMPLEMENT rate limiting with AIRateLimiter class
  - ADD context-aware prompt building
  - SUPPORT streaming responses for real-time feedback

CREATE src/routes/api/generate-widget/+server.ts:
  - CREATE SvelteKit API endpoint for AI generation
  - HANDLE POST requests with AIGenerationRequest
  - RETURN AIGenerationResponse with variations
  - IMPLEMENT proper error handling and validation

Task 5: Build Core Widget Components
CREATE src/lib/components/widgets/GaugeWidget.svelte:
  - USE LayerChart for gauge visualizations
  - EXTEND Cosmic UI Frame components
  - SUPPORT circular, arc, and linear gauge styles
  - IMPLEMENT real-time data updates via sensor store

CREATE src/lib/components/widgets/GraphWidget.svelte:
  - USE LayerChart for line/area/bar charts
  - SUPPORT historical data visualization
  - IMPLEMENT zoom and pan functionality
  - ADD responsive design for different sizes

CREATE src/lib/components/widgets/SimpleWidget.svelte:
  - CREATE minimalist single-value display
  - SUPPORT icon integration from Cosmic UI
  - IMPLEMENT typography customization
  - ADD alert state visual indicators

Task 6: Create Live Preview Wrapper
CREATE src/lib/components/WidgetWrapper.svelte:
  - ACCEPT widget configuration as prop
  - USE $derived for reactive rendering
  - ROUTE to appropriate widget component based on displayType
  - APPLY Cosmic UI theming and styling
  - HANDLE loading states and error conditions

Task 7: Implement Custom Configuration Tabs
CREATE src/lib/components/CustomTabs/GeneralTab.svelte:
  - PROVIDE widget title, display type, sensors selection
  - USE Cosmic UI form components (Input, Select)
  - IMPLEMENT real-time validation feedback
  - SUPPORT multi-sensor selection for multi-resource widgets

CREATE src/lib/components/CustomTabs/StyleTab.svelte:
  - ORGANIZE into accordion sections (Appearance, Icon, Typography, Border)
  - USE ColorPicker, Slider components from Cosmic UI
  - SUPPORT display-type-specific styling options
  - IMPLEMENT theme-aware color suggestions

CREATE src/lib/components/CustomTabs/AlertsTab.svelte:
  - PROVIDE threshold configuration interface
  - SUPPORT multiple alert conditions per widget
  - IMPLEMENT color and message customization
  - ADD enable/disable toggle for alert system

Task 8: Build Library and AI Tabs
CREATE src/lib/components/WidgetLibrary.svelte:
  - DISPLAY preset cards with thumbnails
  - IMPLEMENT "Add from Library" functionality
  - ADD context menu with Edit/Duplicate/Delete/Export
  - SUPPORT filtering by category and search
  - IMPLEMENT "Edit from Library" -> Custom tab population

CREATE src/lib/components/AIGenerateTab.svelte:
  - PROVIDE natural language prompt input
  - IMPLEMENT AI generation with loading states
  - DISPLAY variation cards with confidence scores
  - ADD "Apply & Edit" to jump to Custom tabs
  - HANDLE rate limiting and error messages

Task 9: Create Main Configurator Component
CREATE src/lib/components/WidgetConfigurator.svelte:
  - IMPLEMENT two-column layout with responsive design
  - CREATE tabbed interface (Library, AI Generate, Create Custom)
  - INTEGRATE live preview with $derived updates
  - ADD modal backdrop and Cosmic UI Frame wrapper
  - IMPLEMENT keyboard shortcuts (Escape, Ctrl+Enter, Ctrl+Tab)
  - SUPPORT export/import functionality
  - HANDLE widget creation, editing, and saving workflows

Task 10: Add Export/Import Utilities
CREATE src/lib/services/widget-export.ts:
  - IMPLEMENT JSON export with metadata
  - VALIDATE imported configurations with Zod
  - SUPPORT batch export/import for multiple widgets
  - ADD version compatibility checking
  - GENERATE downloadable files and handle file uploads

Task 11: Implement Configurator State Management
CREATE src/lib/stores/configurator-state.ts:
  - USE $state for modal open/close state
  - MANAGE current editing widget
  - TRACK active tab and sub-tab state
  - IMPLEMENT undo/redo functionality for configurations
  - PROVIDE global configurator controls
```

### Integration Points
```yaml
DASHBOARD INTEGRATION:
  - toolbar: "Add Widget (+)" button opens configurator
  - context_menu: "Edit Widget" on right-click loads existing config
  - drag_drop: NeoDrag integration for widget positioning
  - real_time: WebSocket sensor data updates in preview and widgets

COSMIC_UI_INTEGRATION:
  - theme: Inherit dashboard theme settings
  - components: Frame, Button, Input, Select, ColorPicker, Slider
  - styling: Sci-fi glow effects and animations
  - accessibility: ARIA labels and keyboard navigation

AI_INTEGRATION:
  - context: Include dashboard state, available sensors, user preferences
  - streaming: Progressive preview updates during generation
  - rate_limiting: 10 requests per minute per user
  - fallback: Graceful degradation when AI unavailable

WEBSOCKET_INTEGRATION:
  - connection: Auto-connect on configurator open
  - subscription: Subscribe to sensors selected in preview
  - cleanup: Unsubscribe on modal close
  - error_handling: Display connection status in preview area
```

## Validation Loop

### Level 1: Syntax & Style  
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint for code quality
npm run format                  # Prettier for formatting  
npm run type-check              # TypeScript compilation check

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests  
```typescript
// CREATE tests/widget-configurator.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import WidgetConfigurator from '../src/lib/components/WidgetConfigurator.svelte';

test('opens with Library tab active by default', async () => {
  const { getByText } = render(WidgetConfigurator, { isOpen: true });
  expect(getByText('Library')).toHaveClass('text-cyan-400');
});

test('live preview updates when config changes', async () => {
  const { getByDisplayValue, getByTestId } = render(WidgetConfigurator, { 
    isOpen: true, 
    props: { activeTab: 'create-custom' }
  });
  
  const titleInput = getByDisplayValue('New Widget');
  await fireEvent.input(titleInput, { target: { value: 'CPU Monitor' } });
  
  const preview = getByTestId('widget-preview');
  expect(preview).toContainHTML('CPU Monitor');
});

// CREATE tests/ai-integration.test.ts  
test('AI generation handles rate limiting', async () => {
  // Mock rate limiter to return false
  const response = await generateWidget(mockRequest);
  expect(response.success).toBe(false);
  expect(response.error).toContain('Rate limit exceeded');
});

// CREATE tests/widget-schemas.test.ts
test('validates complete widget configuration', () => {
  const validConfig = { /* valid widget config */ };
  const result = validateWidgetConfig(validConfig);
  expect(result).toEqual(validConfig);
});

test('rejects invalid widget configuration', () => {
  const invalidConfig = { title: '' }; // Invalid: empty title
  expect(() => validateWidgetConfig(invalidConfig)).toThrow();
});
```

```bash
# Run and iterate until passing:
npm run test
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Tests
```bash
# Start the development server
npm run dev

# Test the configurator in browser:
# 1. Open http://localhost:5173
# 2. Click "+" button in toolbar
# 3. Verify modal opens with Library tab active
# 4. Switch to "Create Custom" tab
# 5. Change widget title and verify live preview updates
# 6. Switch to "AI Generate" tab
# 7. Enter prompt and verify generation (with valid API key)
# 8. Test export/import functionality

# Test WebSocket connection:
# 1. Check browser network tab for WebSocket connection
# 2. Verify sensor data appears in live preview
# 3. Test connection error handling by stopping backend

# Expected: All user flows work smoothly, no console errors
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`  
- [ ] No type errors: `npm run type-check`
- [ ] Modal opens via toolbar "+" button
- [ ] Library tab displays presets and allows quick add
- [ ] AI Generate tab creates widgets from prompts
- [ ] Create Custom tab provides granular controls
- [ ] Live preview updates in real-time
- [ ] Export/import functionality works
- [ ] WebSocket connection provides real sensor data
- [ ] Keyboard shortcuts function properly
- [ ] Error cases handled gracefully
- [ ] Cosmic UI theming consistent throughout

---

## Anti-Patterns to Avoid
- ❌ Don't use legacy Svelte reactive statements ($:) - use runes exclusively
- ❌ Don't bypass Zod validation for user inputs - always validate
- ❌ Don't create large monolithic components - split into focused sub-components  
- ❌ Don't ignore WebSocket connection errors - implement proper error handling
- ❌ Don't hardcode API endpoints - use environment variables
- ❌ Don't skip rate limiting for AI requests - prevent quota exhaustion
- ❌ Don't forget to cleanup subscriptions and timers on component destroy
- ❌ Don't mix Chart.js with LayerChart - use LayerChart exclusively for Svelte
- ❌ Don't ignore accessibility - implement proper ARIA labels and keyboard nav

---

## Confidence Score: 9/10

This PRP provides comprehensive context, detailed implementation steps, working examples, and validation criteria needed for successful one-pass implementation. The high confidence score reflects:

- **Complete reference implementations** in examples/ directory
- **Detailed UI/UX specifications** from reference documents  
- **Modern framework patterns** with Svelte 5 runes and Google Genkit
- **Robust validation** with Zod schemas and comprehensive testing
- **Real-world context** from WebSocket integration and Cosmic UI theming
- **Iterative refinement** through validation loops and error handling

The implementation should succeed in creating a production-ready Widget Configurator that matches the SenseCanvas vision while providing extensibility for future enhancements.