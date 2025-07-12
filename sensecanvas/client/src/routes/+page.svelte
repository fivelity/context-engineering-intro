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
    min-height: 100vh;
    background-color: var(--color-background);
    color: var(--color-text);
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .dashboard-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
  }
  
  .title-icon {
    font-size: 1.875rem;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .dashboard-main {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  
  .loading-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(var(--color-background), 0.8);
    backdrop-filter: blur(4px);
  }
  
  .error-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  
  .error-icon {
    font-size: 3.75rem;
    margin-bottom: 1rem;
  }
  
  .error-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-error);
    margin-bottom: 0.5rem;
  }
  
  .error-message {
    color: var(--color-textSecondary);
    margin-bottom: 1.5rem;
    max-width: 28rem;
  }
  
  .retry-button {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-primary);
    color: var(--color-background);
    font-weight: 500;
    transition: background-color 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .retry-button:hover {
    background-color: rgba(var(--color-primary), 0.9);
  }

  .retry-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
  
  /* Theme-aware responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-header {
      padding: 0.75rem 1rem;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .header-left,
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
    
    .dashboard-title {
      font-size: 1.25rem;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .dashboard-page {
      border: 2px solid var(--color-text);
    }
    
    .dashboard-header {
      border-bottom-width: 2px;
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