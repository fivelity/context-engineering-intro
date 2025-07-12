<!-- 
SenseCanvas Connection Status Component
Displays real-time WebSocket connection status using Svelte 5 runes.
-->

<script lang="ts">
  import { hardwareStore } from '../stores/hardware.svelte.js';
  import { websocketStore } from '../services/websocket.svelte.js';

  // ✅ Using Svelte 5 runes for reactive state
  let showDetails = $state(false);
  let lastHeartbeat = $state<Date | null>(null);

  // ✅ Derived computed values
  let connectionStatusText = $derived(() => {
    const health = hardwareStore.connectionHealth;
    switch (health) {
      case 'healthy': return 'Connected';
      case 'stale': return 'Stale Data';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  });

  let statusClass = $derived(() => {
    const health = hardwareStore.connectionHealth;
    switch (health) {
      case 'healthy': return 'status-healthy';
      case 'stale': return 'status-warning';
      case 'disconnected': return 'status-disconnected';
      case 'error': return 'status-error';
      default: return 'status-unknown';
    }
  });

  let reconnectText = $derived(() => {
    if (websocketStore.reconnecting) {
      return `Reconnecting... (${websocketStore.attempts}/${10})`;
    }
    return 'Reconnect';
  });

  let lastUpdateText = $derived(() => {
    if (!hardwareStore.lastUpdateTime) return 'Never';
    const diff = Date.now() - hardwareStore.lastUpdateTime;
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  });

  // ✅ Using $effect for periodic updates
  $effect(() => {
    const interval = setInterval(() => {
      if (hardwareStore.isConnected) {
        lastHeartbeat = new Date();
      }
    }, 1000);

    // Cleanup function
    return () => clearInterval(interval);
  });

  function handleReconnect() {
    websocketStore.service.reconnect();
  }

  function handleToggleDetails() {
    showDetails = !showDetails;
  }

  function handleGetCurrentMetrics() {
    websocketStore.service.getCurrentMetrics();
  }

  function handleGetHardwareStatus() {
    websocketStore.service.getHardwareStatus();
  }
</script>

<div class="connection-status">
  <div class="status-bar">
    <div class="status-indicator {statusClass}">
      <div class="status-dot"></div>
      <span class="status-text">{connectionStatusText}</span>
    </div>

    <div class="status-actions">
      {#if !hardwareStore.isConnected && !websocketStore.reconnecting}
        <button 
          class="reconnect-btn"
          onclick={handleReconnect}
          disabled={!websocketStore.canReconnect}
        >
          {reconnectText}
        </button>
      {/if}

      <button 
        class="details-btn"
        onclick={handleToggleDetails}
        aria-expanded={showDetails}
      >
        Details
      </button>
    </div>
  </div>

  {#if showDetails}
    <div class="connection-details">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <span class="detail-value">{connectionStatusText}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Client ID:</span>
          <span class="detail-value">{hardwareStore.clientId || 'Not assigned'}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Last Update:</span>
          <span class="detail-value">{lastUpdateText}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Reconnect Attempts:</span>
          <span class="detail-value">{websocketStore.attempts}</span>
        </div>

        {#if hardwareStore.connectionError}
          <div class="detail-item error">
            <span class="detail-label">Error:</span>
            <span class="detail-value">{hardwareStore.connectionError}</span>
          </div>
        {/if}
      </div>

      <div class="subscription-status">
        <h4>Subscriptions</h4>
        <div class="subscription-grid">
          {#each Object.entries(websocketStore.subscriptions) as [type, active]}
            <div class="subscription-item">
              <span class="subscription-name">{type.replace('_', ' ').toUpperCase()}</span>
              <span class="subscription-status" class:active>
                {active ? '✓' : '✗'}
              </span>
            </div>
          {/each}
        </div>
      </div>

      <div class="connection-actions">
        <button 
          class="action-btn"
          onclick={handleGetCurrentMetrics}
          disabled={!hardwareStore.isConnected}
        >
          Refresh Metrics
        </button>

        <button 
          class="action-btn"
          onclick={handleGetHardwareStatus}
          disabled={!hardwareStore.isConnected}
        >
          Get Status
        </button>

        {#if hardwareStore.isConnected}
          <button 
            class="action-btn disconnect"
            onclick={() => websocketStore.service.disconnect()}
          >
            Disconnect
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .connection-status {
    @apply bg-gray-900 border border-cyan-400/30 rounded-lg p-4;
    font-family: 'Orbitron', monospace;
  }

  .status-bar {
    @apply flex items-center justify-between;
  }

  .status-indicator {
    @apply flex items-center gap-2;
  }

  .status-dot {
    @apply w-3 h-3 rounded-full;
    background: currentColor;
    animation: pulse 2s infinite;
  }

  .status-text {
    @apply text-sm font-medium;
  }

  .status-healthy {
    @apply text-green-400;
  }

  .status-warning {
    @apply text-yellow-400;
  }

  .status-disconnected {
    @apply text-gray-400;
  }

  .status-error {
    @apply text-red-400;
  }

  .status-unknown {
    @apply text-purple-400;
  }

  .status-actions {
    @apply flex gap-2;
  }

  .reconnect-btn,
  .details-btn,
  .action-btn {
    @apply px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded text-cyan-400 text-xs;
    @apply hover:bg-cyan-500/30 transition-colors;
  }

  .reconnect-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .connection-details {
    @apply mt-4 pt-4 border-t border-cyan-400/20;
  }

  .detail-grid {
    @apply grid grid-cols-2 gap-2 mb-4;
  }

  .detail-item {
    @apply flex justify-between text-sm;
  }

  .detail-item.error {
    @apply col-span-2;
  }

  .detail-label {
    @apply text-gray-400;
  }

  .detail-value {
    @apply text-cyan-400 font-mono;
  }

  .detail-item.error .detail-value {
    @apply text-red-400;
  }

  .subscription-status h4 {
    @apply text-sm font-medium text-gray-400 mb-2;
  }

  .subscription-grid {
    @apply grid grid-cols-3 gap-2 mb-4;
  }

  .subscription-item {
    @apply flex justify-between text-xs p-2 bg-gray-800 rounded;
  }

  .subscription-name {
    @apply text-gray-400;
  }

  .subscription-status {
    @apply text-red-400;
  }

  .subscription-status.active {
    @apply text-green-400;
  }

  .connection-actions {
    @apply flex gap-2 flex-wrap;
  }

  .action-btn.disconnect {
    @apply bg-red-500/20 border-red-400/30 text-red-400;
    @apply hover:bg-red-500/30;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>