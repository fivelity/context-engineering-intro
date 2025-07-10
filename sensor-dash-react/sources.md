- name: Cosmic UI Documentation
  source: https://www.cosmic-ui.com/docs
  why: SVG-first sci-fi component library providing the primary design aesthetic for SenseCanvas React.
  use: Reference for creating futuristic UI components with customizable SVG frames and sci-fi styling, adapting React components for the dashboard.

- name: Cosmic UI Frame Component
  source: https://www.cosmic-ui.com/docs/frame
  why: Core component for creating customizable SVG frames for sensor widgets and dashboard panels.
  use: Adapt to React with TypeScript for creating sci-fi styled widget containers and UI elements.

- name: Cosmic UI Charts
  source: https://www.cosmic-ui.com/docs/chart
  why: Chart components with sci-fi aesthetic built on Chart.js for sensor data visualization.
  use: Reference for extending sensor gauges and charts to match Cosmic UI design language in React.

- name: React 19 Documentation
  source: https://react.dev/blog/2024/04/25/react-19
  why: Latest React version with concurrent features, automatic batching, and improved performance.
  use: Understand new React 19 features like automatic batching, improved hydration, and concurrent rendering for real-time sensor data.

- name: Vite 6 Configuration Guide
  source: https://vitejs.dev/guide/
  why: Modern build tool with lightning-fast HMR and optimized bundling for React applications.
  use: Configure Vite for React 19+ with TypeScript, TailwindCSS, and optimization for production builds.

- name: TanStack Router Documentation
  source: https://tanstack.com/router/latest
  why: Type-safe, modern routing library with automatic code splitting and excellent developer experience.
  use: Implement type-safe routing for dashboard pages with automatic preloading and search params management.

- name: TanStack Query Documentation
  source: https://tanstack.com/query/latest
  why: Powerful server state management with automatic caching, background updates, and real-time synchronization.
  use: Manage real-time sensor data with automatic caching, optimistic updates, and background refresh for seamless user experience.

- name: Zustand Documentation
  source: https://zustand-demo.pmnd.rs/
  why: Lightweight, modern state management with minimal boilerplate and excellent TypeScript support.
  use: Manage client-side state for dashboard layout, theme preferences, and widget configurations with simple, predictable updates.

- name: Framer Motion Documentation
  source: https://www.framer.com/motion/
  why: Production-ready motion library for smooth animations, layout transitions, and gesture handling.
  use: Implement smooth animations for widget movements, resize operations, and visual feedback during drag-and-drop interactions.

- name: React Hook Form Documentation
  source: https://react-hook-form.com/
  why: Performant forms library with minimal re-renders and excellent validation support.
  use: Handle widget configuration forms with efficient validation and minimal performance impact on real-time dashboard updates.

- name: TanStack Virtual Documentation
  source: https://tanstack.com/virtual/latest
  why: High-performance virtualization for rendering large lists and grids efficiently.
  use: Optimize dashboard performance when handling large numbers of widgets by virtualizing the widget grid.

- name: Zod Documentation
  source: https://zod.dev/
  why: TypeScript-first schema validation library for runtime type checking and form validation.
  use: Validate widget configurations, sensor data, and API responses with type-safe schemas and error handling.

- name: TailwindCSS with Vite Integration
  source: https://tailwindcss.com/docs/guides/vite
  why: Modern utility-first CSS framework integration with Vite for fast builds and optimized CSS.
  use: Configure TailwindCSS to work alongside Cosmic UI for layout, spacing, and responsive design.

- name: Detecting Classes in Source Files
  source: https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources
  why: Understanding how Tailwind CSS detects and includes classes from source files.
  use: Reference for configuring Tailwind CSS to correctly scan project files.

- name: Vite React Plugin
  source: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react
  why: Official Vite plugin for React with Fast Refresh and optimized builds.
  use: Configure Vite plugin for React 19+ with proper Fast Refresh and build optimizations.

- name: PyHardwareMonitor GitHub Repository
  source: https://github.com/snip3rnick/PyHardwareMonitor
  why: Repository for the Python wrapper, useful for integrating hardware data with React frontend.
  use: Add "PyHardwareMonitor" to `requirements.txt` for hardware monitoring capabilities.

- name: React Router vs TanStack Router Comparison
  source: https://tanstack.com/router/latest/docs/framework/react/guide/route-trees
  why: Understanding the advantages of TanStack Router over traditional React Router for type safety and performance.
  use: Make informed decision about routing architecture and implement type-safe navigation patterns.

- name: Google Genkit Framework
  source: https://genkit.dev/
  why: Provides insights into the AI-powered layout suggestions and generative UI features.
  use: Explore for implementing AI-driven UI generation and layout suggestions in React context.

- name: Genkit Integration
  source: https://firebase.google.com/products/genkit
  why: Specific patterns and best practices for integrating Genkit into modern web applications.
  use: Follow for integrating Genkit with React and implementing AI features for dashboard optimization.

- name: Chart.js with React Integration
  source: https://react-chartjs-2.js.org/
  why: Integration patterns for Chart.js with React for creating custom sensor visualizations.
  use: Implement Cosmic UI styled charts with Chart.js backend for sensor data visualization.

- name: FastAPI Streaming Response
  source: https://apidog.com/blog/fastapi-streaming-response/
  why: Patterns for implementing real-time sensor data streaming using FastAPI.
  use: Implement real-time data streaming from the backend using FastAPI for React consumption.

- name: WebSocket Implementation with React
  source: https://blog.logrocket.com/websockets-react-hooks/
  why: Modern patterns for implementing WebSocket connections in React with hooks and concurrent features.
  use: Set up real-time WebSocket connections for sensor data with proper cleanup and error handling.

- name: React 19 Concurrent Features Guide
  source: https://react.dev/reference/react/useTransition
  why: Understanding React 19's concurrent features like useTransition for non-blocking updates.
  use: Implement smooth user experience during heavy operations like layout changes and widget movements.

- name: TypeScript 5+ Advanced Types
  source: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
  why: Advanced TypeScript features for type-safe sensor data paths and widget configurations.
  use: Implement strongly-typed sensor path strings and widget configuration validation.

- name: Vitest Testing Framework
  source: https://vitest.dev/guide/
  why: Fast unit testing framework that works seamlessly with Vite and modern React patterns.
  use: Write comprehensive unit tests for React components, hooks, and utilities with excellent TypeScript support.

- name: Playwright React Testing
  source: https://playwright.dev/docs/test-components
  why: Modern E2E testing framework with excellent support for React component testing.
  use: Implement reliable end-to-end tests for dashboard functionality, real-time updates, and user interactions.

- name: MSW (Mock Service Worker)
  source: https://mswjs.io/docs/getting-started
  why: API mocking library for testing and development with excellent TypeScript support.
  use: Mock WebSocket connections and API responses during development and testing of real-time features.

- name: Notification API
  source: https://developer.mozilla.org/en-US/docs/Web/API/Notification
  why: Implementing browser notifications for hardware alerts and system events.
  use: Implement browser notifications for system alerts and user feedback in React context.

- name: React DevTools Profiler
  source: https://react.dev/reference/react/Profiler
  why: Performance monitoring and optimization tools for React applications.
  use: Profile dashboard performance, identify bottlenecks in real-time updates, and optimize widget rendering.

- name: CSS Container Queries
  source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries
  why: Modern CSS feature for responsive components that adapt to container size rather than viewport.
  use: Create responsive widgets that adapt to their container size for optimal layout in the dashboard grid.