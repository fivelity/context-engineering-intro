<!--
SenseCanvas Main Dashboard Page
Full dashboard implementation with real-time hardware monitoring
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { websocketStore } from '../lib/services/websocket.svelte.js';
  import { hardwareStore } from '../lib/stores/hardware.svelte.js';
  import { dashboardStore } from '../lib/stores/dashboard.svelte.js';
  import { themeStore } from '../lib/stores/theme.svelte.js';
  
  import Dashboard from '../lib/components/Dashboard.svelte';
  import ConnectionStatus from '../lib/components/ConnectionStatus.svelte';
  import ThemeSelector from '../lib/components/ui/ThemeSelector.svelte';
  import NotificationCenter from '../lib/components/ui/NotificationCenter.svelte';
  import LoadingSpinner from '../lib/components/common/LoadingSpinner.svelte';
  
  // ✅ Using Svelte 5 runes for page state
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let notificationCenter = $state<NotificationCenter>();
  
  // ✅ Derived states
  let isConnected = $derived(() => hardwareStore.isConnected);
  let hasData = $derived(() => hardwareStore.hasData);
  let pageTitle = $derived(() => {
    const widgetCount = dashboardStore.widgets.length;
    return `SenseCanvas - ${widgetCount} Widget${widgetCount !== 1 ? 's' : ''} Active`;
  });
  
  // Initialize dashboard
  onMount(() => {
    initialize();
    
    return () => {
      // Cleanup if needed
    };
  });
  
  async function initialize() {
    try {
      isLoading = true;
      error = null;
      
      // Initialize WebSocket connection
      await websocketStore.initialize();
      
      // Load saved dashboard configuration
      await dashboardStore.loadDashboard();
      
      // Initialize theme
      themeStore.initialize();
      
      // Show welcome notification
      if (notificationCenter) {
        notificationCenter.addNotification({
          type: 'success',
          title: 'Welcome to SenseCanvas',
          message: 'Real-time hardware monitoring is active',
          duration: 3000
        });
      }
      
      isLoading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to initialize dashboard';
      isLoading = false;
      
      if (notificationCenter) {
        notificationCenter.addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: error,
          duration: 0, // Don't auto-dismiss errors
          actions: [
            {
              label: 'Retry',
              action: () => initialize()
            }
          ]
        });
      }
    }
  }
  
  // Handle hardware alerts
  $effect(() => {
    if (!notificationCenter) return;
    
    const alerts = hardwareStore.alerts;
    const recentAlerts = alerts.filter(alert => 
      Date.now() - alert.timestamp < 5000 // Show alerts from last 5 seconds
    );
    
    recentAlerts.forEach(alert => {
      notificationCenter?.addNotification({
        type: alert.severity === 'critical' ? 'error' : 'warning',
        title: `${alert.sensorName || alert.sensor} Alert`,
        message: alert.message,
        duration: alert.severity === 'critical' ? 0 : 5000
      });
    });
  });
  
  // Handle connection state changes
  $effect(() => {
    if (!notificationCenter) return;
    
    const state = hardwareStore.connectionState;
    
    if (state === 'error' && hardwareStore.connectionError) {
      notificationCenter.addNotification({
        type: 'error',
        title: 'Connection Error',
        message: hardwareStore.connectionError,
        duration: 0,
        actions: [
          {
            label: 'Reconnect',
            action: () => websocketStore.reconnect()
          }
        ]
      });
    }
  });
  
  // Update page title
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.title = pageTitle();
    }
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content="Real-time PC hardware monitoring dashboard with customizable widgets" />
</svelte:head>

<div class="dashboard-page" data-theme={themeStore.currentTheme.id}>
  <!-- Header -->
  <header class="dashboard-header">
    <div class="header-left">
      <h1 class="dashboard-title">
        <span class="title-icon">🖥️</span>
        SenseCanvas
      </h1>
      <ConnectionStatus />
    </div>
    
    <div class="header-right">
      <ThemeSelector compact={false} showAutoSwitch={true} />
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="dashboard-main">
    {#if isLoading}
      <div class="loading-container">
        <LoadingSpinner size="xl" label="Initializing dashboard..." />
      </div>
    {:else if error}
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Dashboard Error</h2>
        <p class="error-message">{error}</p>
        <button 
          class="retry-button"
          onclick={initialize}
        >
          Retry Initialization
        </button>
      </div>
    {:else}
      <Dashboard />
    {/if}
  </main>
  
  <!-- Notification Center -->
  <NotificationCenter 
    bind:this={notificationCenter}
    position="top-right"
    maxNotifications={5}
  />
</div>

<style>
  .dashboard-page {
    @apply min-h-screen bg-background text-text;
    @apply flex flex-col;
  }
  
  .dashboard-header {
    @apply flex items-center justify-between;
    @apply px-6 py-4;
    @apply bg-surface border-b border-border;
    @apply shadow-sm;
  }
  
  .header-left {
    @apply flex items-center gap-6;
  }
  
  .dashboard-title {
    @apply flex items-center gap-2;
    @apply text-2xl font-bold;
    @apply text-primary;
  }
  
  .title-icon {
    @apply text-3xl;
  }
  
  .header-right {
    @apply flex items-center gap-4;
  }
  
  .dashboard-main {
    @apply flex-1;
    @apply relative;
    @apply overflow-hidden;
  }
  
  .loading-container {
    @apply absolute inset-0;
    @apply flex items-center justify-center;
    @apply bg-background/80 backdrop-blur-sm;
  }
  
  .error-container {
    @apply absolute inset-0;
    @apply flex flex-col items-center justify-center;
    @apply p-8 text-center;
  }
  
  .error-icon {
    @apply text-6xl mb-4;
  }
  
  .error-title {
    @apply text-2xl font-bold text-error mb-2;
  }
  
  .error-message {
    @apply text-text-secondary mb-6;
    @apply max-w-md;
  }
  
  .retry-button {
    @apply px-6 py-3 rounded-lg;
    @apply bg-primary text-background font-medium;
    @apply hover:bg-primary/90 transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
  }
  
  /* Theme-aware responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-header {
      @apply px-4 py-3;
      @apply flex-col gap-3;
    }
    
    .header-left,
    .header-right {
      @apply w-full justify-between;
    }
    
    .dashboard-title {
      @apply text-xl;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .dashboard-page {
      @apply border-2 border-text;
    }
    
    .dashboard-header {
      @apply border-b-2;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>