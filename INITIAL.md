# SenseCanvas: React 19+ PC Sensor Dashboard with AI Layout Suggestions

## FEATURE:

Build **SenseCanvas**, a hyper-customizable real-time PC hardware monitoring dashboard using **React 19+**, **Vite 6**, **TanStack ecosystem**, and **Google Genkit** for AI-powered layout suggestions. The application should provide comprehensive system monitoring with a futuristic **Cosmic UI** sci-fi aesthetic that appeals to PC enthusiasts and professionals.

### Core Functionality:
- **Real-time sensor monitoring**: CPU, GPU, RAM, storage, fans, voltages, and motherboard sensors with React 19's concurrent features
- **Dynamic widget grid**: Fully draggable and resizable widgets with grid snapping, collision detection, and TanStack Virtual for performance
- **AI-powered layout suggestions**: Intelligent widget arrangement using Google Genkit based on usage patterns and dashboard state
- **Extensive customization**: Deep widget configuration with Cosmic UI themes, colors, alerts, and visual effects
- **Layout management**: Save, load, import/export dashboard layouts with preset configurations using Zustand persistence
- **Alert system**: Desktop notifications for threshold breaches with configurable conditions
- **Futuristic UI**: Cosmic UI design system with SVG-first sci-fi components, customizable frames, and neon glows
- **Cross-platform support**: Windows with PyHardwareMonitor, fallback to psutil for other platforms

### Technical Requirements:
- **Frontend**: React 19+ with Vite 6, automatic batching, concurrent features, and improved hydration
- **Routing**: TanStack Router for type-safe routing with automatic code splitting and preloading
- **State Management**: 
  - **Server State**: TanStack Query for real-time data synchronization, caching, and optimistic updates
  - **Client State**: Zustand for lightweight state management with persistence
- **Backend**: FastAPI with PyHardwareMonitor for hardware data collection
- **Real-time communication**: WebSocket streaming with auto-reconnection optimized for React 19
- **UI Framework**: Cosmic UI (SVG-first sci-fi design system) + TailwindCSS for layout and spacing
- **Charts/Gauges**: Custom Cosmic UI extensions for sensor gauges and Chart.js integration for graphs
- **Drag & Drop**: Framer Motion for animations and gesture handling in widget interactions
- **Performance**: TanStack Virtual for high-performance widget grid virtualization
- **Forms**: React Hook Form + Zod for widget configuration with type-safe validation
- **AI Integration**: Google Genkit for layout suggestion generation
- **Testing**: Vitest for unit tests (Vite native), Playwright for E2E testing

### Widget Types:
1. **Cosmic Gauge Widgets**: Futuristic circular/arc gauges with SVG frames, neon glows, and sci-fi styling
2. **Graph Widgets**: Real-time line/area charts with Cosmic UI aesthetic for historical sensor data
3. **Simple Widgets**: Clean single-value displays with Cosmic UI typography and holographic effects
4. **Meter Widgets**: Horizontal progress bars with gradient fills, thresholds, and sci-fi frames
5. **Multi-Resource Widgets**: Aggregate views showing multiple related sensors with tabbed Cosmic UI layouts

### React 19+ Performance Requirements:
- Smooth operation with 10+ concurrent real-time widgets using automatic batching
- Default 1-second sensor polling with configurable refresh rates
- TanStack Virtual for handling large widget grids efficiently
- Proper memory management and WebSocket cleanup with React 19's improved lifecycle
- Responsive design supporting various screen sizes with Cosmic UI's adaptive components
- Concurrent rendering for non-blocking UI updates during heavy operations

## EXAMPLES:

Reference these example files and adapt them to React 19+ patterns:

### Core Component Patterns (Convert from Svelte to React 19+):
- `examples/CosmicSensorGauge.tsx` - **ALREADY CONVERTED** - React implementation of Cosmic UI sensor gauge
- `examples/DashboardGrid.svelte` → Convert to React with TanStack Virtual and CSS Grid
- `examples/DraggableWidget.svelte` → Convert to React with Framer Motion for drag/drop
- `examples/ArcMeter.svelte` → Convert to React with Cosmic UI Frame components
- `examples/layoutStore.ts` → Convert to Zustand store with persistence middleware
- `examples/ThemeConfig.js` → Convert to React hook with Cosmic UI theme management

### React 19+ Implementation Patterns:
1. **Modern Hook Patterns**: Custom hooks for sensor data, WebSocket connections, grid management
2. **TanStack Query Integration**: Real-time data synchronization with automatic caching and background updates
3. **Zustand State Management**: Lightweight stores for layout, theme, and widget configurations
4. **Cosmic UI Integration**: SVG-first components with customizable frames and sci-fi styling
5. **TanStack Virtual Performance**: Virtualized widget grids for handling large numbers of widgets
6. **React 19 Concurrent Features**: Automatic batching, useTransition for non-urgent updates
7. **Framer Motion Animations**: Smooth layout transitions and gesture handling for widget interactions

### File Structure to Create:
```
frontend/
├── src/
│   ├── components/
│   │   ├── cosmic-ui/           # Cosmic UI adaptations
│   │   ├── dashboard/           # Dashboard components
│   │   ├── widgets/             # Widget implementations
│   │   └── common/              # Shared components
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   ├── services/                # API and WebSocket services
│   ├── types/                   # TypeScript definitions
│   └── routes/                  # TanStack Router routes
```

## DOCUMENTATION:

### Critical React 19+ Library Documentation:
- **React 19**: https://react.dev/blog/2024/04/25/react-19 - Concurrent features, automatic batching, improved hydration
- **Vite 6**: https://vitejs.dev/guide/ - Next-generation build tool with lightning-fast HMR
- **TanStack Router**: https://tanstack.com/router/latest - Type-safe routing with automatic code splitting
- **TanStack Query**: https://tanstack.com/query/latest - Server state management for real-time data
- **TanStack Virtual**: https://tanstack.com/virtual/latest - High-performance virtualization for widget grids
- **Zustand**: https://zustand-demo.pmnd.rs/ - Lightweight state management with persistence
- **Framer Motion**: https://www.framer.com/motion/ - Production-ready motion library for animations
- **React Hook Form**: https://react-hook-form.com/ - Performant forms with minimal re-renders
- **Cosmic UI**: https://www.cosmic-ui.com/docs - SVG-first sci-fi component library
- **Cosmic UI Frame**: https://www.cosmic-ui.com/docs/frame - Customizable SVG frames for widgets
- **Google Genkit**: https://genkit.dev/ - AI framework for layout suggestions
- **Zod**: https://zod.dev/ - TypeScript-first schema validation
- **PyHardwareMonitor**: https://github.com/snip3rnick/PyHardwareMonitor - Python hardware monitoring
- **FastAPI WebSockets**: https://fastapi.tiangolo.com/advanced/websockets/ - Real-time communication
- **Vitest**: https://vitest.dev/guide/ - Fast unit testing with Vite integration
- **Playwright**: https://playwright.dev/docs/test-components - E2E testing for React

### Project Architecture Reference:
See `sensor-dash-react/` for comprehensive React 19+ specifications:
- `README.md` - Complete React 19+ project overview with Cosmic UI integration
- `project_architecture.md` - Modern React architecture with TanStack ecosystem
- `frontend_guide.md` - React 19+ patterns, hooks, and component architecture
- `api_reference.md` - Backend API and WebSocket message formats
- `gauges_and_widgets.md` - Cosmic UI widget library and sensor gauge specifications
- `dashboard_edit_mode.md` - Edit mode functionality and user interactions
- `sensecanvas-dashboard.md` - **COMPREHENSIVE PRP** with complete implementation blueprint

### Hardware Integration:
- **LibreHardwareMonitorLib**: Underlying .NET library for Windows sensor access
- **PyHardwareMonitor**: Python wrapper providing JSON-serializable sensor data
- **Sensor Types**: Temperature, Load, Fan, Voltage, Clock, Data, Control
- **Hardware Types**: Cpu, GpuNvidia, GpuAmd, Memory, Motherboard, Storage

## OTHER CONSIDERATIONS:

### Critical React 19+ Implementation Details:

#### Modern React Architecture:
- **React 19 Concurrent Features**: Leverage automatic batching for multiple state updates, useTransition for non-urgent updates
- **TanStack Ecosystem Integration**: Use TanStack Router for routing, TanStack Query for server state, TanStack Virtual for performance
- **Zustand Best Practices**: Lightweight client state management with persistence middleware for layout and widget configurations
- **Custom Hook Patterns**: Extract reusable logic into custom hooks (useSensorData, useWebSocket, useWidgetGrid, useDragAndDrop)
- **Performance Optimization**: Use TanStack Virtual for large widget grids, React.memo for expensive components, proper dependency arrays

#### Cosmic UI Integration:
- **SVG-First Approach**: Build all widgets using Cosmic UI's customizable SVG frame system
- **Sci-Fi Aesthetic**: Implement futuristic gaming dashboard with neon glows, sharp angles, and holographic effects
- **Theme System**: Multiple sci-fi color schemes (Cyberpunk, Neon, Gaming, Corporate, Matrix) with CSS custom properties
- **Custom Components**: Extend Cosmic UI with sensor-specific gauges and monitoring widgets
- **Responsive Design**: Adaptive layouts that work with Cosmic UI's frame system

#### Real-time Architecture with React 19:
- **WebSocket Lifecycle**: Proper connection management with auto-reconnection using React 19's improved cleanup
- **Automatic Batching**: Multiple sensor updates automatically batched for better performance
- **TanStack Query Integration**: Real-time data synchronization with background updates and optimistic mutations
- **Memory Management**: Clean up connections in useEffect cleanup functions
- **Performance**: Optimize for multiple concurrent real-time widgets with TanStack Virtual
- **Data Validation**: Use Zod schemas for all sensor data and widget configurations

#### Widget System Design:
- **Consistent Interfaces**: All widgets implement standard configuration schema with TypeScript interfaces
- **Framer Motion Integration**: Smooth animations for drag/drop, resize operations, and layout transitions
- **Grid System**: Precise positioning with collision detection using CSS Grid and TanStack Virtual
- **Persistent State**: Zustand stores with persistence middleware for widget positions and configurations
- **Cosmic UI Theming**: All widgets support theme switching with Cosmic UI's color system
- **Responsive Components**: Widgets adapt to container size using CSS container queries

#### AI Integration with React:
- **Context-Aware Prompts**: Generate intelligent suggestions based on current dashboard state using React context
- **Google Genkit Integration**: AI layout suggestions with proper error handling and fallback
- **Privacy First**: Never send sensitive system information to external AI services
- **React Integration**: AI suggestions seamlessly integrate with React state management

#### Performance & Development:
- **Vite 6 Configuration**: Optimize build for React 19+ with proper code splitting and tree shaking
- **Testing Strategy**: Vitest for unit tests, Playwright for E2E, MSW for API mocking
- **TypeScript Integration**: Strict type checking with advanced TypeScript patterns for sensor paths
- **Development Experience**: Hot module replacement with React Fast Refresh for instant feedback

#### Security & Error Handling:
- **Input Validation**: Zod schemas for all user inputs and widget configurations
- **Error Boundaries**: React error boundaries to prevent widget crashes from affecting entire dashboard
- **WebSocket Security**: Proper origin checking and rate limiting for real-time connections
- **Graceful Degradation**: Fallback strategies when hardware sensors or AI services are unavailable

#### Common React 19+ Pitfalls to Avoid:
- **useEffect Dependency Arrays**: Ensure proper dependencies to avoid infinite re-renders
- **WebSocket Cleanup**: Always clean up WebSocket connections in useEffect cleanup
- **State Management**: Don't mix Zustand and React state unnecessarily - use appropriate tool for each case
- **Performance**: Avoid creating new objects/functions in render - use useMemo/useCallback appropriately
- **TanStack Query**: Properly configure cache times and stale times for real-time data
- **Framer Motion**: Use layout animations efficiently to avoid performance issues

### Design Aesthetic & Themes:
- **Primary Design System**: **Cosmic UI** - SVG-first sci-fi component library with customizable frames and futuristic styling
- **Visual Style**: Futuristic gaming dashboard with holographic effects, neon glows, and sharp geometric shapes
- **Color Schemes**: Multiple sci-fi themes with CSS custom properties:
  - **Cyberpunk**: Purple/magenta with gold accents (`#7c3aed`, `#fbbf24`)
  - **Neon**: Bright cyan with orange highlights (`#00ffff`, `#ff8c00`)
  - **Gaming**: Electric green with blue accents (`#00ff88`, `#0ea5e9`)
  - **Corporate**: Clean blue with silver (`#3b82f6`, `#64748b`)
  - **Matrix**: Classic green with black (`#00ff00`, `#000000`)
- **Component Style**: SVG-based frames, scanning effects, particle systems, depth layering
- **Interactive Elements**: Glow effects on hover, pulse animations for alerts, smooth transitions
- **Typography**: Monospace fonts (Orbitron, JetBrains Mono) for technical aesthetic
