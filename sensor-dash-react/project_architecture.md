# SenseCanvas React 19+ Project Architecture

## Application Architecture

### Modern React 19+ Full-Stack Design
- **Frontend**: Cutting-edge React 19+ application with Vite, TanStack ecosystem, and Cosmic UI
- **Backend**: FastAPI-based Python server handling hardware data collection and WebSocket communications
- **Communication**: Real-time bidirectional communication via WebSockets with React 19's concurrent features
- **Deployment**: Docker containerization for easy deployment and development

### Data Flow
1. **Hardware Monitoring**: PyHardwareMonitor wrapper interfaces with LibreHardwareMonitorLib.dll (Windows) or falls back to psutil (cross-platform)
2. **Sensor Data Collection**: Raw hardware sensors are polled and normalized
3. **Data Processing**: Structured hardware metrics are validated using Pydantic models and prepared for transmission
4. **Real-time Broadcasting**: Metrics are broadcast to connected clients via WebSocket connections
5. **React State Updates**: Frontend receives data and updates Zustand stores with React 19's automatic batching
6. **Component Reactivity**: Dashboard widgets automatically re-render using TanStack Query's reactive caching
7. **Performance Optimization**: TanStack Virtual handles large widget grids efficiently

## Core Technologies

### Frontend Technologies
- **React 19**: Latest React with concurrent features, improved hydration, automatic batching, and enhanced performance
- **Vite 6**: Next-generation frontend build tool with lightning-fast HMR, optimized bundling, and excellent DX
- **TanStack Router**: Type-safe, modern routing with automatic code splitting, preloading, and search params management
- **TanStack Query**: Powerful server state management with automatic caching, background updates, optimistic updates, and real-time synchronization
- **Zustand**: Lightweight, modern state management with minimal boilerplate and excellent TypeScript support
- **Cosmic UI**: SVG-first sci-fi component library providing futuristic design system with customizable frames and styling
- **TailwindCSS**: Utility-first CSS framework working alongside Cosmic UI for layout and spacing
- **Framer Motion**: Production-ready motion library for smooth animations, layout transitions, and gesture handling
- **React Hook Form**: Performant forms library with minimal re-renders and excellent validation support
- **Zod**: Type-safe schema validation for form inputs and API responses
- **@tanstack/react-virtual**: High-performance virtualization for handling large widget grids
- **TypeScript 5+**: Enhanced type safety with modern TypeScript features

### Backend Technologies
- **FastAPI**: Modern Python web framework with automatic API documentation and async support
- **WebSockets**: Real-time bidirectional communication optimized for React 19's concurrent features
- **PyHardwareMonitor**: Custom Python wrapper for LibreHardwareMonitor integration
- **LibreHardwareMonitorLib.dll**: Native .NET library for deep Windows hardware access
- **psutil**: Cross-platform system monitoring (fallback for non-Windows platforms)
- **Python.NET**: .NET Common Language Runtime integration for Python
- **Pydantic**: Data validation and settings management with automatic serialization
- **Asyncio**: Asynchronous programming for efficient concurrent data collection
- **Google Genkit**: AI framework for intelligent layout suggestions and UI generation

### AI Integration
- **Google Genkit**: Advanced AI framework for generating intelligent layout suggestions
- **Context-Aware Prompting**: AI suggestions based on current dashboard state and user preferences
- **Real-time Optimization**: Dynamic layout adjustments based on sensor data patterns

## Modern React 19+ Patterns

### State Management Architecture
```typescript
// Zustand store with React 19 optimizations
const useSensorStore = create<SensorState>((set, get) => ({
  data: {},
  isConnected: false,
  updateSensorData: (data) => set({ data }), // Automatic batching in React 19
  connect: () => {
    // WebSocket connection with React 19 concurrent features
  }
}));

// TanStack Query for server state
const useSensorQuery = () =>
  useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensorData,
    refetchInterval: 1000, // Real-time updates
    staleTime: 500, // Optimized for real-time data
  });
```

### Component Architecture
```typescript
// React 19 with Cosmic UI integration
const SensorGauge = ({ sensorPath, theme }: GaugeProps) => {
  const sensorData = useSensorStore(state => state.data);
  const value = useMemo(() => 
    sensorPath.split('.').reduce((obj, key) => obj?.[key], sensorData), 
    [sensorData, sensorPath]
  );

  return (
    <CosmicFrame theme={theme}>
      <CosmicGauge 
        value={value} 
        animated 
        glowEffect 
        onThresholdExceeded={handleAlert}
      />
    </CosmicFrame>
  );
};
```

### Performance Optimizations
- **React 19's Automatic Batching**: Multiple state updates automatically batched
- **TanStack Virtual**: Virtualized widget grids for handling 100+ widgets
- **Concurrent Rendering**: Non-blocking updates for better user experience
- **Automatic Memoization**: React 19's improved automatic optimizations
- **Code Splitting**: TanStack Router's automatic route-based splitting

## Cosmic UI Integration Architecture

### SVG-First Design System
```typescript
// Cosmic UI frame system for widget containers
interface CosmicFrameProps {
  paths: SVGPath[];
  theme: CosmicTheme;
  glowEffect?: boolean;
  animated?: boolean;
}

// Extended components for sensor monitoring
interface CosmicSensorGaugeProps extends CosmicGaugeProps {
  sensorType: 'temperature' | 'usage' | 'voltage' | 'frequency';
  thresholds: AlertThresholds;
  realTimeUpdates: boolean;
}
```

### Theme System
- **CSS Custom Properties**: Dynamic theme switching with Cosmic UI color schemes
- **Multiple Sci-Fi Themes**: Cyberpunk, Neon, Gaming, Corporate, Matrix
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Accessibility**: High contrast modes and reduced motion support

## Real-Time Data Architecture

### WebSocket Integration with React 19
```typescript
// Custom hook for WebSocket connection
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      // React 19's automatic batching handles multiple updates
      const newData = JSON.parse(event.data);
      setData(newData);
    };
    
    setSocket(ws);
    return () => ws.close();
  }, [url]);
  
  return { socket, data };
};
```

### TanStack Query Integration
```typescript
// Real-time sensor data with optimistic updates
const useSensorMutation = () =>
  useMutation({
    mutationFn: updateSensorThreshold,
    onMutate: async (newThreshold) => {
      // Optimistic update for immediate UI feedback
      await queryClient.cancelQueries(['sensors']);
      const previousData = queryClient.getQueryData(['sensors']);
      queryClient.setQueryData(['sensors'], newThreshold);
      return { previousData };
    },
    onError: (err, newThreshold, context) => {
      // Rollback on error
      queryClient.setQueryData(['sensors'], context.previousData);
    },
  });
```

## Security and Performance

### Security Measures
- **Input Validation**: Zod schemas for all user inputs and API responses
- **XSS Prevention**: Sanitized rendering of dynamic content
- **CORS Configuration**: Proper cross-origin request handling
- **WebSocket Security**: Secure WebSocket connections with authentication

### Performance Monitoring
- **React DevTools Profiler**: Performance monitoring in development
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Memory Management**: Proper cleanup of WebSocket connections and event listeners
- **Virtualization**: Efficient rendering of large widget grids

## Development Workflow

### Modern Tooling
- **Vite**: Fast development server with instant HMR
- **TypeScript**: Type safety across the entire application
- **ESLint + Prettier**: Code quality and formatting
- **Vitest**: Fast unit testing with Vite integration
- **Playwright**: Reliable E2E testing
- **MSW**: API mocking for testing and development
