# SenseCanvas: React 19+ Sensor Dashboard

**SenseCanvas** is a modern, real-time hardware monitoring application designed to provide comprehensive system metrics visualization through a customizable dashboard interface. Built with cutting-edge React 19+ and modern frameworks, it monitors and displays various hardware components including CPU, GPU, memory, storage, and network interfaces with a futuristic sci-fi aesthetic powered by Cosmic UI.

## Features

- **Real-time Hardware Monitoring**: Continuously monitor system hardware metrics with user-defined refresh/polling rates using React 19's concurrent features.
- **Futuristic Visual Dashboard**: An intuitive, customizable dashboard with Cosmic UI's sci-fi aesthetic for visualizing hardware performance.
- **Advanced Edit Mode**: Toggle between view and edit modes with a dedicated toolbar control.
  - **Grid-Based Layout**: Precise widget positioning with automatic grid snapping using CSS Grid and TanStack Virtual.
  - **Collision Prevention**: Smart widget placement that prevents overlapping components.
  - **Interactive Resizing**: Resize widgets with handles while maintaining grid alignment.
  - **Visual Feedback**: Clear visual cues for valid and invalid widget positions with Framer Motion animations.
- **Cosmic UI Design System**: SVG-first sci-fi components with customizable frames and futuristic styling.
- **Multiple Themes**: Choose from Cyberpunk, Neon, Gaming, and Corporate themes with Cosmic UI's color system.
- **Layout Management**: Save, load, and reset dashboard layouts with preset configurations.
- **AI-Powered Layout Suggestions**: Google Genkit integration for intelligent widget arrangement.
- **Cross-platform Compatibility**: Supports Windows with advanced hardware monitoring, with fallback capabilities for other platforms.
- **Professional Interface**: A modern, responsive web-based interface suitable for both casual users and professionals.

## Core Technologies

### Frontend
- **React 19**: Latest React with concurrent features, improved hydration, and automatic batching.
- **Vite 6**: Next-generation frontend build tool with lightning-fast HMR and optimized builds.
- **TanStack Router**: Type-safe, modern routing with excellent DX and performance.
- **TanStack Query**: Powerful server state management for real-time data synchronization.
- **Zustand**: Lightweight, modern state management with minimal boilerplate.
- **Cosmic UI**: SVG-first sci-fi component library for futuristic dashboard aesthetics.
- **TailwindCSS**: Utility-first CSS framework working alongside Cosmic UI.
- **Framer Motion**: Production-ready motion library for smooth animations.
- **React Hook Form + Zod**: Modern form handling with type-safe validation.
- **@tanstack/react-virtual**: High-performance virtualization for large widget grids.

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation.
- **WebSockets**: For real-time bidirectional communication with React 19 concurrent features.
- **PyHardwareMonitor**: Python Hardware Monitor is a thin package layer for LibreHardwareMonitorLib using pythonnet, requirements.txt: "HardwareMonitor==1.0.0".
- **LibreHardwareMonitorLib.dll**: Free software that can monitor temperature sensors, fan speeds, voltages, load and clock speeds of your computer.
- **psutil**: For cross-platform system monitoring as a fallback.
- **Google Genkit**: AI framework for intelligent layout suggestions.

## Project Structure

```
sensecanvas-react/
├── frontend/                           # React 19+ application
│   ├── src/
│   │   ├── components/                 # React components
│   │   │   ├── layout/                 # Global layout components (AppBar, Sidebar, etc.)
│   │   │   ├── dashboard/              # Dashboard-specific components
│   │   │   │   ├── DashboardGrid.tsx   # Main grid container with virtualization
│   │   │   │   ├── DraggableWidget.tsx # Draggable widget wrapper
│   │   │   │   └── widgets/            # Widget implementations
│   │   │   │       ├── GaugeWidget.tsx      # Cosmic UI gauge widgets
│   │   │   │       ├── GraphWidget.tsx      # Real-time charts
│   │   │   │       ├── SimpleWidget.tsx     # Single-value displays
│   │   │   │       └── CustomSensorGauge.tsx # Extended Cosmic UI components
│   │   │   ├── cosmic-ui/              # Cosmic UI adaptations and extensions
│   │   │   │   ├── CosmicFrame.tsx     # SVG frame component
│   │   │   │   ├── CosmicChart.tsx     # Extended chart components
│   │   │   │   └── CosmicGauge.tsx     # Custom sensor gauges
│   │   │   └── common/                 # Shared components (buttons, inputs, etc.)
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useSensorData.ts        # Real-time sensor data hook
│   │   │   ├── useWebSocket.ts         # WebSocket connection hook
│   │   │   ├── useWidgetGrid.ts        # Grid layout management hook
│   │   │   └── useCosmicTheme.ts       # Cosmic UI theme management
│   │   ├── stores/                     # Zustand stores
│   │   │   ├── sensorStore.ts          # Real-time sensor data state
│   │   │   ├── layoutStore.ts          # Widget layout persistence
│   │   │   ├── themeStore.ts           # Cosmic UI theme management
│   │   │   └── alertStore.ts           # Alert conditions and notifications
│   │   ├── services/                   # External communication services
│   │   │   ├── sensorService.ts        # WebSocket sensor client
│   │   │   ├── aiLayoutService.ts      # Genkit AI integration
│   │   │   └── notificationService.ts  # Desktop notifications
│   │   ├── utils/                      # Utility functions
│   │   │   ├── cosmicUtils.ts          # Cosmic UI helper functions
│   │   │   ├── gridUtils.ts            # Grid calculation utilities
│   │   │   └── validationSchemas.ts    # Zod validation schemas
│   │   ├── types/                      # TypeScript type definitions
│   │   │   ├── sensor.ts               # Sensor data types
│   │   │   ├── widget.ts               # Widget configuration types
│   │   │   ├── cosmic-ui.ts            # Cosmic UI component types
│   │   │   └── dashboard.ts            # Dashboard layout types
│   │   ├── routes/                     # TanStack Router routes
│   │   │   ├── __root.tsx              # Root route with providers
│   │   │   ├── index.tsx               # Main dashboard route
│   │   │   └── settings.tsx            # Configuration route
│   │   └── main.tsx                    # Application entry point
│   ├── public/                         # Static assets
│   └── package.json
├── backend/                            # Backend Python FastAPI application
│   ├── src/
│   │   ├── api/                        # API endpoint definitions (routers)
│   │   ├── core/                       # Core application logic and configuration
│   │   │   └── config.py               # Pydantic settings management
│   │   ├── services/                   # Business logic (hardware monitoring)
│   │   ├── models/                     # Pydantic data models
│   │   └── main.py                     # FastAPI application entry point
│   ├── tests/                          # Backend tests
│   ├── .env.example                    # Example environment variables
│   └── requirements.txt
├── docs/                               # Project documentation
└── README.md                           # This file
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher for React 19+)
- [Python](https://www.python.org/) (v3.9 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [.NET Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/6.0) (v6.0 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sensecanvas-react
    ```

2.  **Install dependencies for both frontend and backend:**
    ```bash
    # Frontend dependencies
    cd frontend
    pnpm install
    
    # Backend dependencies
    cd ../backend
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Configure the backend:**
    Navigate to the `backend` directory and create a `.env` file from the example:
    ```bash
    cd backend
    cp .env.example .env
    ```
    You can modify the `.env` file if your frontend is running on a different origin.

2.  **Start the backend:**
    On Windows, run the setup script to prepare the hardware monitoring library:
    ```bash
    python scripts/setup_hardware_monitor.py
    ```

    Then, start the server:
    ```bash
    python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
    ```

    **Administrator Privileges (Windows):**
    - The server runs fine without administrator privileges
    - Basic monitoring (CPU usage, memory, disk usage, network) works in all cases
    - Advanced sensors (detailed temperature monitoring, some GPU sensors) may require administrator privileges for full access
    - Running as administrator is recommended for complete sensor data but not required for core functionality

3.  **Start the frontend:**
    In a new terminal, navigate to the `frontend` directory and start the development server:
    ```bash
    cd frontend
    pnpm dev
    ```

Your application should now be running at `http://localhost:5173` with the futuristic Cosmic UI interface.

## Development

### Frontend
The frontend is a React 19+ application built with Vite and modern frameworks. You can find the source code in the `frontend/src` directory.

-   **Run in development mode:** `pnpm dev`
-   **Build for production:** `pnpm build`
-   **Preview production build:** `pnpm preview`
-   **Run tests:** `pnpm test`
-   **Run E2E tests:** `pnpm test:e2e`

### Backend
The backend is a Python FastAPI application. The source code is in the `backend/src` directory.

-   **Run in development mode:** `python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000`
-   **Dependencies:** Managed with `pip` and the `requirements.txt` file.

### Administrator Privileges
- **Not required**: The server runs and provides basic monitoring without administrator privileges
- **Recommended for advanced features**: Some temperature sensors and detailed hardware information may require administrator privileges
- **What works without admin**: CPU usage, memory usage, disk usage, network statistics, basic GPU information
- **What may need admin**: Detailed temperature sensors, some advanced GPU metrics, motherboard sensors

## Modern React 19+ Features Used

### Concurrent Features
- **Automatic Batching**: Multiple state updates are automatically batched for better performance
- **Transitions**: Use `useTransition` for non-urgent updates like layout changes
- **Suspense**: Improved Suspense boundaries for better loading states

### Advanced Patterns
- **TanStack Query**: Server state management with automatic caching, background updates, and optimistic updates
- **TanStack Router**: Type-safe routing with automatic code splitting and preloading
- **Zustand**: Minimal state management with excellent TypeScript support
- **Framer Motion**: Layout animations and gesture handling for widget interactions

### Performance Optimizations
- **React 19's improved hydration**: Faster initial page loads
- **TanStack Virtual**: Virtualized widget grids for handling large numbers of widgets
- **Automatic memoization**: React 19's improved automatic optimizations
- **Concurrent rendering**: Better user experience during heavy computations

## Cosmic UI Integration

### Design Philosophy
- **SVG-first approach**: All widgets built with customizable SVG paths
- **Sci-fi aesthetic**: Futuristic gaming dashboard with neon glows and sharp angles
- **Extensible components**: Custom sensor gauges extending Cosmic UI's design language
- **Theme system**: Multiple sci-fi color schemes with CSS custom properties

### Custom Components
Since Cosmic UI is a new library, we've created several custom components:
- **CosmicSensorGauge**: Extended gauge component for hardware monitoring
- **CosmicFrame**: Adaptable SVG frame system for widget containers
- **CosmicChart**: Enhanced charts with sci-fi styling for sensor data
- **CosmicGrid**: Grid layout system with futuristic visual effects

## React 19+ Example Code

### Modern Hook Pattern with TanStack Query
```typescript
// hooks/useSensorData.ts - Real-time sensor data with caching
export const useSensorData = () => {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensorData,
    refetchInterval: 1000,
    staleTime: 500,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// hooks/useWebSocket.ts - WebSocket with React 19 concurrent features
export const useWebSocket = (url: string) => {
  const [data, setData] = useState<SensorData | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed'>('closed');

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => setConnectionState('open');
    ws.onclose = () => setConnectionState('closed');
    ws.onmessage = (event) => {
      // React 19's automatic batching handles multiple updates efficiently
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    return () => ws.close();
  }, [url]);

  return { data, connectionState };
};
```

### Cosmic UI Integration
```typescript
// components/cosmic-ui/CosmicSensorGauge.tsx
interface CosmicSensorGaugeProps {
  value: number;
  label: string;
  theme: CosmicTheme;
  sensorType: 'temperature' | 'usage' | 'voltage';
}

export const CosmicSensorGauge: React.FC<CosmicSensorGaugeProps> = ({
  value,
  label,
  theme,
  sensorType
}) => {
  const statusColor = useMemo(() => {
    if (value >= 90) return theme.colors.error;
    if (value >= 70) return theme.colors.warning;
    return theme.colors.success;
  }, [value, theme]);

  return (
    <CosmicFrame 
      theme={theme} 
      glowEffect={true}
      paths={generateFramePaths(200, 200)}
    >
      <div className="relative flex items-center justify-center h-full">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke={`${statusColor}20`}
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke={statusColor}
            strokeWidth="8"
            strokeDasharray={`${(value / 100) * 377} 377`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            style={{
              filter: `drop-shadow(0 0 10px ${statusColor}80)`,
              transition: 'all 0.8s ease-out'
            }}
          />
          <text
            x="80"
            y="75"
            textAnchor="middle"
            className="text-2xl font-mono font-bold"
            fill={theme.colors.text}
          >
            {Math.round(value)}
          </text>
          <text
            x="80"
            y="95"
            textAnchor="middle"
            className="text-sm opacity-70"
            fill={theme.colors.textMuted}
          >
            {getSensorUnit(sensorType)}
          </text>
        </svg>
        <div className="absolute bottom-2 text-xs font-medium text-center">
          {label}
        </div>
      </div>
    </CosmicFrame>
  );
};
```

### Zustand Store with Persistence
```typescript
// stores/sensorStore.ts - Modern state management
interface SensorState {
  data: SensorData;
  isConnected: boolean;
  lastUpdate: number;
  alerts: Alert[];
}

export const useSensorStore = create<SensorState>()(
  persist(
    (set, get) => ({
      data: {} as SensorData,
      isConnected: false,
      lastUpdate: 0,
      alerts: [],
      
      updateSensorData: (data: SensorData) =>
        set({ data, lastUpdate: Date.now() }),
        
      setConnectionStatus: (isConnected: boolean) =>
        set({ isConnected }),
        
      addAlert: (alert: Alert) =>
        set(state => ({ alerts: [...state.alerts, alert] })),
    }),
    { name: 'sensor-store' }
  )
);
```

### Performance-Optimized Widget Grid
```typescript
// components/dashboard/DashboardGrid.tsx - Virtualized grid
export const DashboardGrid: React.FC = () => {
  const { widgets } = useLayoutStore();
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 250, []),
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef} 
      className="h-full overflow-auto cosmic-grid"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const widget = widgets[virtualItem.index];
          
          return (
            <motion.div
              key={widget.id}
              layoutId={widget.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <WidgetRenderer widget={widget} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
```
