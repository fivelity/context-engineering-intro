name: "SenseCanvas: PC Sensor Dashboard with AI Layout Suggestions"
description: |

## Purpose
Build SenseCanvas, a hyper-customizable PC sensor dashboard using SvelteKit, Svelte 5, and Genkit for AI-powered layout suggestions. This comprehensive PRP provides all context needed to implement a production-ready real-time hardware monitoring system.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create SenseCanvas, a modern, real-time, and deeply customizable dashboard for monitoring PC hardware sensors. The application should provide visual widgets for CPU, GPU, RAM, fans, and storage data with AI-powered layout suggestions, extensive customization options, and real-time streaming capabilities.

## Why
- **Business value**: Provides enthusiasts and professionals with a comprehensive PC monitoring solution
- **Integration**: Demonstrates advanced SvelteKit + Svelte 5 patterns with AI integration and real-time data streaming
- **Problems solved**: Eliminates need for multiple monitoring tools; provides unified, customizable, and intelligent dashboard experience

## What
A SvelteKit application featuring:
- **Real-Time Sensor Monitoring**: Connect to FastAPI/Node backend for live sensor data streaming
- **Dynamic Widget Grid**: Draggable/resizable layout with full persistence and lifecycle hooks
- **AI-Powered Layout Suggestions**: Genkit integration for intelligent widget arrangement
- **Extensive Widget Library**: Configurable presets with visual editor
- **Import & Export**: Save/share layouts and individual widgets as JSON
- **Deep Customization**: Widget configurator with reactive form validation
- **Theme System**: Light/dark themes with CSS variables and Tailwind integration

### Success Criteria
- [ ] Real-time sensor data streams from backend to reactive Svelte stores
- [ ] Draggable/resizable widgets with grid snapping and persistence
- [ ] AI layout suggestions generate intelligent widget arrangements
- [ ] Widget configurator allows deep customization of appearance and behavior
- [ ] Import/export functionality for layouts and individual widgets
- [ ] Alert system triggers desktop notifications on threshold breaches
- [ ] Theme switching works across all widgets and components
- [ ] Performance remains smooth with multiple real-time widgets
- [ ] All tests pass and code meets quality standards

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://svelte.dev/docs/kit/routing
  why: SvelteKit routing patterns and file-based routing for dashboard structure
  
- url: https://genkit.dev/
  why: Google Genkit framework for AI-powered layout suggestions
  
- url: https://firebase.google.com/products/genkit
  why: Genkit integration patterns and AI feature implementation
  
- url: https://www.layerchart.com/docs/components/Arc
  why: LayerChart components for gauge, graph, and meter widgets
  
- url: https://www.neodrag.dev/docs/svelte
  why: NeoDrag for draggable/resizable widget grid implementation
  
- url: https://www.skeleton.dev/docs/theming
  why: Skeleton UI theming system integration with Tailwind
  
- url: https://github.com/snip3rnick/PyHardwareMonitor
  why: PyHardwareMonitor library - thin Python layer for LibreHardwareMonitorLib
  
- url: https://apidog.com/blog/fastapi-streaming-response/
  why: FastAPI streaming response patterns for real-time sensor data
  
- url: https://stribny.name/blog/2020/07/real-time-data-streaming-using-fastapi-and-websockets/
  why: WebSocket implementation for real-time data streaming
  
- url: https://zod.dev/
  why: Zod schema validation for widget configuration forms
  
- url: https://developer.mozilla.org/en-US/docs/Web/API/Notification
  why: Notification API for hardware alert system
  
- file: examples/ArcMeter.svelte
  why: Pattern for LayerChart gauge widgets with theme integration
  
- file: examples/DashboardGrid.svelte
  why: Grid layout pattern for widget container
  
- file: examples/DraggableWidget.svelte
  why: NeoDrag integration with position tracking
  
- file: examples/layoutStore.ts
  why: Svelte store pattern for layout persistence
  
- file: examples/ThemeConfig.js
  why: Theme switching implementation
```

### Current Codebase tree
```bash
.
├── examples/
│   ├── ArcMeter.svelte           # LayerChart Arc component example
│   ├── DashboardGrid.svelte      # CSS Grid layout example
│   ├── DraggableWidget.svelte    # NeoDrag integration example
│   ├── ThemeConfig.js           # Theme switching example
│   └── layoutStore.ts           # Layout persistence store
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md
│   └── EXAMPLE_multi_agent_prp.md
├── CLAUDE.md                    # Project instructions
├── FullFeature.md               # Complete SenseCanvas feature spec
├── INITIAL.md                   # Initial feature requirements
└── README.md
```

### Desired Codebase tree with files to be added
```bash
.
├── src/
│   ├── app.d.ts                 # TypeScript declarations
│   ├── app.html                 # HTML template with theme variables
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout with theme provider
│   │   ├── +page.svelte         # Main SenseCanvas dashboard page
│   │   └── api/
│   │       ├── sensors/+server.ts      # Sensor data API endpoints
│   │       └── ai-layout/+server.ts    # AI layout suggestion endpoint
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Dashboard.svelte          # Main dashboard container
│   │   │   ├── DashboardGrid.svelte      # Grid layout with snap
│   │   │   ├── DraggableWidget.svelte    # Base draggable widget
│   │   │   ├── WidgetConfigurator.svelte # Widget customization modal
│   │   │   ├── ThemeToggle.svelte        # Theme switching component
│   │   │   ├── Toolbar.svelte            # Dashboard toolbar
│   │   │   ├── ImportExportModal.svelte  # Layout import/export
│   │   │   └── widgets/
│   │   │       ├── GaugeWidget.svelte    # Circular/arc gauge
│   │   │       ├── GraphWidget.svelte    # Area/bar/line charts
│   │   │       ├── SimpleWidget.svelte   # Single-value display
│   │   │       ├── MeterWidget.svelte    # Horizontal bars
│   │   │       └── MultiResourceWidget.svelte # Aggregate view
│   │   ├── stores/
│   │   │   ├── layoutStore.ts           # Layout persistence store
│   │   │   ├── themeStore.ts            # Theme management store
│   │   │   ├── sensorStore.ts           # Real-time sensor data
│   │   │   ├── widgetStore.ts           # Widget registry and presets
│   │   │   └── alertStore.ts            # Alert conditions and notifications
│   │   ├── utils/
│   │   │   ├── classnames.ts            # Conditional class utility
│   │   │   ├── gridUtils.ts             # Grid calculation utilities
│   │   │   ├── sensorClient.ts          # WebSocket sensor client
│   │   │   ├── aiLayoutSuggestions.ts   # Genkit AI integration
│   │   │   └── notifications.ts         # Desktop notification helper
│   │   ├── types/
│   │   │   ├── sensor.ts                # Sensor data types
│   │   │   ├── widget.ts                # Widget configuration types
│   │   │   ├── dashboard.ts             # Dashboard types
│   │   │   └── ai.ts                    # AI layout suggestion types
│   │   └── schemas/
│   │       ├── widgetConfig.ts          # Zod schemas for widget forms
│   │       └── layoutConfig.ts          # Zod schemas for layout validation
│   ├── styles/
│   │   └── app.css                      # Global styles and theme variables
├── backend/
│   ├── fastapi/
│   │   ├── main.py                      # FastAPI sensor server
│   │   ├── sensors.py                   # PyHardwareMonitor integration
│   │   ├── websocket.py                 # WebSocket streaming
│   │   └── requirements.txt             # PyHardwareMonitor dependencies
│   └── LibreHardwareMonitorLib.dll      # Required DLL for PyHardwareMonitor
├── static/
│   └── favicon.png
├── tests/
│   ├── dashboard.test.ts               # Dashboard component tests
│   ├── widgets.test.ts                 # Widget functionality tests
│   ├── sensors.test.ts                 # Sensor data handling tests
│   ├── ai-layout.test.ts               # AI layout suggestion tests
│   └── e2e/
│       ├── dashboard.spec.ts           # E2E dashboard tests
│       └── real-time.spec.ts           # Real-time streaming tests
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: PyHardwareMonitor requires LibreHardwareMonitorLib.dll in same directory
// Example: DLL must be accessible and app needs admin privileges
import clr
clr.AddReference('LibreHardwareMonitorLib.dll')
from LibreHardwareMonitor import Hardware

// CRITICAL: PyHardwareMonitor requires admin privileges for sensor access
// Example: Some sensors require elevated permissions
// Run FastAPI server with admin rights or use app.manifest

// CRITICAL: PyHardwareMonitor uses pythonnet - COM interop can be tricky
// Example: Use ToBuiltinTypes() to convert to Python native types
computer = OpenComputer(cpu=True, gpu=True, memory=True)
data = ToBuiltinTypes(computer.Hardware)  # Convert to JSON-serializable

// CRITICAL: Svelte 5 uses new runes syntax - $state, $derived, $effect
// Example: Use $state() instead of writable stores for component state
let sensorData = $state<SensorData>({});

// CRITICAL: WebSocket connections must be managed in onMount/onDestroy
// Example: Prevent memory leaks with proper cleanup
onMount(() => {
  const ws = new WebSocket('ws://localhost:8000/sensors');
  onDestroy(() => ws.close());
});

// CRITICAL: LibreHardwareMonitorLib sensor types are specific strings
// Example: SensorType values are 'Temperature', 'Load', 'Fan', 'Voltage', 'Clock'
const sensorTypeMap = {
  'Temperature': '°C',
  'Load': '%',
  'Fan': 'RPM',
  'Voltage': 'V',
  'Clock': 'MHz'
};

// CRITICAL: Hardware component updates need periodic refresh
// Example: Call computer.Update() regularly for fresh sensor data
setInterval(() => {
  computer.Update();
  const freshData = ToBuiltinTypes(computer.Hardware);
  broadcastToWebSocket(freshData);
}, 1000);

// CRITICAL: Genkit requires proper authentication and context
// Example: AI layout suggestions need dashboard state context
const aiSuggestion = await genkit.generate({
  model: 'gemini-pro',
  prompt: `Suggest layout for dashboard with ${widgetCount} widgets`,
  context: currentDashboardState
});

// CRITICAL: NeoDrag grid snapping requires careful bounds checking
// Example: Prevent widgets from going off-screen
const bounds = { x: 0, y: 0, width: gridWidth, height: gridHeight };

// CRITICAL: Notification API requires permission request
// Example: Request permission before showing alerts
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

// CRITICAL: LayerChart performance with many widgets
// Example: Use Canvas fallback for complex charts
const useCanvas = widgetCount > 20;

// CRITICAL: Zod validation must handle dynamic widget configs
// Example: Schema validation for different widget types
const widgetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('gauge'), config: gaugeSchema }),
  z.object({ type: z.literal('graph'), config: graphSchema })
]);

// CRITICAL: Theme switching must update CSS custom properties
// Example: Apply theme variables to document root
document.documentElement.style.setProperty('--primary-color', theme.primary);
```

## Implementation Blueprint

### Data models and structure

```typescript
// types/sensor.ts - Hardware sensor data types (PyHardwareMonitor format)
interface SensorReading {
  timestamp: number;
  value: number;
  unit: string;
  name: string;
  sensorType: 'Temperature' | 'Load' | 'Fan' | 'Voltage' | 'Clock' | 'Data' | 'Control';
  hardwareType: 'Cpu' | 'GpuNvidia' | 'GpuAmd' | 'Memory' | 'Motherboard' | 'Storage';
  identifier: string;
}

interface HardwareComponent {
  name: string;
  hardwareType: string;
  sensors: SensorReading[];
}

interface SensorData {
  cpu: {
    usage: number;
    temperature: number;
    frequency: number;
    voltage: number;
  };
  gpu: {
    usage: number;
    temperature: number;
    memory: number;
    fanSpeed: number;
    voltage: number;
  };
  memory: {
    usage: number;
    available: number;
    total: number;
  };
  storage: {
    usage: number;
    temperature: number;
    readSpeed: number;
    writeSpeed: number;
  };
  fans: {
    [key: string]: number; // RPM values
  };
  voltages: {
    [key: string]: number; // Voltage values
  };
  motherboard: {
    temperature: number;
    voltage: number;
  };
}

// types/widget.ts - Widget configuration types
interface WidgetConfig {
  id: string;
  type: 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';
  position: { x: number; y: number };
  size: { w: number; h: number };
  title: string;
  sensorPath: string; // e.g., 'cpu.usage'
  appearance: {
    colors: string[];
    typography: {
      fontSize: number;
      fontWeight: string;
      color: string;
    };
    borders: {
      thickness: number;
      style: string;
      radius: number;
    };
    chartParams: {
      barThickness?: number;
      strokeWidth?: number;
      startAngle?: number;
      endAngle?: number;
      tickCount?: number;
    };
  };
  alerts: AlertCondition[];
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
}

// types/ai.ts - AI layout suggestion types
interface LayoutSuggestion {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  reasoning: string;
  confidence: number;
}

interface AILayoutRequest {
  currentWidgets: WidgetConfig[];
  dashboardSize: { width: number; height: number };
  preferences: {
    priority: 'performance' | 'aesthetics' | 'functionality';
    theme: 'light' | 'dark';
    density: 'compact' | 'spacious';
  };
}
```

### List of tasks to be completed

```yaml
Task 1: Setup SvelteKit with Svelte 5 and Dependencies
CREATE package.json:
  - PATTERN: Include Svelte 5, SvelteKit, TypeScript, Tailwind, Skeleton
  - Add LayerChart, NeoDrag, Zod, Genkit dependencies
  - Configure dev dependencies (Vitest, Playwright)

CREATE svelte.config.js:
  - PATTERN: Svelte 5 configuration with TypeScript
  - Add Tailwind preprocessing
  - Configure Genkit adapter

CREATE tailwind.config.js:
  - PATTERN: Skeleton UI theme integration
  - Add custom CSS variables for sensor themes
  - Configure responsive breakpoints

Task 2: Create Type Definitions and Schemas
CREATE src/lib/types/sensor.ts:
  - PATTERN: Comprehensive sensor data interfaces
  - Define real-time streaming types
  - Export all sensor-related types

CREATE src/lib/schemas/widgetConfig.ts:
  - PATTERN: Zod schemas for widget configuration validation
  - Dynamic schema based on widget type
  - Form validation helpers

CREATE src/lib/types/ai.ts:
  - PATTERN: AI layout suggestion types
  - Genkit integration interfaces
  - Export AI-related types

Task 3: Implement Real-Time Sensor Data System
CREATE src/lib/stores/sensorStore.ts:
  - PATTERN: Svelte 5 $state for real-time data
  - WebSocket connection management
  - Reactive sensor data updates

CREATE src/lib/utils/sensorClient.ts:
  - PATTERN: WebSocket client for sensor streaming
  - Reconnection logic and error handling
  - Data parsing and validation

CREATE backend/fastapi/main.py:
  - PATTERN: FastAPI with WebSocket streaming
  - Use PyHardwareMonitor for hardware sensor reading
  - CORS configuration for SvelteKit
  - Admin privilege handling for sensor access

Task 4: Create Dynamic Widget Grid System
CREATE src/lib/components/DashboardGrid.svelte:
  - PATTERN: Mirror examples/DashboardGrid.svelte
  - Integrate with NeoDrag for drag/drop
  - Grid snap and collision detection

CREATE src/lib/components/DraggableWidget.svelte:
  - PATTERN: Mirror examples/DraggableWidget.svelte
  - Svelte 5 runes for reactive state
  - Resize handles and boundary checking

CREATE src/lib/stores/layoutStore.ts:
  - PATTERN: Mirror examples/layoutStore.ts
  - Svelte 5 $state for layout persistence
  - Import/export functionality

Task 5: Build Widget Library
CREATE src/lib/components/widgets/GaugeWidget.svelte:
  - PATTERN: Mirror examples/ArcMeter.svelte
  - LayerChart Arc component with customization
  - Real-time data binding from sensorStore

CREATE src/lib/components/widgets/GraphWidget.svelte:
  - PATTERN: LayerChart Area/Bar/Line components
  - Historical data visualization
  - Configurable chart parameters

CREATE src/lib/components/widgets/SimpleWidget.svelte:
  - PATTERN: Minimal single-value display
  - Typography and color customization
  - Alert state visualization

CREATE src/lib/components/widgets/MeterWidget.svelte:
  - PATTERN: Horizontal progress bars
  - Gradient fills and threshold indicators
  - Compact layout optimization

CREATE src/lib/components/widgets/MultiResourceWidget.svelte:
  - PATTERN: Aggregate view of multiple sensors
  - Tabbed or grid layout for multiple metrics
  - Unified theming and styling

Task 6: Implement Widget Configurator
CREATE src/lib/components/WidgetConfigurator.svelte:
  - PATTERN: Modal with tabbed interface
  - Zod schema validation for forms
  - Live preview of widget changes

CREATE src/lib/stores/widgetStore.ts:
  - PATTERN: Widget registry and preset management
  - JSON-based persistence (localStorage/IndexedDB)
  - Widget creation and deletion

CREATE src/lib/utils/widgetPresets.ts:
  - PATTERN: Default widget configurations
  - Preset templates for common sensors
  - Import/export utilities

Task 7: Add AI-Powered Layout Suggestions
CREATE src/lib/utils/aiLayoutSuggestions.ts:
  - PATTERN: Genkit integration for AI suggestions
  - Context-aware prompt generation
  - Layout optimization algorithms

CREATE src/routes/api/ai-layout/+server.ts:
  - PATTERN: SvelteKit API endpoint
  - Genkit model integration
  - Request/response handling

CREATE src/lib/components/AILayoutModal.svelte:
  - PATTERN: Modal with AI suggestion display
  - Preview and apply layout suggestions
  - User feedback and refinement

Task 8: Create Alert System
CREATE src/lib/stores/alertStore.ts:
  - PATTERN: Alert condition management
  - Threshold monitoring and notification triggers
  - Alert history and acknowledgment

CREATE src/lib/utils/notifications.ts:
  - PATTERN: Desktop notification helper
  - Permission request handling
  - Alert formatting and display

CREATE src/lib/components/AlertConfigurator.svelte:
  - PATTERN: Alert condition editor
  - Threshold sliders and condition logic
  - Test alert functionality

Task 9: Implement Theme System
CREATE src/lib/stores/themeStore.ts:
  - PATTERN: Mirror examples/ThemeConfig.js
  - Svelte 5 $state for theme management
  - CSS custom property updates

CREATE src/lib/components/ThemeToggle.svelte:
  - PATTERN: Theme switching component
  - Light/dark/auto mode support
  - Theme persistence

CREATE src/styles/app.css:
  - PATTERN: Global styles with CSS variables
  - Sensor-specific color schemes
  - Dark/light theme definitions

Task 10: Build Main Dashboard and Toolbar
CREATE src/lib/components/Dashboard.svelte:
  - PATTERN: Main dashboard container
  - Integrate all components and stores
  - Real-time data flow coordination

CREATE src/lib/components/Toolbar.svelte:
  - PATTERN: Dashboard toolbar with controls
  - Layout switcher and AI suggestions
  - Import/export and settings access

CREATE src/lib/components/ImportExportModal.svelte:
  - PATTERN: JSON import/export functionality
  - Layout sharing and backup features
  - Validation and error handling

Task 11: Create Dashboard Routes
CREATE src/routes/+layout.svelte:
  - PATTERN: Root layout with theme provider
  - Initialize all stores and connections
  - Global error handling

CREATE src/routes/+page.svelte:
  - PATTERN: Main SenseCanvas dashboard page
  - Dashboard component integration
  - Initial widget setup

CREATE src/routes/api/sensors/+server.ts:
  - PATTERN: SvelteKit API for sensor data
  - WebSocket upgrade handling
  - Sensor data streaming

Task 12: Add Comprehensive Testing
CREATE tests/dashboard.test.ts:
  - PATTERN: Component testing with Vitest
  - Widget creation and configuration
  - Real-time data handling

CREATE tests/sensors.test.ts:
  - PATTERN: Sensor data store testing
  - WebSocket connection mocking
  - Data validation and error handling

CREATE tests/ai-layout.test.ts:
  - PATTERN: AI layout suggestion testing
  - Mock Genkit responses
  - Layout optimization validation

CREATE tests/e2e/dashboard.spec.ts:
  - PATTERN: E2E testing with Playwright
  - Full dashboard workflow testing
  - Real-time streaming validation
```

### Per task pseudocode

```typescript
// Task 3: Real-Time Sensor Data System
// sensorStore.ts (Svelte 5)
import { type SensorData, type HardwareComponent } from '../types/sensor';

let sensorData = $state<SensorData>({
  cpu: { usage: 0, temperature: 0, frequency: 0, voltage: 0 },
  gpu: { usage: 0, temperature: 0, memory: 0, fanSpeed: 0, voltage: 0 },
  memory: { usage: 0, available: 0, total: 0 },
  storage: { usage: 0, temperature: 0, readSpeed: 0, writeSpeed: 0 },
  fans: {},
  voltages: {},
  motherboard: { temperature: 0, voltage: 0 }
});

let websocket = $state<WebSocket | null>(null);

export const sensorStore = {
  get data() { return sensorData; },
  connect() {
    // CRITICAL: WebSocket connection with auto-reconnect
    websocket = new WebSocket('ws://localhost:8000/sensors');
    websocket.onmessage = (event) => {
      const rawData: HardwareComponent[] = JSON.parse(event.data);
      sensorData = this.parseHardwareData(rawData);
    };
    
    websocket.onclose = () => {
      // PATTERN: Auto-reconnect with exponential backoff
      setTimeout(() => this.connect(), 5000);
    };
  },
  disconnect() {
    websocket?.close();
  },
  
  // PATTERN: Parse PyHardwareMonitor data format
  parseHardwareData(hardware: HardwareComponent[]): SensorData {
    const parsed: SensorData = {
      cpu: { usage: 0, temperature: 0, frequency: 0, voltage: 0 },
      gpu: { usage: 0, temperature: 0, memory: 0, fanSpeed: 0, voltage: 0 },
      memory: { usage: 0, available: 0, total: 0 },
      storage: { usage: 0, temperature: 0, readSpeed: 0, writeSpeed: 0 },
      fans: {},
      voltages: {},
      motherboard: { temperature: 0, voltage: 0 }
    };
    
    hardware.forEach(component => {
      component.sensors.forEach(sensor => {
        // CRITICAL: Map LibreHardwareMonitorLib sensor types to UI data
        if (component.hardwareType === 'Cpu') {
          if (sensor.sensorType === 'Load') parsed.cpu.usage = sensor.value;
          if (sensor.sensorType === 'Temperature') parsed.cpu.temperature = sensor.value;
          if (sensor.sensorType === 'Clock') parsed.cpu.frequency = sensor.value;
          if (sensor.sensorType === 'Voltage') parsed.cpu.voltage = sensor.value;
        }
        // Similar mappings for GPU, Memory, etc.
      });
    });
    
    return parsed;
  }
};

// Task 5: Gauge Widget Implementation
// GaugeWidget.svelte (Svelte 5)
<script lang="ts">
  import { Chart, Layer, Arc, Text } from 'layerchart';
  import { SpringValue } from 'layerchart/animate';
  import { sensorStore } from '../../stores/sensorStore';
  import type { WidgetConfig } from '../../types/widget';
  
  let { config = $bindable() }: { config: WidgetConfig } = $props();
  
  // PATTERN: Reactive sensor data access
  let sensorValue = $derived(() => {
    const path = config.sensorPath.split('.');
    return path.reduce((obj, key) => obj?.[key], sensorStore.data) || 0;
  });
  
  // PATTERN: Theme-aware styling
  let gaugeColor = $derived(() => {
    const value = sensorValue();
    const { colors } = config.appearance;
    if (value > 80) return colors[2]; // High usage
    if (value > 60) return colors[1]; // Medium usage
    return colors[0]; // Low usage
  });
</script>

<div class="widget-container">
  <Chart>
    <Layer center>
      <SpringValue value={sensorValue()} let:value>
        {#each Array(60) as _, i}
          {@const angle = (2 * Math.PI) / 60}
          {@const isActive = (i / 60) * 100 < value}
          <Arc
            startAngle={i * angle}
            endAngle={(i + 1) * angle}
            innerRadius={-20}
            padAngle={0.01}
            class={isActive ? gaugeColor() : 'fill-gray-300'}
          />
        {/each}
        <Text
          value={`${Math.round(value)}${config.unit || '%'}`}
          textAnchor="middle"
          verticalAnchor="middle"
          class="text-2xl font-mono"
        />
      </SpringValue>
    </Layer>
  </Chart>
</div>

// Task 7: AI Layout Suggestions
// aiLayoutSuggestions.ts
import { genkit } from 'genkit';
import type { AILayoutRequest, LayoutSuggestion } from '../types/ai';

export async function generateLayoutSuggestions(
  request: AILayoutRequest
): Promise<LayoutSuggestion[]> {
  // PATTERN: Context-aware AI prompting
  const prompt = `
    You are a UI/UX expert specializing in system monitoring dashboards.
    
    Current dashboard state:
    - Widgets: ${request.currentWidgets.length}
    - Size: ${request.dashboardSize.width}x${request.dashboardSize.height}
    - Theme: ${request.preferences.theme}
    - Priority: ${request.preferences.priority}
    
    Generate 3 layout suggestions optimized for PC hardware monitoring.
    Focus on grouping related sensors and creating visual hierarchy.
    
    Return suggestions as JSON array with reasoning.
  `;
  
  // CRITICAL: Genkit integration with error handling
  try {
    const result = await genkit.generate({
      model: 'gemini-pro',
      prompt,
      context: {
        widgets: request.currentWidgets,
        dashboard: request.dashboardSize,
        preferences: request.preferences
      }
    });
    
    return JSON.parse(result.data);
  } catch (error) {
    console.error('AI layout generation failed:', error);
    return [];
  }
}

// Task 8: Alert System Implementation
// alertStore.ts (Svelte 5)
import { sensorStore } from './sensorStore';
import { notifications } from '../utils/notifications';

let alertConditions = $state<AlertCondition[]>([]);
let alertHistory = $state<Alert[]>([]);

export const alertStore = {
  get conditions() { return alertConditions; },
  get history() { return alertHistory; },
  
  addCondition(condition: AlertCondition) {
    alertConditions.push(condition);
    this.saveConditions();
  },
  
  checkAlerts() {
    // PATTERN: Reactive alert checking
    $effect(() => {
      const currentData = sensorStore.data;
      
      alertConditions.forEach(condition => {
        const value = this.getSensorValue(currentData, condition.sensorPath);
        const shouldAlert = this.evaluateCondition(value, condition);
        
        if (shouldAlert && !condition.triggered) {
          // CRITICAL: Desktop notification with permission check
          notifications.show({
            title: `SenseCanvas Alert: ${condition.name}`,
            body: `${condition.sensorPath} is ${value}${condition.unit}`,
            icon: '/favicon.png'
          });
          
          condition.triggered = true;
          alertHistory.unshift({
            id: Date.now().toString(),
            condition: condition.name,
            value,
            timestamp: Date.now()
          });
        }
      });
    });
  }
};
```

### Integration Points
```yaml
DEPENDENCIES:
  - Add to package.json:
    - "svelte": "^5.0.0"
    - "@sveltejs/kit": "^2.0.0"
    - "genkit": "^0.5.0"
    - "layerchart": "^1.0.0"
    - "@neodrag/svelte": "^2.0.0"
    - "@skeletonlabs/skeleton": "^2.0.0"
    - "zod": "^3.22.0"
    - "tailwindcss": "^3.4.0"
    - "lucide-svelte": "^0.400.0"

BACKEND:
  - FastAPI: PyHardwareMonitor, websockets, uvicorn, pythonnet
  - LibreHardwareMonitorLib.dll (required DLL file)
  - Real-time streaming via WebSocket with PyHardwareMonitor ToBuiltinTypes()
  
CONFIGURATION:
  - svelte.config.js: Svelte 5 + TypeScript + Tailwind
  - tailwind.config.js: Skeleton theme + custom variables
  - genkit.config.js: AI model configuration
  
STORES:
  - sensorStore: Real-time hardware data (Svelte 5 $state)
  - layoutStore: Widget positions and persistence
  - widgetStore: Widget registry and presets
  - themeStore: Theme management
  - alertStore: Alert conditions and notifications
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Frontend validation
npm run check        # SvelteKit + Svelte 5 type checking
npm run lint         # ESLint with Svelte 5 rules
npm run format       # Prettier formatting

# Backend validation
cd backend/fastapi
pip install -r requirements.txt  # Install PyHardwareMonitor dependencies
python -m py_compile main.py     # Check Python syntax
python -m flake8 main.py         # Python linting

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Unit Tests
```typescript
// tests/sensorStore.test.ts
import { describe, it, expect, vi } from 'vitest';
import { sensorStore } from '../src/lib/stores/sensorStore';

describe('sensorStore', () => {
  it('should connect to WebSocket and update data', async () => {
    const mockWS = vi.fn().mockImplementation(() => ({
      onmessage: vi.fn(),
      onclose: vi.fn(),
      close: vi.fn()
    }));
    
    // @ts-ignore
    global.WebSocket = mockWS;
    
    sensorStore.connect();
    
    expect(mockWS).toHaveBeenCalledWith('ws://localhost:8000/sensors');
  });
  
  it('should handle WebSocket reconnection', async () => {
    // Test auto-reconnect logic
    const mockWS = vi.fn().mockImplementation(() => ({
      onmessage: vi.fn(),
      onclose: vi.fn((callback) => {
        setTimeout(callback, 100);
      }),
      close: vi.fn()
    }));
    
    // @ts-ignore
    global.WebSocket = mockWS;
    
    sensorStore.connect();
    
    // Should reconnect after close
    await vi.waitFor(() => {
      expect(mockWS).toHaveBeenCalledTimes(2);
    });
  });
});

// tests/widgets.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GaugeWidget from '../src/lib/components/widgets/GaugeWidget.svelte';

describe('GaugeWidget', () => {
  it('should render gauge with sensor data', () => {
    const config = {
      id: 'test-gauge',
      type: 'gauge',
      sensorPath: 'cpu.usage',
      appearance: {
        colors: ['#00ff00', '#ffff00', '#ff0000']
      }
    };
    
    const { container } = render(GaugeWidget, { config });
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
  
  it('should update color based on sensor value', () => {
    // Test reactive color changes
    const config = {
      id: 'test-gauge',
      type: 'gauge',
      sensorPath: 'cpu.usage',
      appearance: {
        colors: ['#00ff00', '#ffff00', '#ff0000']
      }
    };
    
    const { component } = render(GaugeWidget, { config });
    
    // Mock high sensor value
    // Test that gauge color changes appropriately
  });
});
```

```bash
# Run tests iteratively until passing:
npm test

# Run with coverage:
npm run test:coverage

# If failing: Debug specific test, fix code, re-run
```

### Level 3: Integration & E2E Testing
```bash
# Start backend server (requires admin privileges)
cd backend/fastapi 
# Ensure LibreHardwareMonitorLib.dll is in the same directory
python main.py  # Run as administrator for sensor access

# Start SvelteKit dev server
npm run dev

# Run E2E tests
npm run test:e2e

# Manual testing checklist:
# 1. Navigate to http://localhost:5173
# 2. Verify real-time sensor data updates (CPU, GPU, memory, fans)
# 3. Drag widgets around the grid
# 4. Configure widget appearance
# 5. Test AI layout suggestions
# 6. Import/export dashboard layouts
# 7. Test alert notifications
# 8. Switch themes and verify updates
# 9. Verify PyHardwareMonitor sensor readings are accurate
```

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('real-time sensor data updates', async ({ page }) => {
  await page.goto('/');
  
  // Check initial sensor data loads
  await expect(page.locator('[data-testid="cpu-usage"]')).toBeVisible();
  
  // Wait for real-time updates
  await page.waitForTimeout(2000);
  
  // Verify data has updated
  const initialValue = await page.locator('[data-testid="cpu-usage"]').textContent();
  await page.waitForTimeout(2000);
  const updatedValue = await page.locator('[data-testid="cpu-usage"]').textContent();
  
  expect(initialValue).not.toBe(updatedValue);
});

test('AI layout suggestions', async ({ page }) => {
  await page.goto('/');
  
  // Open AI suggestions modal
  await page.click('[data-testid="ai-layout-button"]');
  
  // Wait for suggestions to load
  await expect(page.locator('[data-testid="layout-suggestion"]')).toBeVisible();
  
  // Apply suggestion
  await page.click('[data-testid="apply-suggestion"]');
  
  // Verify layout changed
  await expect(page.locator('[data-testid="dashboard-grid"]')).toHaveAttribute('data-layout-applied', 'true');
});

test('widget configuration', async ({ page }) => {
  await page.goto('/');
  
  // Right-click widget to configure
  await page.locator('[data-testid="gauge-widget"]').click({ button: 'right' });
  
  // Configure appearance
  await page.fill('[data-testid="widget-title"]', 'CPU Temperature');
  await page.selectOption('[data-testid="color-scheme"]', 'thermal');
  
  // Save configuration
  await page.click('[data-testid="save-config"]');
  
  // Verify changes applied
  await expect(page.locator('[data-testid="gauge-widget"]')).toHaveAttribute('data-title', 'CPU Temperature');
});
```

## Final Validation Checklist
- [ ] All unit tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run check`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Real-time sensor data streams correctly
- [ ] Widgets are draggable and resizable
- [ ] Widget configurations persist
- [ ] AI layout suggestions generate and apply
- [ ] Import/export functionality works
- [ ] Alert system triggers notifications
- [ ] Theme switching updates all components
- [ ] Performance remains smooth with multiple widgets
- [ ] WebSocket connections handle reconnection
- [ ] No console errors in browser
- [ ] PyHardwareMonitor backend reads sensor data correctly
- [ ] LibreHardwareMonitorLib.dll is properly loaded
- [ ] Admin privileges are handled correctly for sensor access
- [ ] Responsive design works on different screen sizes

---

## Anti-Patterns to Avoid
- ❌ Don't use Svelte 4 store syntax - use Svelte 5 runes ($state, $derived, $effect)
- ❌ Don't forget to close WebSocket connections in onDestroy
- ❌ Don't hardcode sensor paths - make them configurable
- ❌ Don't ignore WebSocket reconnection logic
- ❌ Don't skip Notification API permission requests
- ❌ Don't use blocking operations in real-time data handling
- ❌ Don't forget to validate widget configurations with Zod
- ❌ Don't ignore performance with many real-time widgets
- ❌ Don't hardcode AI prompts - make them context-aware
- ❌ Don't skip error handling in AI layout generation
- ❌ Don't commit sensitive API keys or credentials
- ❌ Don't forget to include LibreHardwareMonitorLib.dll in deployment
- ❌ Don't ignore admin privilege requirements for PyHardwareMonitor
- ❌ Don't assume sensor types - validate against LibreHardwareMonitorLib spec

## Confidence Score: 9/10

Very high confidence due to:
- Comprehensive feature specification in FullFeature.md
- Detailed examples provided in codebase
- Extensive research on all required technologies
- Clear integration patterns established
- Well-defined validation gates
- Proven real-time streaming approaches

Minor uncertainty around:
- Svelte 5 rune syntax (new features)
- Genkit integration specifics (emerging technology)
- Performance optimization with many real-time widgets