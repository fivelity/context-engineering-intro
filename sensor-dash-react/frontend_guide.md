# SenseCanvas React 19+ Frontend Guide

This guide provides an overview of the React 19+ frontend application, including its architecture, state management patterns, component structure, and modern React development practices.

## Project Structure

The frontend is a React 19+ application with Vite located in the `frontend` directory. The main components are:

- `src/components`: React components organized by feature and responsibility
- `src/hooks`: Custom React hooks for shared logic and state management
- `src/stores`: Zustand stores for global state management
- `src/services`: External API and WebSocket communication services
- `src/types`: TypeScript type definitions and interfaces
- `src/utils`: Utility functions and helper modules
- `src/routes`: TanStack Router route definitions

## Modern React 19+ Features

### Concurrent Features
React 19 introduces several performance improvements and new features that SenseCanvas leverages:

```typescript
// Automatic Batching - Multiple state updates are automatically batched
const handleSensorUpdate = (newData: SensorData) => {
  setSensorData(newData);        // These updates are automatically
  setLastUpdate(Date.now());     // batched together for better
  setConnectionStatus('active'); // performance
};

// useTransition for non-urgent updates
const [isPending, startTransition] = useTransition();

const handleLayoutChange = (newLayout: LayoutConfig) => {
  startTransition(() => {
    // Non-urgent layout updates don't block urgent sensor data updates
    setDashboardLayout(newLayout);
  });
};

// Improved Suspense for better loading states
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardGrid />
</Suspense>
```

## State Management Architecture

### Zustand Stores
SenseCanvas uses Zustand for lightweight, predictable state management:

```typescript
// stores/sensorStore.ts - Real-time sensor data
interface SensorState {
  data: SensorData;
  isConnected: boolean;
  lastUpdate: number;
  connectionError: string | null;
}

const useSensorStore = create<SensorState>((set, get) => ({
  data: {},
  isConnected: false,
  lastUpdate: 0,
  connectionError: null,
  
  // Actions
  updateSensorData: (data: SensorData) => 
    set({ data, lastUpdate: Date.now() }),
  
  setConnectionStatus: (isConnected: boolean) => 
    set({ isConnected, connectionError: isConnected ? null : get().connectionError }),
  
  setError: (error: string) => 
    set({ connectionError: error, isConnected: false }),
}));

// stores/layoutStore.ts - Widget layout persistence
const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      widgets: [],
      gridSize: 20,
      currentTheme: 'cyberpunk',
      
      addWidget: (widget: WidgetConfig) =>
        set(state => ({ widgets: [...state.widgets, widget] })),
      
      updateWidgetPosition: (id: string, position: Position) =>
        set(state => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, position } : w
          )
        })),
      
      exportLayout: () => JSON.stringify(get()),
      importLayout: (layoutJson: string) => set(JSON.parse(layoutJson)),
    }),
    { name: 'sensecanvas-layout' }
  )
);
```

### TanStack Query Integration
For server state management and real-time data synchronization:

```typescript
// hooks/useSensorData.ts
const useSensorData = () => {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensorData,
    refetchInterval: 1000,        // Real-time updates every second
    staleTime: 500,               // Data is fresh for 500ms
    gcTime: 30000,                // Garbage collect after 30s
    retry: 3,                     // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Optimistic updates for widget configuration
const useWidgetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWidgetConfig,
    onMutate: async (newConfig) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['widgets']);
      
      // Snapshot previous value
      const previousWidgets = queryClient.getQueryData(['widgets']);
      
      // Optimistically update
      queryClient.setQueryData(['widgets'], newConfig);
      
      return { previousWidgets };
    },
    onError: (err, newConfig, context) => {
      // Rollback on error
      queryClient.setQueryData(['widgets'], context?.previousWidgets);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['widgets']);
    },
  });
};
```

## Component Architecture

### Custom Hook Patterns
React 19+ emphasizes custom hooks for reusable logic:

```typescript
// hooks/useWebSocket.ts - WebSocket connection management
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed'>('closed');
  const sensorStore = useSensorStore();

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnectionState('open');
      sensorStore.setConnectionStatus(true);
    };
    
    ws.onmessage = (event) => {
      // React 19's automatic batching handles multiple updates efficiently
      const sensorData = JSON.parse(event.data);
      sensorStore.updateSensorData(sensorData);
    };
    
    ws.onclose = () => {
      setConnectionState('closed');
      sensorStore.setConnectionStatus(false);
      
      // Auto-reconnect with exponential backoff
      setTimeout(() => {
        if (connectionState !== 'open') {
          setSocket(new WebSocket(url));
        }
      }, 5000);
    };
    
    ws.onerror = (error) => {
      sensorStore.setError('WebSocket connection failed');
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [url]);

  return { socket, connectionState };
};

// hooks/useWidgetGrid.ts - Grid layout management
const useWidgetGrid = () => {
  const layoutStore = useLayoutStore();
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  
  const moveWidget = useCallback((id: string, position: Position) => {
    // Check for collisions
    const collision = checkWidgetCollision(position, layoutStore.widgets, id);
    
    if (!collision) {
      layoutStore.updateWidgetPosition(id, position);
    }
    
    return !collision;
  }, [layoutStore]);
  
  const resizeWidget = useCallback((id: string, size: Size) => {
    // Validate minimum size requirements
    const widget = layoutStore.widgets.find(w => w.id === id);
    if (widget && size.width >= widget.minSize.width && size.height >= widget.minSize.height) {
      layoutStore.updateWidgetSize(id, size);
    }
  }, [layoutStore]);
  
  return {
    widgets: layoutStore.widgets,
    draggedWidget,
    setDraggedWidget,
    moveWidget,
    resizeWidget,
    gridSize: layoutStore.gridSize,
  };
};
```

### Component Composition Patterns

```typescript
// components/dashboard/DashboardGrid.tsx
const DashboardGrid: React.FC = () => {
  const { widgets, moveWidget, resizeWidget } = useWidgetGrid();
  const { data: sensorData } = useSensorData();
  
  // TanStack Virtual for performance with many widgets
  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });
  
  return (
    <div className="dashboard-grid cosmic-grid" ref={parentRef}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const widget = widgets[virtualRow.index];
        
        return (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            sensorData={sensorData}
            onMove={moveWidget}
            onResize={resizeWidget}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// components/cosmic-ui/CosmicFrame.tsx
interface CosmicFrameProps {
  children: React.ReactNode;
  theme: CosmicTheme;
  glowEffect?: boolean;
  animated?: boolean;
  paths: SVGPath[];
}

const CosmicFrame: React.FC<CosmicFrameProps> = ({
  children,
  theme,
  glowEffect = false,
  animated = true,
  paths
}) => {
  const frameRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (frameRef.current && animated) {
      // Framer Motion integration for smooth animations
      const controls = animate(frameRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
      }, {
        duration: 0.3,
        ease: "easeOut"
      });
      
      return () => controls.stop();
    }
  }, [animated]);
  
  return (
    <div className={`cosmic-frame cosmic-theme-${theme.id}`}>
      <svg 
        ref={frameRef}
        className={`absolute inset-0 size-full ${glowEffect ? 'cosmic-glow' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <path
            key={index}
            d={path.d}
            stroke={path.stroke}
            fill={path.fill}
            strokeWidth={path.strokeWidth}
            className="transition-all duration-300"
          />
        ))}
      </svg>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```

## Performance Optimization

### React 19+ Optimizations
- **Automatic Batching**: Multiple state updates are automatically batched
- **Improved Hydration**: Faster initial page loads with progressive hydration
- **Concurrent Rendering**: Non-blocking updates for smooth user experience
- **Enhanced Memoization**: Better automatic optimization of component re-renders

### Custom Optimizations
```typescript
// Virtualized widget rendering for large dashboards
const VirtualizedWidgetGrid = () => {
  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 200, []),
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <WidgetContainer
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

## TypeScript Integration

### Advanced Type Patterns
```typescript
// Type-safe sensor path strings
type SensorPath = 
  | 'cpu.usage' 
  | 'cpu.temperature' 
  | 'gpu.usage' 
  | 'gpu.temperature'
  | 'memory.usage'
  | `fans.${string}`
  | `voltages.${string}`;

// Generic widget configuration with type inference
interface WidgetConfig<T extends WidgetType = WidgetType> {
  id: string;
  type: T;
  sensorPath: SensorPath;
  config: WidgetTypeConfigs[T];
  position: Position;
  size: Size;
}

// Type-safe theme configuration
interface CosmicTheme {
  id: 'cyberpunk' | 'neon' | 'gaming' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  effects: {
    glow: boolean;
    animation: boolean;
    scanlines: boolean;
  };
}
```

## Testing Patterns

### Component Testing with Vitest
```typescript
// __tests__/components/SensorGauge.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SensorGauge } from '../SensorGauge';

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

describe('SensorGauge', () => {
  it('renders sensor value with correct formatting', () => {
    render(
      <SensorGauge
        sensorPath="cpu.usage"
        theme={{ id: 'cyberpunk', colors: { primary: '#00ff88' } }}
        value={75}
      />,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByTestId('cosmic-gauge')).toHaveClass('cyberpunk-theme');
  });
});
```

This modern React 19+ architecture provides a solid foundation for building a high-performance, real-time sensor dashboard with excellent developer experience and maintainability.
