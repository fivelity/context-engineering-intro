<!--
SenseCanvas Global Layout
Global layout with CSS imports and theme configuration.
-->

<script lang="ts">
  import '../app.css';
  
  // Import Google Fonts for the sci-fi aesthetic
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Load Orbitron font for the sci-fi look
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0f172a" />
  
  <!-- Progressive Web App Meta Tags -->
  <meta name="application-name" content="SenseCanvas" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="SenseCanvas" />
  
  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
  
  <!-- Web App Manifest -->
  <link rel="manifest" href="/manifest.json" />
</svelte:head>

<main class="sensecanvas-app">
  <slot />
</main>

<style>
  :global(html) {
    height: 100%;
    background: #0f172a;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Orbitron', monospace;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    overflow-x: hidden;
  }
  
  .sensecanvas-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  /* Global scrollbar styling */
  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #1f2937;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #22d3ee;
    border-radius: 4px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #06b6d4;
  }
  
  /* Global focus styles for accessibility */
  :global(*:focus) {
    outline: 2px solid #22d3ee;
    outline-offset: 2px;
  }
  
  /* Global selection styles */
  :global(::selection) {
    background: #22d3ee;
    color: #0f172a;
  }
  
  /* Animation for loading states */
  :global(.loading-pulse) {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  /* Animation for connection status */
  :global(.connection-pulse) {
    animation: connection-pulse 3s ease-in-out infinite;
  }
  
  @keyframes connection-pulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
    }
  }
</style>