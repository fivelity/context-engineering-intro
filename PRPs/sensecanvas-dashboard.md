name: "SenseCanvas: Complete PC Hardware Monitoring Dashboard"
description: |

## Purpose
A comprehensive PRP for implementing SenseCanvas - a futuristic, real-time PC hardware monitoring dashboard that combines sci-fi aesthetics with deep customization, AI-powered intelligence, and seamless performance. This PRP provides complete context for one-pass implementation success.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the established codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Follow all rules in CLAUDE.md - especially Svelte 5 runes

---

## Goal
Build SenseCanvas - a production-ready, futuristic PC hardware monitoring dashboard that delivers an overwhelmingly positive user experience for tech enthusiasts and PC gamers. The dashboard must provide real-time hardware metrics visualization with <1s latency, immersive widget customization, AI-powered generation, and community sharing capabilities.

## Why
- **Business value**: Creates a premium dashboard experience for PC enthusiasts and gamers
- **Integration**: Showcases cutting-edge web technologies with real-world hardware monitoring
- **Problems solved**: Eliminates the need for multiple monitoring tools by providing unified, customizable, and intelligent hardware visualization
- **User impact**: Transforms boring hardware stats into an engaging, sci-fi experience

## What
A cross-platform dashboard application featuring:
- Real-time hardware monitoring with WebSocket streaming (<1s intervals)
- Drag-and-drop widget system with live previews
- AI-powered widget generation using natural language prompts
- Modal-based widget configurator with Library, AI Generate, and Create Custom tabs
- Theme system supporting Gaming, RGB, cyberpunk, and minimalist aesthetics
- JSON import/export for community configuration sharing
- Windows optimization with LibreHardwareMonitor integration and cross-platform psutil fallbacks

### Success Criteria
- [ ] Real-time hardware data streaming with <1s latency via WebSockets
- [ ] Functional widget configurator with tabbed interface and live preview
- [ ] AI widget generation using Google Genkit integration
- [ ] Drag-and-drop grid layout with bounds checking and collision detection
- [ ] Theme system with sci-fi aesthetics using Cosmic UI
- [ ] Widget configuration JSON export/import functionality
- [ ] Cross-platform compatibility with Windows admin privileges optimization
- [ ] All Svelte 5 runes patterns implemented correctly
- [ ] Comprehensive test coverage for all components
- [ ] Production-ready error handling and graceful degradation

## All Needed Context

### Documentation & References (MUST READ - Include these in your context window)
```yaml
# Svelte 5 Runes - CRITICAL for correct implementation
- url: https://svelte.dev/docs/svelte/v5-migration-guide
  why: Essential migration patterns - avoid mixing runes with Svelte 4 patterns
  critical: Use $state(), $derived(), $effect() with proper cleanup

- url: https://svelte.dev/docs/svelte/what-are-runes
  why: Core runes API documentation and syntax examples
  critical: Always return cleanup functions from $effect()

- url: https://next.neodrag.dev/docs/svelte
  why: Svelte 5 {@attach draggable()} syntax and bounds configuration
  critical: Use new attachment syntax, not legacy actions

- url: https://www.layerchart.com/
  why: LayerChart@next for Svelte 5 compatible charts and visualizations
  critical: Use v2.0.0-next releases for Svelte 5 compatibility

- url: https://cosmic-ui.com/docs
  why: Cosmic UI framework for sci-fi themed components
  critical: Frame components and SVG extensions for futuristic aesthetics

- url: https://firebase.google.com/docs/genkit/models
  why: Google Genkit content generation API for AI widget creation
  critical: Use generate() method with structured output

- url: https://fastapi.tiangolo.com/advanced/websockets/
  why: FastAPI WebSocket implementation for real-time data streaming
  critical: Connection management, error handling, and broadcasting patterns

- url: https://github.com/snip3rnick/PyHardwareMonitor
  why: LibreHardwareMonitor pythonnet integration examples
  critical: Admin privileges required, graceful psutil fallback

# Established patterns from codebase examples
- file: examples/svelte5-runes/ReactiveWidget.svelte
  why: Svelte 5 runes patterns for reactive state management
  critical: WebSocket cleanup in $effect(), proper $state() usage

- file: examples/widget-configurator/WidgetConfigurator.svelte
  why: Modal configurator implementation with tabs and live preview
  critical: Tab navigation, form validation with Zod, export/import

- file: examples/fastapi-websockets/main.py
  why: FastAPI WebSocket server with connection management
  critical: ConnectionManager class, broadcasting, proper error handling

- file: examples/hardware-monitor/hardware_monitor.py
  why: LibreHardwareMonitor integration with fallback patterns
  critical: DLL loading, admin check, cross-platform psutil fallback

- file: examples/widget-configs/widget-schemas.ts
  why: Zod schema definitions for widget configurations
  critical: Discriminated unions, validation rules, type safety

- file: examples/genkit-integration/ai-widget-generator.ts
  why: Google Genkit AI generation endpoints and prompt engineering
  critical: Rate limiting, caching, configuration validation

- file: examples/types/widget.ts
  why: TypeScript type definitions for widget configurations
  critical: Complete type coverage for all widget properties
```

### Current Codebase tree
```bash
context-engineering-intro/
├── examples/
│   ├── README.md                     # Pattern documentation
│   ├── fastapi-websockets/
│   │   └── main.py                   # WebSocket server implementation
│   ├── genkit-integration/
│   │   └── ai-widget-generator.ts    # AI generation integration
│   ├── hardware-monitor/
│   │   └── hardware_monitor.py       # Hardware monitoring with LibreHardware
│   ├── svelte5-runes/
│   │   └── ReactiveWidget.svelte     # Svelte 5 runes patterns
│   ├── types/
│   │   ├── sensor.ts                 # Hardware sensor types
│   │   └── widget.ts                 # Widget configuration types
│   ├── widget-configs/
│   │   └── widget-schemas.ts         # Zod validation schemas
│   └── widget-configurator/
│       └── WidgetConfigurator.svelte # Modal configurator implementation
├── PRPs/
│   └── templates/
│       └── prp_base.md               # PRP template structure
├── CLAUDE.md                         # Project instructions and rules
└── INITIAL.md                        # Feature requirements
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
sensecanvas/
├── client/                           # SvelteKit frontend application
│   ├── src/
│   │   ├── app.html                  # Main HTML template
│   │   ├── app.d.ts                  # TypeScript app declarations
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── Dashboard.svelte           # Main dashboard container
│   │   │   │   │   ├── DashboardGrid.svelte      # Grid layout manager
│   │   │   │   │   └── EditModeToolbar.svelte    # Edit mode controls
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── BaseWidget.svelte         # Base widget container
│   │   │   │   │   ├── GaugeWidget.svelte        # Gauge visualization
│   │   │   │   │   ├── GraphWidget.svelte        # Chart visualization
│   │   │   │   │   ├── TextWidget.svelte         # Text display
│   │   │   │   │   └── MultiSensorWidget.svelte  # Multi-sensor display
│   │   │   │   ├── configurator/
│   │   │   │   │   ├── WidgetConfigurator.svelte # Main configurator modal
│   │   │   │   │   ├── LibraryTab.svelte         # Preset widget library
│   │   │   │   │   ├── AiGenerateTab.svelte      # AI generation interface
│   │   │   │   │   ├── CreateCustomTab.svelte    # Custom widget creation
│   │   │   │   │   └── WidgetPreview.svelte      # Live preview component
│   │   │   │   ├── ui/
│   │   │   │   │   ├── ThemeSelector.svelte      # Theme switching
│   │   │   │   │   ├── ConnectionStatus.svelte   # WebSocket status
│   │   │   │   │   └── NotificationCenter.svelte # Alert notifications
│   │   │   │   └── common/
│   │   │   │       ├── Modal.svelte              # Reusable modal component
│   │   │   │       └── LoadingSpinner.svelte     # Loading indicators
│   │   │   ├── stores/
│   │   │   │   ├── websocket.svelte.ts           # WebSocket connection store
│   │   │   │   ├── dashboard.svelte.ts           # Dashboard state management
│   │   │   │   ├── widgets.svelte.ts             # Widget configurations
│   │   │   │   └── theme.svelte.ts               # Theme management
│   │   │   ├── utils/
│   │   │   │   ├── websocket-client.ts           # WebSocket client utilities
│   │   │   │   ├── widget-factory.ts             # Widget creation helpers
│   │   │   │   ├── theme-utils.ts                # Theme utilities
│   │   │   │   └── validation.ts                 # Client-side validation
│   │   │   └── types/
│   │   │       ├── dashboard.ts                  # Dashboard type definitions
│   │   │       ├── hardware.ts                   # Hardware metric types
│   │   │       ├── widgets.ts                    # Widget configuration types
│   │   │       └── theme.ts                      # Theme type definitions
│   │   ├── routes/
│   │   │   ├── +layout.svelte                    # Root layout
│   │   │   ├── +page.svelte                      # Main dashboard page
│   │   │   └── api/
│   │   │       ├── ai/
│   │   │       │   ├── generate-widget/+server.ts   # AI widget generation
│   │   │       │   └── generate-layout/+server.ts   # AI layout generation
│   │   │       └── config/
│   │   │           ├── export/+server.ts           # Configuration export
│   │   │           └── import/+server.ts           # Configuration import
│   │   ├── static/                               # Static assets
│   │   │   ├── icons/                            # Icon assets
│   │   │   └── themes/                           # Theme assets
│   │   └── app.css                               # Global styles
│   ├── package.json                              # Dependencies
│   ├── vite.config.ts                            # Vite configuration
│   ├── tailwind.config.ts                        # TailwindCSS 4+ config
│   └── tsconfig.json                             # TypeScript configuration
├── server/                                       # FastAPI backend application
│   ├── src/
│   │   ├── main.py                               # FastAPI application entry
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── websocket.py                      # WebSocket endpoints
│   │   │   ├── hardware.py                       # Hardware API endpoints
│   │   │   └── ai.py                             # AI generation endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── hardware_monitor.py               # Hardware monitoring service
│   │   │   ├── websocket_manager.py              # WebSocket connection manager
│   │   │   └── ai_service.py                     # AI generation service
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── hardware.py                       # Hardware metric models
│   │   │   ├── widgets.py                        # Widget configuration models
│   │   │   └── responses.py                      # API response models
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py                         # Configuration management
│   │   │   └── dependencies.py                   # FastAPI dependencies
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── hardware_utils.py                 # Hardware utility functions
│   │       └── validation.py                     # Server-side validation
│   ├── requirements.txt                          # Python dependencies
│   ├── LibreHardwareMonitorLib.dll               # Windows hardware monitoring
│   └── pyproject.toml                            # Python project configuration
├── tests/                                        # Test suite
│   ├── client/
│   │   ├── components/                           # Component tests
│   │   ├── stores/                               # Store tests
│   │   └── utils/                                # Utility tests
│   ├── server/
│   │   ├── api/                                  # API endpoint tests
│   │   ├── services/                             # Service tests
│   │   └── models/                               # Model tests
│   └── integration/                              # Integration tests
├── docs/                                         # Documentation
│   ├── README.md                                 # Project overview
│   ├── SETUP.md                                  # Setup instructions
│   └── API.md                                    # API documentation
├── .env.example                                  # Environment variables template
├── docker-compose.yml                            # Docker development setup
└── README.md                                     # Main project README
```

### Known Gotchas of our codebase & Library Quirks
```python
# CRITICAL: Svelte 5 runes - NEVER mix with Svelte 4 patterns
# ❌ WRONG: $: reactive statements, stores, export let
# ✅ CORRECT: $state(), $derived(), $effect() with cleanup

# CRITICAL: LibreHardwareMonitor requires Windows admin privileges
# Example: Backend must run as administrator for full sensor access
# Example: Always implement psutil fallback for cross-platform support

# CRITICAL: NeoDrag@next uses {@attach draggable()} syntax in Svelte 5
# ❌ WRONG: use:draggable legacy action syntax
# ✅ CORRECT: {@attach draggable([bounds(BoundsFrom.parent())])}

# CRITICAL: LayerChart@next v2.0.0-next is required for Svelte 5
# Example: Use Canvas fallback when >20 widgets are active for performance

# CRITICAL: WebSocket cleanup in $effect is mandatory
# Example: Always return cleanup function to prevent memory leaks

# CRITICAL: Cosmic UI Frame components for sci-fi aesthetics
# Example: Use Frame wrapper for all widgets with SVG extensions

# CRITICAL: Zod validation for all widget configurations
# Example: Use discriminated unions for different widget types

# CRITICAL: Google Genkit rate limiting and caching
# Example: Implement client-side caching, 1 request per 10 seconds

# CRITICAL: TailwindCSS 4+ new color palette syntax
# Example: Use new CSS custom properties approach

# CRITICAL: Pydantic v2.11+ for all server models
# Example: Use Field() for validation, model_dump() for serialization
```

## Implementation Blueprint

### Data models and structure

Create the core data models first to ensure type safety and consistency across the entire application.

```python
# server/src/models/hardware.py - Hardware metric models
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union
from datetime import datetime

class CpuMetrics(BaseModel):
    usage: float = Field(..., ge=0, le=100, description="CPU usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="CPU temperature in Celsius")
    cores: List[Dict[str, Union[int, float]]] = Field(..., description="Per-core metrics")
    frequency: float = Field(..., ge=0, description="CPU frequency in MHz")
    power: float = Field(..., ge=0, description="CPU power consumption in watts")

class GpuMetrics(BaseModel):
    usage: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=0, le=150)
    memory: Dict[str, Union[int, float]] = Field(..., description="GPU memory stats")
    frequency: Dict[str, float] = Field(..., description="GPU frequencies")
    power: float = Field(..., ge=0)
    fanSpeed: float = Field(..., ge=0)

class HardwareMetrics(BaseModel):
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    cpu: CpuMetrics
    gpu: GpuMetrics
    memory: Dict[str, Union[int, float]]
    storage: List[Dict[str, Union[int, float, str]]]
    network: Dict[str, Union[int, float]]
    system: Dict[str, Union[int, float]]

# client/src/lib/types/widgets.ts - Widget configuration types
import { z } from 'zod';

export const WidgetConfigSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['gauge', 'graph', 'text', 'multi-sensor']),
  title: z.string().min(1).max(50),
  sensorType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']),
  position: z.object({ x: z.number().min(0), y: z.number().min(0) }),
  size: z.object({ width: z.number().min(100), height: z.number().min(100) }),
  style: z.object({
    theme: z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']),
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
    opacity: z.number().min(0).max(1),
    borderRadius: z.number().min(0)
  }),
  alerts: z.object({
    enabled: z.boolean(),
    thresholds: z.object({
      warning: z.number().min(0).max(100),
      critical: z.number().min(0).max(100)
    })
  })
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Setup Project Structure and Configuration
CREATE sensecanvas/ directory structure:
  - PATTERN: Follow examples structure with client/server separation
  - Initialize SvelteKit project with TypeScript and TailwindCSS 4+
  - Initialize FastAPI project with async support
  - Setup environment configuration and dependencies

Task 2: Implement Core Data Models
CREATE server/src/models/:
  - PATTERN: Mirror examples/types/ structure with Pydantic models
  - Implement hardware metric models with validation
  - Implement widget configuration models
  - Implement API response models

CREATE client/src/lib/types/:
  - PATTERN: Mirror server models with Zod schemas
  - Ensure type compatibility between client and server
  - Implement discriminated unions for widget types

Task 3: Implement Hardware Monitoring Service
CREATE server/src/services/hardware_monitor.py:
  - PATTERN: Follow examples/hardware-monitor/hardware_monitor.py exactly
  - Implement LibreHardwareMonitor integration with pythonnet
  - Implement psutil fallback for cross-platform support
  - Implement admin privilege checking and graceful degradation

Task 4: Implement WebSocket Server
CREATE server/src/services/websocket_manager.py:
  - PATTERN: Follow examples/fastapi-websockets/main.py ConnectionManager
  - Implement connection management with proper cleanup
  - Implement message broadcasting for hardware metrics
  - Implement subscription management for different data types

CREATE server/src/api/websocket.py:
  - PATTERN: Follow FastAPI WebSocket endpoint patterns
  - Implement main WebSocket endpoint with error handling
  - Implement connection lifecycle management
  - Implement heartbeat and reconnection logic

Task 5: Implement Frontend Stores and WebSocket Client
CREATE client/src/lib/stores/websocket.svelte.ts:
  - PATTERN: Follow examples/svelte5-runes/ReactiveWidget.svelte WebSocket patterns
  - Use $state() for connection status and error handling
  - Implement $effect() with proper cleanup for WebSocket lifecycle
  - Implement automatic reconnection logic

CREATE client/src/lib/stores/dashboard.svelte.ts:
  - PATTERN: Use Svelte 5 runes for reactive state management
  - Implement widget collection management with $state()
  - Implement edit mode state and selected widget tracking
  - Implement theme management and layout persistence

Task 6: Implement Base Widget Components
CREATE client/src/lib/components/widgets/BaseWidget.svelte:
  - PATTERN: Use {@attach draggable()} from NeoDrag@next
  - Implement Cosmic UI Frame wrapper for sci-fi aesthetics
  - Implement resize handles and bounds checking
  - Use $state() for widget-specific reactive properties

CREATE widget type components (Gauge, Graph, Text, MultiSensor):
  - PATTERN: Use LayerChart@next for chart components
  - Implement Svelte 5 runes for reactive data updates
  - Use Cosmic UI styling for consistent sci-fi theme
  - Implement alert thresholds and visual indicators

Task 7: Implement Dashboard Grid System
CREATE client/src/lib/components/dashboard/DashboardGrid.svelte:
  - PATTERN: Use CSS Grid with NeoDrag bounds configuration
  - Implement collision detection and grid snapping
  - Use $derived() for computed grid properties
  - Implement edit mode with toolbar integration

Task 8: Implement Widget Configurator
CREATE client/src/lib/components/configurator/WidgetConfigurator.svelte:
  - PATTERN: Follow examples/widget-configurator/WidgetConfigurator.svelte exactly
  - Implement tabbed interface with Svelte 5 runes
  - Use Zod validation with real-time error feedback
  - Implement JSON export/import functionality

CREATE tab components (Library, AiGenerate, CreateCustom):
  - PATTERN: Use consistent validation and form patterns
  - Implement live preview updates using $derived()
  - Use proper TypeScript types throughout

Task 9: Implement AI Generation Service
CREATE server/src/services/ai_service.py:
  - PATTERN: Follow examples/genkit-integration/ai-widget-generator.ts
  - Implement Google Genkit integration for widget generation
  - Implement rate limiting and response caching
  - Implement prompt engineering for widget creation

CREATE client/src/routes/api/ai/:
  - PATTERN: SvelteKit API routes with TypeScript
  - Implement widget generation endpoints
  - Implement layout generation endpoints
  - Integrate with frontend AI generation tab

Task 10: Implement Theme System
CREATE client/src/lib/stores/theme.svelte.ts:
  - PATTERN: Use TailwindCSS 4+ custom properties
  - Implement theme switching with $state()
  - Implement theme inheritance for all components
  - Support Gaming, RGB, cyberpunk, and minimalist themes

Task 11: Implement Configuration Import/Export
CREATE client/src/routes/api/config/:
  - PATTERN: Use Zod validation for imported configurations
  - Implement JSON export with metadata
  - Implement import validation and compatibility checking
  - Support both widget and layout configurations

Task 12: Add Comprehensive Testing
CREATE tests/ structure:
  - PATTERN: Mirror examples test patterns with mocking
  - Implement component tests for all Svelte components
  - Implement API tests for all FastAPI endpoints
  - Implement integration tests for WebSocket communication
  - Mock hardware sensors and AI generation for consistent testing

Task 13: Add Production Configuration
CREATE deployment configuration:
  - PATTERN: Docker compose for development
  - Environment variable configuration
  - Production build optimization
  - Error monitoring and logging setup
```

### Per task pseudocode as needed

```typescript
// Task 5: WebSocket Store Implementation
// client/src/lib/stores/websocket.svelte.ts
let connectionStatus = $state<'connecting' | 'connected' | 'disconnected'>('disconnected');
let hardwareMetrics = $state<HardwareMetrics | null>(null);
let error = $state<string | null>(null);

// PATTERN: Always use $effect() with cleanup for WebSocket lifecycle
$effect(() => {
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  const connect = () => {
    try {
      ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onopen = () => {
        connectionStatus = 'connected';
        error = null;
        // Send subscription message
        ws?.send(JSON.stringify({ type: 'subscribe', subscription_type: 'hardware_metrics' }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'hardware_metrics') {
          hardwareMetrics = data.data;
        }
      };

      ws.onclose = () => {
        connectionStatus = 'disconnected';
        // Auto-reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };

    } catch (e) {
      error = `Connection failed: ${e}`;
    }
  };

  connect();

  // CRITICAL: Return cleanup function to prevent memory leaks
  return () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };
});

// Task 6: Base Widget Component
// client/src/lib/components/widgets/BaseWidget.svelte
<script lang="ts">
  import { draggable, bounds, BoundsFrom } from '@neodrag/svelte';
  import { Frame } from '@cosmic-ui/svelte';
  import type { WidgetConfig } from '$lib/types/widgets.js';

  interface Props {
    config: WidgetConfig;
    onUpdate: (config: WidgetConfig) => void;
    isEditMode: boolean;
  }

  let { config, onUpdate, isEditMode }: Props = $props();

  // PATTERN: Use $state() for widget-specific reactive properties
  let isSelected = $state(false);
  let isResizing = $state(false);

  // PATTERN: Use $derived() for computed properties
  let widgetStyle = $derived(() => ({
    width: `${config.size.width}px`,
    height: `${config.size.height}px`,
    transform: `translate(${config.position.x}px, ${config.position.y}px)`,
    opacity: config.style.opacity,
    borderRadius: `${config.style.borderRadius}px`
  }));

  // Handle position updates from dragging
  function handleDragUpdate(event: CustomEvent) {
    const { x, y } = event.detail;
    onUpdate({
      ...config,
      position: { x, y }
    });
  }
</script>

<!-- CRITICAL: Use Cosmic UI Frame for sci-fi aesthetics -->
<Frame
  class="widget-container"
  style={widgetStyle}
  class:selected={isSelected}
  class:edit-mode={isEditMode}
>
  <!-- CRITICAL: Use {@attach draggable()} Svelte 5 syntax -->
  {#if isEditMode}
    <div
      {@attach draggable([
        bounds(BoundsFrom.parent()),
        grid([20, 20])
      ])}
      on:neodrag={handleDragUpdate}
      class="drag-handle"
    >
      <!-- Widget content slot -->
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</Frame>

// Task 9: AI Service Implementation
// server/src/services/ai_service.py
from genkit import genkit, generate
from genkit.models import gemini15Pro
import asyncio
from typing import Dict, Any, Optional

class AiWidgetService:
    def __init__(self):
        self.rate_limiter = {}
        self.cache = {}
        
    async def generate_widget(self, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # PATTERN: Check rate limiting (1 request per 10 seconds)
        client_id = context.get('user_id', 'anonymous')
        if self._is_rate_limited(client_id):
            raise ValueError("Rate limit exceeded")
            
        # PATTERN: Check cache first
        cache_key = f"{prompt}-{hash(str(context))}"
        if cache_key in self.cache:
            return self.cache[cache_key]
            
        # CRITICAL: Build comprehensive prompt with context
        full_prompt = self._build_widget_prompt(prompt, context)
        
        # PATTERN: Use Genkit generate() with structured output
        result = await generate(
            model=gemini15Pro,
            prompt=full_prompt,
            config={
                'temperature': 0.7,
                'max_output_tokens': 1000
            }
        )
        
        # PATTERN: Parse and validate generated configuration
        widget_config = self._parse_widget_config(result.text)
        validated_config = self._validate_and_enhance_config(widget_config, context)
        
        # Cache the result
        self.cache[cache_key] = validated_config
        self._update_rate_limit(client_id)
        
        return validated_config
```

### Integration Points
```yaml
ENVIRONMENT:
  - add to: .env
  - vars: |
      # Frontend Configuration
      VITE_WEBSOCKET_URL=ws://localhost:8000/ws
      VITE_API_BASE_URL=http://localhost:8000
      
      # Backend Configuration
      CORS_ORIGINS=http://localhost:5173,http://localhost:3000
      
      # Hardware Monitoring
      LIBREHARDWARE_DLL_PATH=./LibreHardwareMonitorLib.dll
      POLLING_INTERVAL_MS=1000
      
      # AI Generation
      GENKIT_API_KEY=your_genkit_api_key
      GENKIT_MODEL=gemini-1.5-pro
      AI_RATE_LIMIT_SECONDS=10
      
      # WebSocket Configuration
      WS_MAX_CONNECTIONS=100
      WS_HEARTBEAT_INTERVAL=30

DEPENDENCIES:
  client: |
    @neodrag/svelte@next
    @cosmic-ui/svelte
    layerchart@next
    zod
    @tailwindcss/core@next
    
  server: |
    fastapi[all]
    websockets
    pydantic[email]>=2.11
    pythonnet
    psutil
    google-genkit
    
DATABASE:
  - storage: "Local storage for widget configurations"
  - persistence: "JSON files for dashboard layouts"
  
CONFIG:
  - add to: client/vite.config.ts
  - pattern: "WebSocket proxy for development"
  
ROUTES:
  - add to: client/src/routes/api/
  - pattern: "SvelteKit API routes for AI generation and config management"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Client validation
cd client
npm run lint              # ESLint + Prettier
npm run check             # Svelte check + TypeScript
npm run build             # Production build test

# Server validation  
cd server
ruff check src/ --fix     # Python linting
mypy src/                 # Type checking
pytest --no-cov          # Quick syntax validation

# Expected: No errors. If errors, READ and fix before proceeding.
```

### Level 2: Unit Tests
```typescript
// test_widget_configurator.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import WidgetConfigurator from '$lib/components/configurator/WidgetConfigurator.svelte';

test('widget configurator tabs switch correctly', async () => {
  render(WidgetConfigurator, { isOpen: true });
  
  const aiTab = screen.getByText('AI Generate');
  await fireEvent.click(aiTab);
  
  expect(screen.getByText('Enter your widget description')).toBeInTheDocument();
});

test('widget validation shows errors for invalid config', async () => {
  const { component } = render(WidgetConfigurator, { isOpen: true });
  
  // Test invalid configuration
  component.$$set({
    currentConfig: { title: '', size: { width: 50, height: 50 } }
  });
  
  expect(screen.getByText('Title is required')).toBeInTheDocument();
  expect(screen.getByText('Width must be at least 100')).toBeInTheDocument();
});

# test_hardware_monitor.py
import pytest
from unittest.mock import Mock, patch
from server.src.services.hardware_monitor import HardwareMonitor

@pytest.mark.asyncio
async def test_hardware_monitor_initialization():
    """Test hardware monitor initializes correctly"""
    monitor = HardwareMonitor()
    await monitor.initialize()
    assert monitor.is_initialized is True

@pytest.mark.asyncio  
async def test_hardware_monitor_fallback_to_psutil():
    """Test graceful fallback when LibreHardwareMonitor unavailable"""
    with patch('clr.AddReference', side_effect=ImportError):
        monitor = HardwareMonitor()
        await monitor.initialize()
        assert monitor.use_libre_hardware is False
        assert monitor.is_initialized is True

@pytest.mark.asyncio
async def test_websocket_connection_management():
    """Test WebSocket connection lifecycle"""
    from server.src.services.websocket_manager import ConnectionManager
    
    manager = ConnectionManager()
    mock_websocket = Mock()
    
    await manager.connect(mock_websocket, "test_client")
    assert "test_client" in manager.active_connections
    
    manager.disconnect("test_client")
    assert "test_client" not in manager.active_connections
```

```bash
# Run tests iteratively until passing:
cd client && npm test
cd server && pytest tests/ -v --cov=src --cov-report=term-missing

# If failing: Debug specific test, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test
```bash
# Start backend server
cd server && python -m src.main

# Start frontend development server  
cd client && npm run dev

# Test WebSocket connection
curl -X GET http://localhost:8000/health
# Expected: {"status": "healthy", "active_connections": 0}

# Test hardware metrics endpoint
curl -X GET http://localhost:8000/metrics
# Expected: {"timestamp": ..., "data": {"cpu": {...}, "gpu": {...}}}

# Test frontend widget configurator
# Open http://localhost:5173
# 1. Click "Add Widget" button
# 2. Switch between Library, AI Generate, and Create Custom tabs
# 3. Create a gauge widget for CPU monitoring
# 4. Verify live preview updates
# 5. Save widget and verify it appears on dashboard
# 6. Test drag and drop functionality in edit mode
# 7. Test theme switching
# 8. Export configuration and re-import

# Test AI generation (requires API keys)
# 1. Go to AI Generate tab
# 2. Enter "Create a red CPU temperature gauge"
# 3. Verify widget generates with appropriate configuration
# 4. Check rate limiting works (try multiple requests quickly)
```

## Final Validation Checklist
- [ ] All tests pass: `npm test` and `pytest tests/`
- [ ] No linting errors: `npm run lint` and `ruff check src/`
- [ ] No type errors: `npm run check` and `mypy src/`
- [ ] WebSocket streaming works with <1s latency
- [ ] Widget configurator tabs function correctly
- [ ] AI generation creates valid widget configurations
- [ ] Drag and drop works with bounds checking
- [ ] Theme switching affects all components
- [ ] JSON export/import preserves configurations
- [ ] Admin privileges handled gracefully on Windows
- [ ] Cross-platform psutil fallback works
- [ ] Error cases handled gracefully (network disconnect, etc.)
- [ ] Memory leaks prevented ($effect cleanup functions work)
- [ ] Production build succeeds without warnings

---

## Anti-Patterns to Avoid
- ❌ Don't mix Svelte 5 runes with Svelte 4 reactive statements ($:)
- ❌ Don't use legacy NeoDrag action syntax - use {@attach draggable()}
- ❌ Don't skip $effect() cleanup functions - causes memory leaks
- ❌ Don't hardcode WebSocket URLs - use environment variables
- ❌ Don't ignore LibreHardwareMonitor admin requirements
- ❌ Don't use sync functions in async WebSocket context
- ❌ Don't skip Zod validation for widget configurations
- ❌ Don't ignore rate limiting for AI generation
- ❌ Don't use TailwindCSS v3 syntax - upgrade to v4 patterns
- ❌ Don't skip bounds checking for draggable widgets
- ❌ Don't forget theme inheritance for custom components

## Confidence Score: 9/10

High confidence due to:
- Comprehensive examples provided in codebase covering all major patterns
- Well-established documentation for all frameworks and libraries
- Clear migration paths for Svelte 5 runes implementation  
- Detailed hardware monitoring integration examples
- Proven WebSocket streaming patterns
- Complete type safety with TypeScript and Pydantic
- Comprehensive validation gates at multiple levels

Minor uncertainty on:
- Google Genkit version 1.14 specific features (documentation shows v1.0-1.13)
- LibreHardwareMonitor DLL deployment specifics in production
- TailwindCSS 4+ exact syntax differences from examples

The extensive codebase examples and clear documentation provide strong foundation for successful one-pass implementation.