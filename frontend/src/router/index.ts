/**
 * TanStack Router configuration for SenseCanvas
 * Type-safe routing with automatic code splitting
 */

import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import React, { lazy } from 'react';

// Lazy load components for automatic code splitting
const Dashboard = lazy(() => import('@components/Dashboard'));
const Settings = lazy(() => import('@components/Settings'));
const WidgetLibrary = lazy(() => import('@components/WidgetLibrary'));
const Analytics = lazy(() => import('@components/Analytics'));
const Help = lazy(() => import('@components/Help'));

// Root route component with layout
const RootComponent = lazy(() => import('@components/RootLayout'));

// Create the root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Dashboard route (main application)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
  loader: async () => {
    // Pre-load critical data for dashboard
    return {
      timestamp: Date.now(),
      preloadedData: null
    };
  },
});

// Settings route with nested routes
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const settingsGeneralRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/general',
  component: lazy(() => import('@components/settings/GeneralSettings')),
});

const settingsThemeRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/theme',
  component: lazy(() => import('@components/settings/ThemeSettings')),
});

const settingsConnectionRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/connection',
  component: lazy(() => import('@components/settings/ConnectionSettings')),
});

const settingsWidgetsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/widgets',
  component: lazy(() => import('@components/settings/WidgetSettings')),
});

// Widget library route
const widgetLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/widgets',
  component: WidgetLibrary,
});

// Widget detail route with dynamic ID
const widgetDetailRoute = createRoute({
  getParentRoute: () => widgetLibraryRoute,
  path: '/$widgetId',
  component: lazy(() => import('@components/WidgetDetail')),
  loader: async ({ params }) => {
    // Load widget data based on ID
    return {
      widgetId: params.widgetId,
      timestamp: Date.now()
    };
  },
});

// Analytics route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: Analytics,
});

// Help documentation route
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: Help,
});

const helpTopicRoute = createRoute({
  getParentRoute: () => helpRoute,
  path: '/$topic',
  component: lazy(() => import('@components/help/HelpTopic')),
  loader: async ({ params }) => {
    return {
      topic: params.topic,
      timestamp: Date.now()
    };
  },
});

// API testing route (development only)
const apiTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/api-test',
  component: lazy(() => import('@components/ApiTest')),
  beforeLoad: async () => {
    // Only allow in development
    if (import.meta.env.PROD) {
      throw redirect({ to: '/' });
    }
  },
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  settingsRoute.addChildren([
    settingsGeneralRoute,
    settingsThemeRoute,
    settingsConnectionRoute,
    settingsWidgetsRoute,
  ]),
  widgetLibraryRoute.addChildren([
    widgetDetailRoute,
  ]),
  analyticsRoute,
  helpRoute.addChildren([
    helpTopicRoute,
  ]),
  ...(import.meta.env.DEV ? [apiTestRoute] : []),
]);

// Default component definitions
const LoadingComponent = () => {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'var(--sci-fi-text)',
      fontSize: '14px',
      fontWeight: 500
    }
  }, [
    React.createElement('div', {
      key: 'spinner',
      style: {
        width: '20px',
        height: '20px',
        border: '2px solid var(--sci-fi-primary)',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }
    }),
    'Loading...'
  ]);
};

const ErrorComponent = ({ error }: { error: Error }) => {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'var(--sci-fi-surface)',
      border: '1px solid var(--sci-fi-danger)',
      borderRadius: 'var(--sci-fi-border-radius)',
      color: 'var(--sci-fi-text)',
      textAlign: 'center',
      maxWidth: '400px'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: { margin: '0 0 12px', color: 'var(--sci-fi-danger)' }
    }, 'Navigation Error'),
    React.createElement('p', {
      key: 'message',
      style: { margin: '0 0 16px', fontSize: '14px' }
    }, error.message || 'An error occurred while navigating.'),
    React.createElement('button', {
      key: 'button',
      onClick: () => window.location.href = '/',
      style: {
        padding: '8px 16px',
        backgroundColor: 'var(--sci-fi-primary)',
        border: 'none',
        borderRadius: 'var(--sci-fi-border-radius)',
        color: 'var(--sci-fi-text)',
        cursor: 'pointer'
      }
    }, 'Go to Dashboard')
  ]);
};

const NotFoundComponent = () => {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: 'var(--sci-fi-text)'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { 
        fontSize: '72px', 
        margin: '0 0 16px',
        color: 'var(--sci-fi-primary)'
      }
    }, '404'),
    React.createElement('h2', {
      key: 'subtitle',
      style: { margin: '0 0 8px' }
    }, 'Page Not Found'),
    React.createElement('p', {
      key: 'description',
      style: { 
        margin: '0 0 20px', 
        color: 'var(--sci-fi-text-secondary)',
        fontSize: '14px'
      }
    }, 'The requested page could not be found.'),
    React.createElement('button', {
      key: 'button',
      onClick: () => window.location.href = '/',
      style: {
        padding: '12px 24px',
        backgroundColor: 'var(--sci-fi-primary)',
        border: 'none',
        borderRadius: 'var(--sci-fi-border-radius)',
        color: 'var(--sci-fi-text)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, 'Return to Dashboard')
  ]);
};

// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // Preload on hover/focus
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: LoadingComponent,
  defaultErrorComponent: ErrorComponent,
  defaultNotFoundComponent: NotFoundComponent,
});

// Declare the router instance for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;