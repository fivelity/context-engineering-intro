name: "SenseCanvas: React 19+ PC Sensor Dashboard with AI Layout Suggestions"
description: |

## Purpose
Build SenseCanvas, a hyper-customizable PC sensor dashboard using React 19+, Vite, TanStack ecosystem, and Google Genkit for AI-powered layout suggestions. This comprehensive PRP provides all context needed to implement a production-ready real-time hardware monitoring system with cutting-edge React technologies and Cosmic UI's futuristic design system.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the React 19+ ecosystem
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create SenseCanvas, a modern, real-time, and deeply customizable dashboard for monitoring PC hardware sensors using React 19+ with concurrent features, TanStack ecosystem for state management and routing, and Cosmic UI for a futuristic sci-fi aesthetic. The application should provide visual widgets for CPU, GPU, RAM, fans, and storage data with AI-powered layout suggestions, extensive customization options, and real-time streaming capabilities.

## Why
- **Business value**: Provides enthusiasts and professionals with a comprehensive PC monitoring solution with cutting-edge UI
- **Integration**: Demonstrates advanced React 19+ patterns with TanStack ecosystem, Cosmic UI design system, and AI integration
- **Problems solved**: Eliminates need for multiple monitoring tools; provides unified, customizable, intelligent, and visually stunning dashboard experience

## What
A React 19+ application featuring:
- **Real-Time Sensor Monitoring**: Connect to FastAPI backend for live sensor data streaming with React 19's concurrent features
- **Dynamic Widget Grid**: Draggable/resizable layout with TanStack Virtual for performance and full persistence
- **AI-Powered Layout Suggestions**: Google Genkit integration for intelligent widget arrangement
- **Cosmic UI Design System**: SVG-first sci-fi components with customizable frames and futuristic styling
- **Extensive Widget Library**: Configurable presets with visual editor using Cosmic UI components
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
- [ ] Cosmic UI theme switching works across all widgets and components
- [ ] Performance remains smooth with TanStack Virtual handling large widget grids
- [ ] All tests pass with Vitest and Playwright
- [ ] Code meets quality standards with React 19+ best practices

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://react.dev/blog/2024/04/25/react-19
  why: React 19 documentation for concurrent features, automatic batching, and performance improvements
  
- url: https://vitejs.dev/guide/
  why: Vite 6 build tool configuration and optimization for React 19+ applications
  
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
  
- url: https://www.cosmic-ui.com/docs
  why: Cosmic UI documentation for SVG-first sci-fi design system
  
- url: https://www.cosmic-ui.com/docs/frame
  why: Cosmic UI Frame component for customizable SVG widget containers
  
- url: https://genkit.dev/
  why: Google Genkit framework for AI-powered layout suggestions
  
- url: https://tanstack.com/virtual/latest
  why: TanStack Virtual for high-performance widget grid virtualization
  
- url: https://zod.dev/
  why: Zod schema validation for widget configuration forms and API responses
  
- url: https://github.com/snip3rnick/PyHardwareMonitor
  why: PyHardwareMonitor library - thin Python layer for LibreHardwareMonitorLib
  
- url: https://vitest.dev/guide/
  why: Vitest testing framework that works seamlessly with Vite and React
  
- url: https://playwright.dev/docs/test-components
  why: Playwright for reliable E2E testing of React components
```

### Current Codebase tree
```bash
.
├── examples/
│   ├── CosmicFrame.svelte         # Cosmic UI Frame component example (to be adapted to React)
│   ├── CosmicSensorGauge.svelte   # Custom sensor gauge example (to be adapted to React)
│   ├── DashboardGrid.svelte       # CSS Grid layout example (to be adapted to React)
│   ├── DraggableWidget.svelte     # Drag/drop integration example (to be adapted to React)
│   ├── ThemeConfig.js             # Theme switching example (to be adapted to React/TS)
│   └── layoutStore.ts             # Layout persistence store (to be adapted to Zustand)
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md
│   └── EXAMPLE_multi_agent_prp.md
├── sensor-dash-react/             # NEW React 19+ project documentation
│   ├── README.md                  # Updated for React 19+ tech stack
│   ├── project_architecture.md   # React 19+ and TanStack ecosystem architecture
│   ├── frontend_guide.md          # Modern React patterns and hooks
│   └── sources.md                 # React 19+ and modern framework references
├── CLAUDE.md                      # Project instructions (updated with Cosmic UI)
├── FullFeature.md                 # Complete SenseCanvas feature spec
├── INITIAL.md                     # Initial feature requirements (updated with Cosmic UI)
└── README.md
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
│   │   │   │   └── ThemeProvider.tsx   # Cosmic UI theme provider
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx            # Main dashboard container
│   │   │   │   ├── DashboardGrid.tsx        # Virtualized grid with TanStack Virtual
│   │   │   │   ├── DraggableWidget.tsx      # Draggable widget wrapper with Framer Motion
│   │   │   │   ├── WidgetConfigurator.tsx   # Widget customization modal
│   │   │   │   ├── Toolbar.tsx              # Dashboard toolbar with controls
│   │   │   │   └── AILayoutModal.tsx        # AI layout suggestions interface
│   │   │   ├── widgets/
│   │   │   │   ├── BaseWidget.tsx           # Base widget component with Cosmic UI
│   │   │   │   ├── GaugeWidget.tsx          # Cosmic UI gauge widgets
│   │   │   │   ├── GraphWidget.tsx          # Real-time charts with Chart.js
│   │   │   │   ├── SimpleWidget.tsx         # Single-value displays
│   │   │   │   └── MultiResourceWidget.tsx  # Aggregate sensor views
│   │   │   ├── cosmic-ui/
│   │   │   │   ├── CosmicFrame.tsx          # Adapted Cosmic UI Frame component
│   │   │   │   ├── CosmicChart.tsx          # Extended Cosmic UI charts
│   │   │   │   ├── CosmicGauge.tsx          # Custom sensor gauges
│   │   │   │   └── CosmicThemeToggle.tsx    # Theme switching component
│   │   │   └── common/
│   │   │       ├── Button.tsx               # Custom buttons with Cosmic UI styling
│   │   │       ├── Modal.tsx                # Modal wrapper with animations
│   │   │       └── LoadingSpinner.tsx       # Loading states with sci-fi effects
│   │   ├── hooks/
│   │   │   ├── useSensorData.ts             # TanStack Query hook for sensor data
│   │   │   ├── useWebSocket.ts              # WebSocket connection with React 19
│   │   │   ├── useWidgetGrid.ts             # Grid layout management
│   │   │   ├── useCosmicTheme.ts            # Cosmic UI theme management
│   │   │   ├── useDragAndDrop.ts            # Drag and drop with Framer Motion
│   │   │   └── useLocalStorage.ts           # Persistent storage utilities
│   │   ├── stores/
│   │   │   ├── sensorStore.ts               # Zustand store for real-time sensor data
│   │   │   ├── layoutStore.ts               # Zustand store for widget layout
│   │   │   ├── themeStore.ts                # Zustand store for Cosmic UI themes
│   │   │   ├── widgetStore.ts               # Zustand store for widget registry
│   │   │   └── alertStore.ts                # Zustand store for alert conditions
│   │   ├── services/
│   │   │   ├── sensorService.ts             # WebSocket sensor client
│   │   │   ├── aiLayoutService.ts           # Google Genkit AI integration
│   │   │   ├── notificationService.ts       # Desktop notifications
│   │   │   └── storageService.ts            # Import/export functionality
│   │   ├── utils/
│   │   │   ├── cosmicUtils.ts               # Cosmic UI helper functions
│   │   │   ├── gridUtils.ts                 # Grid calculation utilities
│   │   │   ├── validationSchemas.ts         # Zod validation schemas
│   │   │   ├── dateUtils.ts                 # Date/time formatting utilities
│   │   │   └── mathUtils.ts                 # Mathematical calculations
│   │   ├── types/
│   │   │   ├── sensor.ts                    # Sensor data type definitions
│   │   │   ├── widget.ts                    # Widget configuration types
│   │   │   ├── cosmic-ui.ts                 # Cosmic UI component types
│   │   │   ├── dashboard.ts                 # Dashboard layout types
│   │   │   └── api.ts                       # API response types
│   │   ├── routes/
│   │   │   ├── __root.tsx                   # TanStack Router root with providers
│   │   │   ├── index.tsx                    # Main dashboard route
│   │   │   ├── settings.tsx                 # Configuration settings route
│   │   │   └── about.tsx                    # About/help route
│   │   └── styles/
│   │       ├── globals.css                  # Global styles and Cosmic UI variables
│   │       ├── cosmic-themes.css            # Cosmic UI theme definitions
│   │       └── animations.css               # Framer Motion animation presets
│   ├── public/
│   │   ├── favicon.ico
│   │   └── cosmic-ui-assets/                # Cosmic UI static assets
│   ├── package.json                         # React 19+ dependencies
│   ├── vite.config.ts                       # Vite configuration for React 19+
│   ├── tailwind.config.js                   # TailwindCSS with Cosmic UI integration
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
├── tests/
│   ├── unit/
│   │   ├── components/                      # React component unit tests
│   │   ├── hooks/                           # Custom hook tests
│   │   ├── stores/                          # Zustand store tests
│   │   └── utils/                           # Utility function tests
│   ├── integration/
│   │   ├── api/                             # API integration tests
│   │   └── websocket/                       # WebSocket integration tests
│   └── e2e/
│       ├── dashboard.spec.ts                # E2E dashboard tests
│       ├── real-time.spec.ts                # Real-time streaming tests
│       └── ai-layout.spec.ts                # AI layout suggestion tests
├── docs/                                    # Project documentation
└── README.md                                # Main project README
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
data = ToBuiltinTypes(computer.Hardware)  // Convert to JSON-serializable

// CRITICAL: React 19 automatic batching behavior
// Example: Multiple state updates are automatically batched
const handleSensorUpdate = (data: SensorData) => {
  setSensorData(data);        // These are automatically batched
  setLastUpdate(Date.now());  // together for better performance
  setConnectionStatus('active');
};

// CRITICAL: TanStack Query cache invalidation patterns
// Example: Proper cache management for real-time data
const invalidateQueries = () => {
  queryClient.invalidateQueries(['sensors']);
  queryClient.refetchQueries(['sensors'], { exact: true });
};

// CRITICAL: Zustand store persistence with immer
// Example: Complex state updates require proper immutability
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

// CRITICAL: WebSocket connection cleanup in React
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
// Example: Proper virtualizer configuration for widget grids
const virtualizer = useVirtualizer({
  count: widgets.length,
  getScrollElement: () => parentRef.current,
  estimateSize: useCallback((index) => {
    // Return estimated height based on widget type
    const widget = widgets[index];
    return widget.type === 'graph' ? 400 : 200;
  }, [widgets]),
  overscan: 5, // Render extra items for smooth scrolling
});

// CRITICAL: Framer Motion layout animations and performance
// Example: Proper layout animation configuration
<motion.div
  layout
  layoutId={widget.id}
  transition={{ 
    type: "spring", 
    damping: 20, 
    stiffness: 300 
  }}
  // Avoid layout thrashing with will-change
  style={{ willChange: 'transform' }}
>

// CRITICAL: Cosmic UI SVG path processing for responsive frames
// Example: Convert percentage-based paths to actual coordinates
const processCosmicPath = (pathString: string, width: number, height: number) => {
  return pathString
    .replace(/(\d+)%/g, (match, percent) => `${(parseFloat(percent) / 100) * width}`)
    .replace(/100% - (\d+)/g, (match, offset) => `${width - parseFloat(offset)}`);
};

// CRITICAL: React Hook Form with dynamic widget schemas
// Example: Dynamic validation based on widget type
const schema = useMemo(() => {
  return z.discriminatedUnion('type', [
    z.object({ type: z.literal('gauge'), config: gaugeConfigSchema }),
    z.object({ type: z.literal('graph'), config: graphConfigSchema }),
  ]);
}, []);

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
useEffect(() => {
  const interval = setInterval(() => {
    computer.Update();
    const freshData = ToBuiltinTypes(computer.Hardware);
    // Use TanStack Query mutation for optimistic updates
    sensorMutation.mutate(freshData);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// CRITICAL: Google Genkit requires proper authentication and context
// Example: AI layout suggestions need dashboard state context
const aiSuggestion = await genkit.generate({
  model: 'gemini-pro',
  prompt: `Suggest layout for dashboard with ${widgetCount} widgets`,
  context: {
    currentLayout: layoutStore.getState(),
    sensorTypes: Object.keys(sensorData),
    screenSize: { width: window.innerWidth, height: window.innerHeight }
  }
});

// CRITICAL: Notification API requires permission request in React
// Example: Request permission before showing alerts
const requestNotificationPermission = useCallback(async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
}, []);

// CRITICAL: Vite HMR with React 19 and preserving state
// Example: Preserve Zustand state during development
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Preserve store state during HMR
    const currentState = useLayoutStore.getState();
    newModule?.useLayoutStore.setState(currentState);
  });
}

// CRITICAL: TanStack Router type safety with search params
// Example: Proper route definition with typed search params
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  validateSearch: z.object({
    layout: z.string().optional(),
    theme: z.enum(['cyberpunk', 'neon', 'gaming', 'corporate']).optional(),
  }),
});

// CRITICAL: Chart.js performance with Cosmic UI styling
// Example: Optimize chart rendering with proper configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  elements: {
    point: {
      radius: 0 // Hide points for better performance with real-time data
    }
  },
  plugins: {
    legend: {
      display: false // Custom legend with Cosmic UI styling
    }
  }
};
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
    cores: Array<{
      id: number;
      usage: number;
      temperature: number;
    }>;
  };
  gpu: Array<{
    id: number;
    name: string;
    usage: number;
    temperature: number;
    memory: {
      used: number;
      total: number;
      usage: number;
    };
    fanSpeed: number;
    voltage: number;
    powerDraw: number;
  }>;
  memory: {
    usage: number;
    available: number;
    total: number;
    speed: number;
  };
  storage: Array<{
    id: string;
    name: string;
    usage: number;
    temperature: number;
    readSpeed: number;
    writeSpeed: number;
    health: number;
  }>;
  fans: Record<string, {
    name: string;
    rpm: number;
    percentage: number;
  }>;
  voltages: Record<string, {
    name: string;
    value: number;
    min: number;
    max: number;
  }>;
  motherboard: {
    temperature: number;
    voltage: number;
    name: string;
  };
  network: Array<{
    name: string;
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  }>;
}

// types/cosmic-ui.ts - Cosmic UI component types
interface CosmicTheme {
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

interface CosmicFrameProps {
  children: React.ReactNode;
  theme: CosmicTheme;
  glowEffect?: boolean;
  animated?: boolean;
  paths: SVGPath[];
  className?: string;
}

interface SVGPath {
  d: string;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity?: number;
  className?: string;
}

// types/widget.ts - Widget configuration types with Cosmic UI integration
type SensorPath = 
  | 'cpu.usage' 
  | 'cpu.temperature' 
  | 'cpu.frequency'
  | 'cpu.voltage'
  | `cpu.cores.${number}.usage`
  | `cpu.cores.${number}.temperature`
  | `gpu.${number}.usage` 
  | `gpu.${number}.temperature`
  | `gpu.${number}.memory.usage`
  | `gpu.${number}.fanSpeed`
  | 'memory.usage'
  | 'memory.available'
  | `storage.${string}.usage`
  | `storage.${string}.temperature`
  | `fans.${string}.rpm`
  | `voltages.${string}.value`
  | 'motherboard.temperature'
  | `network.${number}.bytesReceived`;

type WidgetType = 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';

interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  sensorPath: SensorPath;
  position: { x: number; y: number };
  size: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
  theme: CosmicTheme['id'];
  alerts: AlertCondition[];
  created: number;
  modified: number;
}

interface GaugeWidgetConfig extends BaseWidgetConfig {
  type: 'gauge';
  config: {
    gaugeType: 'arc' | 'radial' | 'linear';
    startAngle: number;
    endAngle: number;
    thickness: number;
    showValue: boolean;
    showLabel: boolean;
    animated: boolean;
    glowEffect: boolean;
    pulseAnimation: boolean;
    gradientStops: string[];
    cosmicFrame: {
      enabled: boolean;
      frameType: 'basic' | 'advanced' | 'custom';
      customPaths?: SVGPath[];
    };
    thresholds: {
      warning: number;
      critical: number;
    };
    unit: string;
    precision: number;
  };
}

interface GraphWidgetConfig extends BaseWidgetConfig {
  type: 'graph';
  config: {
    chartType: 'line' | 'area' | 'bar';
    timeRange: number; // seconds
    dataPoints: number;
    showGrid: boolean;
    showLegend: boolean;
    animated: boolean;
    cosmicStyling: {
      glowLines: boolean;
      scanlineEffect: boolean;
      gridOpacity: number;
    };
    colors: {
      line: string;
      fill: string;
      grid: string;
    };
    yAxis: {
      min?: number;
      max?: number;
      autoScale: boolean;
    };
  };
}

interface SimpleWidgetConfig extends BaseWidgetConfig {
  type: 'simple';
  config: {
    displayFormat: 'number' | 'percentage' | 'bytes' | 'frequency';
    precision: number;
    showUnit: boolean;
    showIcon: boolean;
    iconName?: string;
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    cosmicEffects: {
      glowText: boolean;
      scanlineAnimation: boolean;
      typewriterEffect: boolean;
    };
  };
}

type WidgetConfig = GaugeWidgetConfig | GraphWidgetConfig | SimpleWidgetConfig;

// types/dashboard.ts - Dashboard layout types
interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  gridSize: number;
  theme: CosmicTheme['id'];
  backgroundEffects: {
    particles: boolean;
    scanlines: boolean;
    glowGrid: boolean;
  };
  created: number;
  modified: number;
  version: string;
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  layout: Omit<DashboardLayout, 'id' | 'created' | 'modified'>;
  category: 'gaming' | 'professional' | 'minimal' | 'showcase';
}

// types/api.ts - API and WebSocket types
interface WebSocketMessage {
  type: 'sensor_data' | 'connection_status' | 'error';
  data: any;
  timestamp: number;
}

interface SensorDataMessage extends WebSocketMessage {
  type: 'sensor_data';
  data: SensorData;
}

interface ConnectionStatusMessage extends WebSocketMessage {
  type: 'connection_status';
  data: {
    connected: boolean;
    clientCount: number;
    uptime: number;
  };
}

interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    details?: any;
  };
}

// Alert system types
interface AlertCondition {
  id: string;
  name: string;
  sensorPath: SensorPath;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  enabled: boolean;
  actions: AlertAction[];
}

interface AlertAction {
  type: 'notification' | 'email' | 'webhook' | 'sound';
  config: Record<string, any>;
}

interface Alert {
  id: string;
  conditionId: string;
  conditionName: string;
  sensorPath: SensorPath;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
}

// AI layout suggestion types
interface AILayoutRequest {
  currentLayout: DashboardLayout;
  preferences: {
    priority: 'performance' | 'aesthetics' | 'functionality';
    theme: CosmicTheme['id'];
    density: 'compact' | 'spacious' | 'balanced';
    focusAreas: SensorPath[];
  };
  constraints: {
    maxWidgets?: number;
    minWidgetSize?: { w: number; h: number };
    screenSize: { width: number; height: number };
  };
}

interface AILayoutSuggestion {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  confidence: number;
  layout: DashboardLayout;
  metrics: {
    efficiency: number;
    aesthetics: number;
    functionality: number;
  };
  preview?: string; // Base64 encoded image
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
```
