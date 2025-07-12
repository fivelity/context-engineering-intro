<!--
SenseCanvas Main Dashboard Component
Main dashboard layout with connection status and hardware metrics using Svelte 5 runes.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import ConnectionStatus from './ConnectionStatus.svelte';
  import HardwareMetrics from './HardwareMetrics.svelte';
  import { hardwareStore } from '../stores/hardware.svelte.js';
  import { websocketStore } from '../services/websocket.svelte.js';

  // ✅ Using Svelte 5 runes for component state
  let isFullscreen = $state(false);
  let showSettings = $state(false);
  let autoRefresh = $state(true);
  let refreshInterval = $state(1000);

  // ✅ Derived values for dashboard state
  let dashboardTitle = $derived(() => {
    const clientId = hardwareStore.clientId;
    return clientId ? `SenseCanvas - ${clientId}` : 'SenseCanvas Dashboard';
  });

  let systemHealth = $derived(() => {
    const health = hardwareStore.connectionHealth;
    const alerts = hardwareStore.criticalAlerts.length;
    
    if (health === 'error' || alerts > 3) return 'critical';
    if (health === 'stale' || alerts > 0) return 'warning';
    if (health === 'healthy') return 'good';
    return 'unknown';
  });

  let healthColor = $derived(() => {
    switch (systemHealth()) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  });

  let uptimeDisplay = $derived(() => {
    const uptime = hardwareStore.system?.uptime;
    if (!uptime) return 'Unknown';
    
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  });

  // ✅ Using $effect for side effects with cleanup
  $effect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh && hardwareStore.isConnected) {
      interval = setInterval(() => {
        websocketStore.service.getCurrentMetrics();
      }, refreshInterval);
    }

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  });

  // ✅ Document title effect
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.title = dashboardTitle();
    }
  });

  // ✅ Fullscreen effect
  $effect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    isFullscreen = false;
  }

  function handleRefreshSettings() {
    websocketStore.service.getCurrentMetrics();
    websocketStore.service.getHardwareStatus();
  }

  function handleResetConnection() {
    websocketStore.service.reconnect();
  }

  function handleClearAlerts() {
    hardwareStore.clearAlerts();
  }

  // ✅ Mount effect for initialization
  onMount(() => {
    // Request initial data if connected
    if (websocketStore.connected) {
      websocketStore.service.getCurrentMetrics();
      websocketStore.service.getHardwareStatus();
    }
  });
</script>

<svelte:head>
  <title>{dashboardTitle()}</title>
</svelte:head>

<div class="dashboard" class:fullscreen={isFullscreen}>
  <!-- Dashboard Header -->
  <header class="dashboard-header">
    <div class="header-left">
      <h1 class="dashboard-title">SenseCanvas</h1>
      <div class="system-health">
        <span class="health-indicator {healthColor()}">●</span>
        <span class="health-text">System {systemHealth().toUpperCase()}</span>
      </div>
    </div>

    <div class="header-center">
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">Uptime:</span>
          <span class="info-value">{uptimeDisplay}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Alerts:</span>
          <span class="info-value {hardwareStore.criticalAlerts.length > 0 ? 'text-red-400' : 'text-green-400'}">
            {hardwareStore.alerts.length}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Max Temp:</span>
          <span class="info-value {hardwareStore.highestTemperature > 80 ? 'text-red-400' : 'text-green-400'}">
            {hardwareStore.highestTemperature.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <div class="header-actions">
        <button 
          class="action-btn"
          onclick={handleRefreshSettings}
          disabled={!websocketStore.connected}
          title="Refresh Data"
        >
          🔄
        </button>

        <button 
          class="action-btn"
          onclick={() => showSettings = !showSettings}
          title="Settings"
        >
          ⚙️
        </button>

        <button 
          class="action-btn"
          onclick={toggleFullscreen}
          title="Toggle Fullscreen (F11)"
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>
    </div>
  </header>

  <!-- Settings Panel -->
  {#if showSettings}
    <div class="settings-panel">
      <div class="settings-header">
        <h3>Dashboard Settings</h3>
        <button onclick={() => showSettings = false} class="close-btn">×</button>
      </div>
      
      <div class="settings-content">
        <div class="setting-group">
          <label class="setting-label">
            <input 
              type="checkbox" 
              bind:checked={autoRefresh}
              class="setting-checkbox"
            />
            Auto Refresh
          </label>
          
          {#if autoRefresh}
            <div class="setting-item">
              <label for="refresh-interval">Refresh Interval (ms):</label>
              <input 
                id="refresh-interval"
                type="number" 
                bind:value={refreshInterval}
                min="500"
                max="10000"
                step="500"
                class="setting-input"
              />
            </div>
          {/if}
        </div>

        <div class="setting-group">
          <h4>Connection</h4>
          <div class="setting-actions">
            <button onclick={handleResetConnection} class="setting-btn">
              Reset Connection
            </button>
            <button onclick={handleClearAlerts} class="setting-btn">
              Clear Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <main class="dashboard-main">
    <!-- Connection Status -->
    <section class="status-section">
      <ConnectionStatus />
    </section>

    <!-- Hardware Metrics -->
    <section class="metrics-section">
      <HardwareMetrics />
    </section>
  </main>

  <!-- Dashboard Footer -->
  <footer class="dashboard-footer">
    <div class="footer-left">
      <span class="footer-text">SenseCanvas v1.0.0</span>
      <span class="footer-separator">|</span>
      <span class="footer-text">
        {hardwareStore.isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>

    <div class="footer-right">
      <span class="footer-text">
        Last Update: {new Date(hardwareStore.lastUpdateTime).toLocaleTimeString()}
      </span>
    </div>
  </footer>
</div>

<style>
  .dashboard {
    @apply min-h-screen bg-gray-950 text-white flex flex-col;
    font-family: 'Orbitron', monospace;
  }

  .dashboard.fullscreen {
    @apply fixed inset-0 z-50;
  }

  .dashboard-header {
    @apply bg-gray-900 border-b border-cyan-400/30 p-4 flex items-center justify-between;
    backdrop-filter: blur(10px);
  }

  .header-left {
    @apply flex items-center gap-4;
  }

  .dashboard-title {
    @apply text-2xl font-bold text-cyan-400;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  }

  .system-health {
    @apply flex items-center gap-2;
  }

  .health-indicator {
    @apply text-lg;
  }

  .health-text {
    @apply text-sm font-medium;
  }

  .header-center {
    @apply flex-1 flex justify-center;
  }

  .system-info {
    @apply flex gap-6;
  }

  .info-item {
    @apply flex flex-col items-center text-sm;
  }

  .info-label {
    @apply text-gray-400;
  }

  .info-value {
    @apply font-mono font-bold;
  }

  .header-right {
    @apply flex items-center;
  }

  .header-actions {
    @apply flex gap-2;
  }

  .action-btn {
    @apply w-10 h-10 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700;
    @apply hover:border-cyan-400/50 transition-colors text-lg;
  }

  .action-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .settings-panel {
    @apply bg-gray-900 border-b border-gray-700 p-4;
  }

  .settings-header {
    @apply flex justify-between items-center mb-4;
  }

  .settings-header h3 {
    @apply text-lg font-medium text-cyan-400;
  }

  .close-btn {
    @apply text-gray-400 hover:text-white text-xl;
  }

  .settings-content {
    @apply space-y-4;
  }

  .setting-group {
    @apply space-y-2;
  }

  .setting-group h4 {
    @apply text-sm font-medium text-gray-300;
  }

  .setting-label {
    @apply flex items-center gap-2 text-sm;
  }

  .setting-checkbox {
    @apply w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded;
  }

  .setting-item {
    @apply flex items-center gap-2 text-sm;
  }

  .setting-input {
    @apply bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white;
    @apply focus:border-cyan-400 focus:outline-none;
  }

  .setting-actions {
    @apply flex gap-2;
  }

  .setting-btn {
    @apply px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .dashboard-main {
    @apply flex-1 p-6 space-y-6 overflow-auto;
  }

  .status-section,
  .metrics-section {
    @apply w-full;
  }

  .dashboard-footer {
    @apply bg-gray-900 border-t border-gray-700 p-3 flex items-center justify-between text-sm;
  }

  .footer-left {
    @apply flex items-center gap-2;
  }

  .footer-text {
    @apply text-gray-400;
  }

  .footer-separator {
    @apply text-gray-600;
  }

  .footer-right {
    @apply text-gray-400;
  }
</style>