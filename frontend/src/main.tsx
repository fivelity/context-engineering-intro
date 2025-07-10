/**
 * Main entry point for SenseCanvas React 19+ application
 * TanStack Router integration with React 19 features
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get the root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Create the React 19 root
const root = createRoot(container);

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}