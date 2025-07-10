name: "SenseCanvas: React 19+ PC Sensor Dashboard with AI Layout Suggestions"
description: |

## Purpose
Build SenseCanvas, a hyper-customizable PC sensor dashboard using React 19+, Vite 6, TanStack ecosystem, and Google Genkit for AI-powered layout suggestions. This comprehensive PRP provides all context needed to implement a production-ready real-time hardware monitoring system with cutting-edge React technologies and a sci-fi gaming aesthetic.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the React 19+ ecosystem
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create SenseCanvas, a modern, real-time, and deeply customizable dashboard for monitoring PC hardware sensors using React 19+ with concurrent features, TanStack ecosystem for state management and routing, and a futuristic sci-fi aesthetic. The application should provide visual widgets for CPU, GPU, RAM, fans, and storage data with AI-powered layout suggestions, extensive customization options, and real-time streaming capabilities.

## Why
- **Business value**: Provides enthusiasts and professionals with a comprehensive PC monitoring solution with cutting-edge UI
- **Integration**: Demonstrates advanced React 19+ patterns with TanStack ecosystem, sci-fi design system, and AI integration
- **Problems solved**: Eliminates need for multiple monitoring tools; provides unified, customizable, intelligent, and visually stunning dashboard experience

## What
A React 19+ application featuring:
- **Real-Time Sensor Monitoring**: Connect to FastAPI backend for live sensor data streaming with React 19's concurrent features
- **Dynamic Widget Grid**: Draggable/resizable layout with TanStack Virtual for performance and full persistence
- **AI-Powered Layout Suggestions**: Google Genkit integration for intelligent widget arrangement
- **Sci-Fi Design System**: SVG-first components with customizable frames and futuristic styling
- **Extensive Widget Library**: Configurable presets with visual editor using custom components
- **Import & Export**: Save/share layouts and individual widgets as JSON
- **Deep Customization**: Widget configurator with Zod validation and React Hook Form
- **Advanced State Management**: Zustand for client state, TanStack Query for server state
- **Modern Performance**: TanStack Virtual, React 19's automatic batching, and concurrent rendering

### Success Criteria
- [ ] Real-time sensor data streams from backend to Zustand stores with TanStack Query caching
- [ ] Draggable/resizable widgets with grid snapping, collision detection, and persistence
- [ ] AI layout suggestions generate intelligent widget arrangements using Google Genkit
- [ ] Widget configurator allows deep customization using React Hook Form and Zod validation
- [ ] Import/export functionality for layouts and individual widgets
- [ ] Alert system triggers desktop notifications on threshold breaches
- [ ] Sci-fi theme switching works across all widgets and components
- [ ] Performance remains smooth with TanStack Virtual handling large widget grids
- [ ] All tests pass with Vitest and Playwright
- [ ] Code meets quality standards with React 19+ best practices

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://react.dev/blog/2024/12/05/react-19
  why: React 19 official documentation for concurrent features, automatic batching, and performance improvements
  
- url: https://tanstack.com/router/latest
  why: TanStack Router for type-safe routing with automatic code splitting
  
- url: https://tanstack.com/query/latest
  why: TanStack Query for server state management and real-time data synchronization
  
- url: https://zustand-demo.pmnd.rs/
  why: Zustand for lightweight client state management with excellent TypeScript support
  
- url: https://www.framer.com/motion/
  why: Framer Motion for smooth animations and widget interactions
  
- url: https://react-hook-form.com/
  why: React Hook Form for performant widget configuration forms
  
- url: https://tanstack.com/virtual/latest
  why: TanStack Virtual for high-performance widget grid virtualization
  
- url: https://zod.dev/
  why: Zod schema validation for widget configuration forms and API responses
  
- url: https://github.com/snip3rnick/PyHardwareMonitor
  why: PyHardwareMonitor library - thin Python layer for LibreHardwareMonitorLib
  
- url: https://vite.dev/guide/performance
  why: Vite 6 build tool configuration and optimization for React 19+ applications
  
- url: https://vitest.dev/guide/
  why: Vitest testing framework that works seamlessly with Vite and React
  
- url: https://playwright.dev/docs/test-components
  why: Playwright for reliable E2E testing of React components
  
- url: https://genkit.dev/
  why: Google Genkit framework for AI-powered layout suggestions

- file: /home/jpfive/Projects/context-dash-react/examples/CosmicSensorGauge.tsx
  why: React implementation of sci-fi sensor gauge with Framer Motion animations
  
- file: /home/jpfive/Projects/context-dash-react/examples/DashboardGrid.tsx
  why: TanStack Virtual grid implementation with React 19 patterns
  
- file: /home/jpfive/Projects/context-dash-react/examples/layoutStore.ts
  why: Zustand store pattern with persistence middleware for layout management
  
- file: /home/jpfive/Projects/context-dash-react/examples/useWebSocket.ts
  why: WebSocket hook with React 19 concurrent features and automatic reconnection

- docfile: /home/jpfive/Projects/context-dash-react/sensor-dash-react/project_architecture.md
  why: Comprehensive React 19+ project architecture and modern patterns
  
- docfile: /home/jpfive/Projects/context-dash-react/sensor-dash-react/frontend_guide.md
  why: React 19+ frontend guide with component architecture and hooks
  
- docfile: /home/jpfive/Projects/context-dash-react/sensor-dash-react/sensecanvas-dashboard.md
  why: Complete implementation blueprint with validation loops and testing strategies
```

### Current Codebase tree
```bash
.
├── examples/
│   ├── CosmicSensorGauge.tsx       # React implementation of sci-fi sensor gauge
│   ├── DashboardGrid.tsx           # TanStack Virtual grid with React 19+ patterns
│   ├── layoutStore.ts              # Zustand store with persistence middleware
│   ├── useWebSocket.ts             # WebSocket hook with React 19 concurrent features
│   ├── CosmicFrame.svelte         # Original Svelte Frame component (to be adapted)
│   ├── DraggableWidget.svelte     # Original Svelte drag/drop (to be adapted)
│   ├── ArcMeter.svelte            # Original Svelte gauge (to be adapted)
│   └── ThemeConfig.js             # Theme switching example (to be adapted)
├── sensor-dash-react/             # Comprehensive React 19+ specifications
│   ├── project_architecture.md   # Modern React architecture with TanStack ecosystem
│   ├── frontend_guide.md          # React 19+ patterns and component architecture
│   ├── sensecanvas-dashboard.md   # Complete implementation blueprint
│   └── *.md                       # Additional specification files
├── PRPs/
│   └── templates/
│       └── prp_base.md           # PRP template structure
└── CLAUDE.md                     # Project instructions and constraints
```

### Desired Codebase tree with files to be added
```bash
.
├── frontend/                           # React 19+ application
│   ├── src/
│   │   ├── main.tsx                    # Application entry point with React 19
│   │   ├── App.tsx                     # Root app component with providers
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.tsx       # Main application header
│   │   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   │   └── ThemeProvider.tsx   # Sci-fi theme provider
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx            # Main dashboard container
│   │   │   │   ├── DashboardGrid.tsx        # Virtualized grid with TanStack Virtual
│   │   │   │   ├── DraggableWidget.tsx      # Draggable widget wrapper with Framer Motion
│   │   │   │   ├── WidgetConfigurator.tsx   # Widget customization modal
│   │   │   │   ├── Toolbar.tsx              # Dashboard toolbar with controls
│   │   │   │   └── AILayoutModal.tsx        # AI layout suggestions interface
│   │   │   ├── widgets/
│   │   │   │   ├── BaseWidget.tsx           # Base widget component with sci-fi styling
│   │   │   │   ├── GaugeWidget.tsx          # Sci-fi gauge widgets
│   │   │   │   ├── GraphWidget.tsx          # Real-time charts with Chart.js
│   │   │   │   ├── SimpleWidget.tsx         # Single-value displays
│   │   │   │   └── MultiResourceWidget.tsx  # Aggregate sensor views
│   │   │   ├── sci-fi/
│   │   │   │   ├── SciFiFrame.tsx          # Customizable SVG frames for widgets
│   │   │   │   ├── SciFiChart.tsx          # Extended sci-fi charts
│   │   │   │   ├── SciFiGauge.tsx          # Custom sensor gauges
│   │   │   │   └── SciFiThemeToggle.tsx    # Theme switching component
│   │   │   └── common/
│   │   │       ├── Button.tsx               # Custom buttons with sci-fi styling
│   │   │       ├── Modal.tsx                # Modal wrapper with animations
│   │   │       └── LoadingSpinner.tsx       # Loading states with sci-fi effects
│   │   ├── hooks/
│   │   │   ├── useSensorData.ts             # TanStack Query hook for sensor data
│   │   │   ├── useWebSocket.ts              # WebSocket connection with React 19
│   │   │   ├── useWidgetGrid.ts             # Grid layout management
│   │   │   ├── useSciFiTheme.ts             # Sci-fi theme management
│   │   │   ├── useDragAndDrop.ts            # Drag and drop with Framer Motion
│   │   │   └── useLocalStorage.ts           # Persistent storage utilities
│   │   ├── stores/
│   │   │   ├── sensorStore.ts               # Zustand store for real-time sensor data
│   │   │   ├── layoutStore.ts               # Zustand store for widget layout
│   │   │   ├── themeStore.ts                # Zustand store for sci-fi themes
│   │   │   ├── widgetStore.ts               # Zustand store for widget registry
│   │   │   └── alertStore.ts                # Zustand store for alert conditions
│   │   ├── services/
│   │   │   ├── sensorService.ts             # WebSocket sensor client
│   │   │   ├── aiLayoutService.ts           # Google Genkit AI integration
│   │   │   ├── notificationService.ts       # Desktop notifications
│   │   │   └── storageService.ts            # Import/export functionality
│   │   ├── utils/
│   │   │   ├── sciFiUtils.ts                # Sci-fi styling helper functions
│   │   │   ├── gridUtils.ts                 # Grid calculation utilities
│   │   │   ├── validationSchemas.ts         # Zod validation schemas
│   │   │   ├── dateUtils.ts                 # Date/time formatting utilities
│   │   │   └── mathUtils.ts                 # Mathematical calculations
│   │   ├── types/
│   │   │   ├── sensor.ts                    # Sensor data type definitions
│   │   │   ├── widget.ts                    # Widget configuration types
│   │   │   ├── sci-fi.ts                    # Sci-fi component types
│   │   │   ├── dashboard.ts                 # Dashboard layout types
│   │   │   └── api.ts                       # API response types
│   │   ├── routes/
│   │   │   ├── __root.tsx                   # TanStack Router root with providers
│   │   │   ├── index.tsx                    # Main dashboard route
│   │   │   ├── settings.tsx                 # Configuration settings route
│   │   │   └── about.tsx                    # About/help route
│   │   └── styles/
│   │       ├── globals.css                  # Global styles and sci-fi variables
│   │       ├── sci-fi-themes.css            # Sci-fi theme definitions
│   │       └── animations.css               # Framer Motion animation presets
│   ├── package.json                         # React 19+ dependencies
│   ├── vite.config.ts                       # Vite 6 configuration for React 19+
│   ├── tailwind.config.js                   # TailwindCSS with sci-fi theme integration
│   ├── tsconfig.json                        # TypeScript configuration
│   ├── vitest.config.ts                     # Vitest testing configuration
│   └── playwright.config.ts                 # Playwright E2E testing
├── backend/
│   ├── src/
│   │   ├── main.py                          # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── sensors.py                   # Sensor data API endpoints
│   │   │   ├── websocket.py                 # WebSocket streaming handler
│   │   │   └── ai_layout.py                 # AI layout suggestion endpoint
│   │   ├── services/
│   │   │   ├── hardware_monitor.py          # PyHardwareMonitor integration
│   │   │   ├── sensor_processor.py          # Sensor data processing
│   │   │   └── ai_service.py                # Google Genkit integration
│   │   ├── models/
│   │   │   ├── sensor_models.py             # Pydantic sensor data models
│   │   │   └── layout_models.py             # Pydantic layout models
│   │   └── core/
│   │       ├── config.py                    # Application configuration
│   │       └── websocket_manager.py         # WebSocket connection management
│   ├── requirements.txt                     # Python dependencies
│   └── LibreHardwareMonitorLib.dll          # Required hardware monitoring DLL
└── tests/
    ├── unit/
    │   ├── components/                      # React component unit tests
    │   ├── hooks/                           # Custom hook tests
    │   ├── stores/                          # Zustand store tests
    │   └── utils/                           # Utility function tests
    ├── integration/
    │   ├── api/                             # API integration tests
    │   └── websocket/                       # WebSocket integration tests
    └── e2e/
        ├── dashboard.spec.ts                # E2E dashboard tests
        ├── real-time.spec.ts                # Real-time streaming tests
        └── ai-layout.spec.ts                # AI layout suggestion tests
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

// CRITICAL: React 19 automatic batching behavior
// Example: Multiple state updates are automatically batched
const handleSensorUpdate = (data: SensorData) => {
  setSensorData(data);        // These are automatically batched
  setLastUpdate(Date.now());  // together for better performance
  setConnectionStatus('active');
};

// CRITICAL: TanStack Query cache invalidation patterns for real-time data
// Example: Proper cache management for real-time data
const invalidateQueries = () => {
  queryClient.invalidateQueries(['sensors']);
  queryClient.refetchQueries(['sensors'], { exact: true });
};

// CRITICAL: Zustand store persistence with immer for complex state updates
const useLayoutStore = create<LayoutState>()(
  persist(
    immer((set, get) => ({
      widgets: [],
      updateWidget: (id, updates) =>
        set(state => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            state.widgets[index] = { ...state.widgets[index], ...updates };
          }
        }),
    })),
    { name: 'layout-store' }
  )
);

// CRITICAL: WebSocket connection cleanup in React 19
// Example: Prevent memory leaks with proper cleanup
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8000/sensors');
  
  ws.onmessage = (event) => {
    // React 19's automatic batching handles multiple store updates
    const sensorData = JSON.parse(event.data);
    sensorStore.getState().updateSensorData(sensorData);
  };
  
  return () => {
    ws.close(); // Critical: Always cleanup WebSocket connections
  };
}, []);

// CRITICAL: TanStack Virtual performance with dynamic heights
const virtualizer = useVirtualizer({
  count: widgets.length,
  getScrollElement: () => parentRef.current,
  estimateSize: useCallback((index) => {
    const widget = widgets[index];
    return widget.type === 'graph' ? 400 : 200;
  }, [widgets]),
  overscan: 5, // Render extra items for smooth scrolling
});

// CRITICAL: Framer Motion layout animations and performance
<motion.div
  layout
  layoutId={widget.id}
  transition={{ 
    type: "spring", 
    damping: 20, 
    stiffness: 300 
  }}
  style={{ willChange: 'transform' }} // Avoid layout thrashing
>

// CRITICAL: Sci-fi SVG path processing for responsive frames
const processSciFiPath = (pathString: string, width: number, height: number) => {
  return pathString
    .replace(/(\d+)%/g, (match, percent) => `${(parseFloat(percent) / 100) * width}`)
    .replace(/100% - (\d+)/g, (match, offset) => `${width - parseFloat(offset)}`);
};

// CRITICAL: React Hook Form with dynamic widget schemas
const schema = useMemo(() => {
  return z.discriminatedUnion('type', [
    z.object({ type: z.literal('gauge'), config: gaugeConfigSchema }),
    z.object({ type: z.literal('graph'), config: graphConfigSchema }),
  ]);
}, []);

// CRITICAL: LibreHardwareMonitorLib sensor types are specific strings
const sensorTypeMap = {
  'Temperature': '°C',
  'Load': '%',
  'Fan': 'RPM',
  'Voltage': 'V',
  'Clock': 'MHz'
};

// CRITICAL: Google Genkit requires proper authentication and context
const aiSuggestion = await genkit.generate({
  model: 'gemini-pro',
  prompt: `Suggest layout for dashboard with ${widgetCount} widgets`,
  context: {
    currentLayout: layoutStore.getState(),
    sensorTypes: Object.keys(sensorData),
    screenSize: { width: window.innerWidth, height: window.innerHeight }
  }
});

// CRITICAL: Vite 6 with React 19 SWC compiler optimization
// Use @vitejs/plugin-react-swc instead of @vitejs/plugin-react for 70% faster builds
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

interface SensorData {
  cpu: {
    usage: number;
    temperature: number;
    frequency: number;
    voltage: number;
    cores: Array<{ id: number; usage: number; temperature: number; }>;
  };
  gpu: Array<{
    id: number;
    name: string;
    usage: number;
    temperature: number;
    memory: { used: number; total: number; usage: number; };
    fanSpeed: number;
    voltage: number;
    powerDraw: number;
  }>;
  memory: { usage: number; available: number; total: number; speed: number; };
  storage: Array<{
    id: string;
    name: string;
    usage: number;
    temperature: number;
    readSpeed: number;
    writeSpeed: number;
    health: number;
  }>;
  fans: Record<string, { name: string; rpm: number; percentage: number; }>;
  voltages: Record<string, { name: string; value: number; min: number; max: number; }>;
  motherboard: { temperature: number; voltage: number; name: string; };
}

// types/sci-fi.ts - Sci-fi design system types
interface SciFiTheme {
  id: 'cyberpunk' | 'neon' | 'gaming' | 'corporate' | 'matrix';
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  effects: {
    glow: boolean;
    animation: boolean;
    scanlines: boolean;
    particles: boolean;
  };
}

// types/widget.ts - Widget configuration types
type SensorPath = 
  | 'cpu.usage' 
  | 'cpu.temperature' 
  | `gpu.${number}.usage` 
  | `gpu.${number}.temperature`
  | 'memory.usage'
  | `storage.${string}.usage`
  | `fans.${string}.rpm`
  | `voltages.${string}.value`;

interface BaseWidgetConfig {
  id: string;
  type: 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';
  title: string;
  sensorPath: SensorPath;
  position: { x: number; y: number };
  size: { w: number; h: number };
  minSize: { w: number; h: number };
  theme: SciFiTheme['id'];
  alerts: AlertCondition[];
  created: number;
  modified: number;
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Setup React 19+ Project with Vite 6 and Dependencies
CREATE frontend/package.json:
  - PATTERN: Include React 19, Vite 6, TanStack ecosystem, Zustand, Framer Motion
  - Add TypeScript, TailwindCSS, React Hook Form, Zod dependencies
  - Configure dev dependencies (Vitest, Playwright, SWC)

CREATE frontend/vite.config.ts:
  - PATTERN: React 19 configuration with @vitejs/plugin-react-swc
  - Add TailwindCSS preprocessing
  - Configure SWC compiler for 70% faster builds

CREATE frontend/tailwind.config.js:
  - PATTERN: Sci-fi theme integration with CSS custom properties
  - Add custom CSS variables for sci-fi color schemes
  - Configure responsive breakpoints

Task 2: Create Type Definitions and Schemas
CREATE frontend/src/types/sensor.ts:
  - PATTERN: Mirror PyHardwareMonitor sensor format from examples
  - Define real-time streaming types
  - Export all sensor-related interfaces

CREATE frontend/src/types/widget.ts:
  - PATTERN: Comprehensive widget configuration interfaces
  - Type-safe sensor path strings with template literals
  - Widget type discriminated unions

CREATE frontend/src/utils/validationSchemas.ts:
  - PATTERN: Zod schemas for widget configuration validation
  - Dynamic schema based on widget type
  - Form validation helpers with React Hook Form integration

Task 3: Implement Real-Time Sensor Data System
CREATE frontend/src/stores/sensorStore.ts:
  - PATTERN: Mirror examples/layoutStore.ts Zustand pattern
  - Real-time sensor data management with React 19 automatic batching
  - WebSocket message handling integration

CREATE frontend/src/hooks/useWebSocket.ts:
  - PATTERN: Mirror examples/useWebSocket.ts with React 19 optimizations
  - Auto-reconnection with exponential backoff
  - TanStack Query cache invalidation integration

CREATE backend/src/main.py:
  - PATTERN: FastAPI with WebSocket streaming
  - PyHardwareMonitor integration for Windows sensor reading
  - CORS configuration for React 19+ frontend

Task 4: Create Dynamic Widget Grid System
CREATE frontend/src/components/dashboard/DashboardGrid.tsx:
  - PATTERN: Mirror examples/DashboardGrid.tsx with TanStack Virtual
  - React 19 concurrent rendering for smooth performance
  - Grid snapping and collision detection

CREATE frontend/src/components/dashboard/DraggableWidget.tsx:
  - PATTERN: Framer Motion drag/drop with layout animations
  - React 19 automatic batching for position updates
  - Resize handles and boundary checking

CREATE frontend/src/stores/layoutStore.ts:
  - PATTERN: Mirror examples/layoutStore.ts exactly
  - Zustand with persistence middleware
  - Import/export functionality with JSON validation

Task 5: Build Sci-Fi Widget Library
CREATE frontend/src/components/widgets/GaugeWidget.tsx:
  - PATTERN: Mirror examples/CosmicSensorGauge.tsx patterns
  - Framer Motion animations with sci-fi visual effects
  - Real-time data binding with TanStack Query

CREATE frontend/src/components/sci-fi/SciFiFrame.tsx:
  - PATTERN: SVG-first customizable frames for widgets
  - Dynamic path generation for responsive layouts
  - Multiple sci-fi aesthetic presets

CREATE frontend/src/components/widgets/GraphWidget.tsx:
  - PATTERN: Chart.js integration with sci-fi styling
  - Historical data visualization with TanStack Query
  - Configurable chart parameters with Zod validation

Task 6: Implement Widget Configurator
CREATE frontend/src/components/dashboard/WidgetConfigurator.tsx:
  - PATTERN: Modal with React Hook Form and Zod validation
  - Dynamic form fields based on widget type
  - Live preview of widget changes

CREATE frontend/src/stores/widgetStore.ts:
  - PATTERN: Widget registry and preset management
  - JSON-based persistence with localStorage
  - Widget creation and deletion with Zustand

Task 7: Add AI-Powered Layout Suggestions
CREATE frontend/src/services/aiLayoutService.ts:
  - PATTERN: Google Genkit integration for AI suggestions
  - Context-aware prompt generation with dashboard state
  - Layout optimization algorithms with error handling

CREATE backend/src/api/ai_layout.py:
  - PATTERN: FastAPI endpoint with Pydantic models
  - Google Genkit model integration
  - Request/response handling with proper validation

CREATE frontend/src/components/dashboard/AILayoutModal.tsx:
  - PATTERN: Modal with AI suggestion display
  - Preview and apply layout suggestions
  - User feedback and refinement interface

Task 8: Create Alert System
CREATE frontend/src/stores/alertStore.ts:
  - PATTERN: Alert condition management with Zustand
  - Threshold monitoring and notification triggers
  - Alert history and acknowledgment system

CREATE frontend/src/services/notificationService.ts:
  - PATTERN: Desktop notification helper with permission handling
  - Alert formatting and display with Web Notifications API
  - Integration with alert store conditions

Task 9: Implement Sci-Fi Theme System
CREATE frontend/src/stores/themeStore.ts:
  - PATTERN: Zustand store for sci-fi theme management
  - CSS custom property updates for real-time theming
  - Multiple sci-fi color schemes (Cyberpunk, Neon, Gaming, Corporate, Matrix)

CREATE frontend/src/styles/sci-fi-themes.css:
  - PATTERN: CSS custom properties for each theme
  - Sci-fi visual effects (glows, scanlines, particles)
  - Responsive design variables

Task 10: Build Main Dashboard and Toolbar
CREATE frontend/src/components/dashboard/Dashboard.tsx:
  - PATTERN: Main dashboard container with all integrations
  - TanStack Router integration with layout routes
  - Real-time data flow coordination

CREATE frontend/src/components/dashboard/Toolbar.tsx:
  - PATTERN: Dashboard toolbar with edit mode controls
  - Layout switcher and AI suggestion triggers
  - Import/export and settings access

Task 11: Create TanStack Router Routes
CREATE frontend/src/routes/__root.tsx:
  - PATTERN: Root layout with theme provider and query client
  - Initialize all stores and WebSocket connections
  - Global error handling with React error boundaries

CREATE frontend/src/routes/index.tsx:
  - PATTERN: Main SenseCanvas dashboard route
  - Dashboard component integration with route params
  - Initial widget setup and layout loading

Task 12: Add Comprehensive Testing
CREATE tests/unit/components/SensorGauge.test.tsx:
  - PATTERN: Component testing with Vitest and React Testing Library
  - Mock TanStack Query and Zustand stores
  - Test real-time data updates and animations

CREATE tests/e2e/dashboard.spec.ts:
  - PATTERN: E2E testing with Playwright
  - Full dashboard workflow testing
  - Real-time streaming validation and AI layout testing
```

### Per task pseudocode

```typescript
// Task 3: Real-Time Sensor Data System
// stores/sensorStore.ts (React 19+ with Zustand)
import { create } from 'zustand';
import type { SensorData } from '../types/sensor';

interface SensorState {
  data: SensorData;
  isConnected: boolean;
  lastUpdate: number;
  connectionError: string | null;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  data: {}, // Initial empty sensor data
  isConnected: false,
  lastUpdate: 0,
  connectionError: null,
  
  // React 19's automatic batching handles multiple updates efficiently
  updateSensorData: (data: SensorData) => 
    set({ data, lastUpdate: Date.now() }),
  
  setConnectionStatus: (isConnected: boolean) => 
    set({ isConnected, connectionError: isConnected ? null : get().connectionError }),
}));

// Task 5: Sci-Fi Gauge Widget Implementation
// components/widgets/GaugeWidget.tsx
const GaugeWidget: React.FC<GaugeWidgetProps> = ({ sensorPath, theme, config }) => {
  const sensorData = useSensorStore(state => state.data);
  
  // PATTERN: Reactive sensor data access with useMemo
  const sensorValue = useMemo(() => {
    const path = sensorPath.split('.');
    return path.reduce((obj, key) => obj?.[key], sensorData) || 0;
  }, [sensorData, sensorPath]);
  
  // PATTERN: Framer Motion for smooth animations
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 20,
    stiffness: 100
  });
  
  useEffect(() => {
    motionValue.set(sensorValue);
  }, [sensorValue, motionValue]);
  
  return (
    <SciFiFrame theme={theme} glowEffect={config.glowEffect}>
      <motion.svg viewBox="0 0 200 200">
        <motion.path
          d={createArcPath(startAngle, endAngle)}
          stroke={getThemeColor(sensorValue, theme)}
          strokeWidth={config.thickness}
          style={{ pathLength: springValue }}
        />
      </motion.svg>
    </SciFiFrame>
  );
};

// Task 7: AI Layout Suggestions
// services/aiLayoutService.ts
import { genkit } from 'genkit';

export async function generateLayoutSuggestions(
  request: AILayoutRequest
): Promise<AILayoutSuggestion[]> {
  // PATTERN: Context-aware AI prompting
  const prompt = `
    You are a UI/UX expert specializing in PC monitoring dashboards.
    
    Current state: ${JSON.stringify(request.currentLayout)}
    User preferences: ${JSON.stringify(request.preferences)}
    
    Generate 3 optimal layout suggestions for a sci-fi themed dashboard.
    Focus on grouping related sensors and creating visual hierarchy.
  `;
  
  // CRITICAL: Error handling for AI service availability
  try {
    const result = await genkit.generate({
      model: 'gemini-pro',
      prompt,
      context: request
    });
    
    return JSON.parse(result.data);
  } catch (error) {
    console.error('AI layout generation failed:', error);
    return []; // Graceful fallback
  }
}
```

### Integration Points
```yaml
DEPENDENCIES:
  - Add to package.json:
    - "react": "^19.0.0"
    - "vite": "^6.0.0"
    - "@vitejs/plugin-react-swc": "^4.0.0"
    - "@tanstack/react-router": "^1.0.0"
    - "@tanstack/react-query": "^5.0.0"
    - "@tanstack/react-virtual": "^3.0.0"
    - "zustand": "^5.0.0"
    - "framer-motion": "^12.0.0"
    - "react-hook-form": "^7.53.0"
    - "zod": "^3.23.0"
    - "genkit": "^0.5.0"

BACKEND:
  - FastAPI: PyHardwareMonitor, websockets, uvicorn, pythonnet
  - LibreHardwareMonitorLib.dll (required DLL file)
  - Real-time streaming via WebSocket with React 19 automatic batching
  
CONFIGURATION:
  - vite.config.ts: React 19 + SWC compiler + TailwindCSS
  - tailwind.config.js: Sci-fi theme + custom variables
  - genkit.config.js: AI model configuration
  
STORES:
  - sensorStore: Real-time hardware data (Zustand)
  - layoutStore: Widget positions and persistence (Zustand + persist)
  - widgetStore: Widget registry and presets (Zustand)
  - themeStore: Sci-fi theme management (Zustand)
  - alertStore: Alert conditions and notifications (Zustand)
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Frontend validation with React 19+ tooling
npm run type-check    # TypeScript checking with React 19 types
npm run lint          # ESLint with React 19 rules
npm run format        # Prettier formatting

# Backend validation
cd backend
python -m py_compile src/main.py
python -m flake8 src/

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Unit Tests
```typescript
// tests/unit/components/GaugeWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GaugeWidget } from '../../../src/components/widgets/GaugeWidget';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('GaugeWidget', () => {
  it('renders sensor value with React 19 automatic batching', () => {
    render(
      <GaugeWidget
        sensorPath="cpu.usage"
        theme={{ id: 'cyberpunk', colors: { primary: '#00ff88' } }}
        value={75}
      />,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByTestId('sci-fi-gauge')).toHaveClass('cyberpunk-theme');
  });
  
  it('handles real-time sensor updates with automatic batching', async () => {
    const { rerender } = render(<GaugeWidget value={50} />, { wrapper: TestWrapper });
    
    // React 19's automatic batching should handle rapid updates efficiently
    rerender(<GaugeWidget value={75} />);
    rerender(<GaugeWidget value={80} />);
    
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
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
# Start backend server (requires admin privileges for sensor access)
cd backend
# Ensure LibreHardwareMonitorLib.dll is in the same directory
python src/main.py  # Run as administrator for full sensor access

# Start React 19+ dev server with Vite 6
npm run dev

# Run E2E tests
npm run test:e2e

# Manual testing checklist:
# 1. Navigate to http://localhost:5173
# 2. Verify React 19 automatic batching with real-time sensor updates
# 3. Test TanStack Virtual performance with many widgets
# 4. Drag widgets with Framer Motion smooth animations
# 5. Configure widget appearance with React Hook Form + Zod
# 6. Test AI layout suggestions with Google Genkit
# 7. Import/export dashboard layouts
# 8. Test alert notifications with Web Notifications API
# 9. Switch sci-fi themes and verify CSS custom property updates
# 10. Verify PyHardwareMonitor sensor readings are accurate
```

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('React 19 real-time sensor data updates', async ({ page }) => {
  await page.goto('/');
  
  // Check React 19 automatic batching with sensor data
  await expect(page.locator('[data-testid="cpu-usage"]')).toBeVisible();
  
  // Wait for real-time updates with automatic batching
  const initialValue = await page.locator('[data-testid="cpu-usage"]').textContent();
  await page.waitForTimeout(2000);
  const updatedValue = await page.locator('[data-testid="cpu-usage"]').textContent();
  
  expect(initialValue).not.toBe(updatedValue);
});

test('TanStack Virtual performance with widget grid', async ({ page }) => {
  await page.goto('/');
  
  // Add many widgets to test virtualization
  for (let i = 0; i < 50; i++) {
    await page.click('[data-testid="add-widget-button"]');
  }
  
  // Verify smooth scrolling with TanStack Virtual
  await page.locator('[data-testid="dashboard-grid"]').scroll({ top: 1000 });
  
  // Should render smoothly without performance issues
  await expect(page.locator('[data-testid="virtualized-widget"]').first()).toBeVisible();
});

test('AI layout suggestions with Google Genkit', async ({ page }) => {
  await page.goto('/');
  
  // Open AI suggestions modal
  await page.click('[data-testid="ai-layout-button"]');
  
  // Wait for Genkit AI suggestions to load
  await expect(page.locator('[data-testid="ai-suggestion"]')).toBeVisible();
  
  // Apply suggestion and verify layout changes
  await page.click('[data-testid="apply-ai-suggestion"]');
  await expect(page.locator('[data-testid="dashboard-grid"]')).toHaveAttribute('data-ai-applied', 'true');
});
```

## Final Validation Checklist
- [ ] All unit tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] React 19 automatic batching works with real-time sensor data
- [ ] TanStack Virtual handles large widget grids efficiently
- [ ] Widgets are draggable with Framer Motion smooth animations
- [ ] Widget configurations persist with Zustand stores
- [ ] AI layout suggestions generate and apply with Google Genkit
- [ ] Import/export functionality works with JSON validation
- [ ] Alert system triggers Web Notifications API correctly
- [ ] Sci-fi theme switching updates CSS custom properties
- [ ] Performance remains smooth with React 19 concurrent features
- [ ] WebSocket connections handle reconnection with exponential backoff
- [ ] No console errors in browser with React 19
- [ ] PyHardwareMonitor backend reads sensor data correctly
- [ ] LibreHardwareMonitorLib.dll loads properly (Windows only)
- [ ] Admin privileges handled correctly for full sensor access
- [ ] Responsive design works with sci-fi theming
- [ ] Vite 6 builds optimize correctly with SWC compiler

---

## Anti-Patterns to Avoid
- ❌ Don't use React 18 patterns - leverage React 19's automatic batching and concurrent features
- ❌ Don't forget to close WebSocket connections in useEffect cleanup
- ❌ Don't hardcode sensor paths - make them configurable with type-safe strings
- ❌ Don't ignore WebSocket reconnection logic with exponential backoff
- ❌ Don't skip Web Notifications API permission requests
- ❌ Don't use blocking operations in real-time data handling
- ❌ Don't forget to validate widget configurations with Zod schemas
- ❌ Don't ignore TanStack Virtual performance optimizations for large grids
- ❌ Don't hardcode AI prompts - make them context-aware with dashboard state
- ❌ Don't skip error handling in Google Genkit AI integration
- ❌ Don't commit sensitive API keys or credentials
- ❌ Don't forget LibreHardwareMonitorLib.dll in deployment
- ❌ Don't ignore admin privilege requirements for PyHardwareMonitor
- ❌ Don't assume sensor types - validate against LibreHardwareMonitorLib spec
- ❌ Don't use regular Babel - use @vitejs/plugin-react-swc for 70% faster builds

## Confidence Score: 9/10

Very high confidence due to:
- Comprehensive feature specification with React 19+ focus
- Detailed examples provided in codebase showing exact patterns to follow
- Extensive research on all required technologies and latest 2025 best practices
- Clear integration patterns established with real working code examples
- Well-defined validation gates with executable commands
- Proven real-time streaming approaches with React 19 automatic batching
- Complete TanStack ecosystem integration patterns
- Detailed AI integration approach with Google Genkit

Minor uncertainty around:
- "Cosmic UI" design system specifics (seems to be internal/custom rather than public library)
- Google Genkit integration specifics (newer technology, but well documented)
- Performance optimization with very large numbers of real-time widgets (100+)