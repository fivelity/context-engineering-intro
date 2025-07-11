### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use venv_linux** (the virtual environment) whenever executing Python commands, including for unit tests.
- **For SenseCanvas project**: Always reference `sensor-dash-react/` for comprehensive React 19+ specifications and architecture details.

### 🎯 SenseCanvas React 19+ Sensor Dashboard Specific Rules

#### **Cosmic UI Integration (Primary Design System)**
- **Always use SVG-first approach**: Follow Cosmic UI's philosophy of building components with customizable SVG shapes and frames
- **Extend Cosmic UI for React**: Create custom sensor gauges and charts using Cosmic UI's design language adapted for React
- **Frame components**: Leverage Cosmic UI Frame components for widget containers and dashboard panels
- **Color system**: Use Cosmic UI's sci-fi color palette as the foundation with CSS custom properties
- **Sci-fi aesthetic**: Implement futuristic styling with neon glows, sharp angles, holographic effects, and scanning animations

#### Frontend (React 19+ + Vite 6 + TanStack Ecosystem)
- **Use React 19 concurrent features**: Leverage automatic batching, useTransition for non-urgent updates, improved hydration
- **TanStack ecosystem integration**: 
  - **TanStack Router** for type-safe routing with automatic code splitting
  - **TanStack Query** for server state management with real-time data synchronization
  - **TanStack Virtual** for high-performance widget grid virtualization
- **Zustand for client state**: Lightweight state management with persistence middleware for layout and widget configurations
- **Custom hook patterns**: Extract reusable logic into hooks (useSensorData, useWebSocket, useWidgetGrid, useDragAndDrop)
- **Framer Motion**: Use for smooth animations, drag/drop interactions, and layout transitions
- **Component structure**: Follow React best practices with `src/components/`, `src/hooks/`, `src/stores/`, `src/services/`
- **TypeScript first**: All components must have proper TypeScript interfaces and strict type safety

#### Backend (FastAPI + PyHardwareMonitor)
- **Hardware monitoring**: Use PyHardwareMonitor wrapper for LibreHardwareMonitorLib.dll integration. package name: 'HardwareMonitor==1.0.0' (@requirements.txt)
- **Admin privileges**: Handle cases where admin rights are required for detailed sensor access
- **WebSocket streaming**: Implement real-time sensor data streaming optimized for React 19's concurrent features
- **Cross-platform fallback**: Use psutil when LibreHardwareMonitor is unavailable (non-Windows)
- **Data format**: Follow LibreHardwareMonitor sensor type mappings (Temperature, Load, Fan, Voltage, Clock)

#### Real-time & Performance
- **React 19 automatic batching**: Multiple sensor updates automatically batched for better performance
- **TanStack Query caching**: Configure proper cache times and stale times for real-time data
- **TanStack Virtual optimization**: Use for handling large widget grids efficiently
- **WebSocket lifecycle**: Proper connection management with cleanup in useEffect
- **Memory management**: Always clean up WebSocket connections and prevent memory leaks
- **Performance monitoring**: Ensure smooth operation with multiple concurrent widgets

#### AI Integration (Google Genkit)
- **Context-aware prompts**: Generate intelligent suggestions based on React state and dashboard/widget context
- **Error handling**: Fallback gracefully when AI services are unavailable
- **Privacy**: Never send sensitive system information to AI models
- **React integration**: AI features should seamlessly integrate with React state management

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For SenseCanvas React this looks like:
    - Frontend: `components/`, `hooks/`, `stores/`, `services/`, `types/`, `routes/`
    - Backend: `api/`, `services/`, `models/`, `core/`
    - Widget system: Individual widget components with shared base patterns and Cosmic UI integration
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.
- **Separate concerns**: UI components, business logic, data access, and real-time communication

### 📦 Dependencies & Libraries
- **Frontend**: React 19+, Vite 6, TanStack Router/Query/Virtual, Zustand, Framer Motion, Cosmic UI, TailwindCSS, React Hook Form, Zod
- **Backend**: FastAPI, PyHardwareMonitor, WebSockets, Pydantic, psutil (fallback)
- **AI**: Google Genkit for layout suggestions (optional feature)
- **Testing**: Vitest for unit tests, Playwright for E2E testing, MSW for API mocking
- **Never downgrade dependencies** - troubleshoot compatibility issues instead

### 🧪 Testing & Reliability
- **Always create tests for new features** (React components, custom hooks, Zustand stores, API endpoints)
- **After updating any logic**, check whether existing tests need updates
- **Test structure for SenseCanvas React**:
  - Frontend: `/tests` for component and hook tests using Vitest
  - Backend: `/tests` for API and sensor integration tests
  - E2E: `/tests/e2e` for full dashboard workflows with Playwright
- **Test real-time features**: Mock WebSocket connections and sensor data with MSW
- **Test React 19 features**: Verify automatic batching, concurrent rendering, and performance

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.
- **Validate React dashboard features**: Test real-time updates, widget interactions, drag/drop, and layout persistence

### 📎 Style & Conventions

#### Frontend Style (React 19+ + TypeScript)
- **Use TypeScript** with strict type checking enabled
- **Follow React 19+ patterns**: Custom hooks, proper useEffect cleanup, automatic batching awareness
- **Zustand best practices**: Use persistence middleware, avoid unnecessary re-renders
- **TanStack Query patterns**: Proper cache management, optimistic updates, background refetching
- **CSS**: TailwindCSS with Cosmic UI integration, CSS custom properties for themes
- **Component props**: Use proper TypeScript interfaces, React.memo for expensive components
- **File naming**: PascalCase for components, camelCase for utilities, kebab-case for routes

#### Backend Style
- **Use Python** as the primary backend language
- **Follow PEP8**, use type hints, and format with `black`
- **Use `pydantic` for data validation** especially for sensor data models
- **Use `FastAPI` for APIs** with automatic OpenAPI documentation
- **WebSocket patterns**: Proper connection lifecycle management optimized for React clients
- **Error handling**: Structured error responses with appropriate HTTP status codes

#### Documentation Style
- **Docstrings for every function** using the Google style
- **TypeScript interfaces**: Document all widget configurations and sensor data types
- **Component documentation**: Explain props, hooks usage, and integration patterns
- **API documentation**: FastAPI automatic docs with detailed examples

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified
- **Comment non-obvious code** especially hardware sensor mappings, React 19 patterns, and real-time data flows
- **Widget configurations**: Document all customization options and Cosmic UI theming
- **Sensor data formats**: Clearly document PyHardwareMonitor data structures and mappings
- **When writing complex logic**, **add an inline `// Reason:` comment** explaining the why

### 🔐 Security & Privacy
- **Never log sensitive sensor data** beyond what's necessary for debugging
- **Validate all user inputs** especially widget configurations and layout imports using Zod schemas
- **WebSocket security**: Implement proper origin checking and rate limiting
- **AI integration**: Never send personally identifiable information to external AI services
- **React error boundaries**: Prevent widget crashes from affecting the entire dashboard
- **Local storage**: Encrypt sensitive configuration data when persisting with Zustand

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages from the React ecosystem
- **Always confirm file paths and module names** exist before referencing them
- **Never delete or overwrite existing code** unless explicitly instructed
- **For hardware monitoring**: Be aware that some features require Windows and admin privileges
- **Real-time features**: Always implement proper cleanup in useEffect for WebSocket connections
- **Widget system**: Ensure all widgets follow consistent interfaces and Cosmic UI theming patterns
- **Performance consciousness**: Consider the impact of real-time updates and use TanStack Virtual for large grids
- **React 19+ awareness**: Leverage automatic batching, concurrent features, and improved performance patterns