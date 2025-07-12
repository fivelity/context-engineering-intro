<!--
SenseCanvas Hardware Metrics Display Component
Real-time hardware monitoring dashboard using Svelte 5 runes.
-->

<script lang="ts">
  import { hardwareStore } from '../stores/hardware.svelte.js';
  import type { CoreMetric, StorageMetrics } from '../types/hardware.js';

  // ✅ Using Svelte 5 runes for component state
  let selectedTab = $state<'overview' | 'cpu' | 'gpu' | 'memory' | 'storage' | 'network'>('overview');
  let showAlerts = $state(true);

  // ✅ Derived values for display
  let hasData = $derived(() => hardwareStore.metrics !== null);
  let alertCount = $derived(() => hardwareStore.alerts.length);
  let criticalCount = $derived(() => hardwareStore.criticalAlerts.length);

  // Format utilities
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatTemperature(temp: number): string {
    return temp > 0 ? `${temp.toFixed(1)}°C` : 'N/A';
  }

  function formatFrequency(freq: number): string {
    if (freq === 0) return 'N/A';
    if (freq >= 1000) return `${(freq / 1000).toFixed(2)} GHz`;
    return `${freq.toFixed(0)} MHz`;
  }

  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function getUsageColor(usage: number): string {
    if (usage >= 90) return 'text-red-400';
    if (usage >= 75) return 'text-yellow-400';
    if (usage >= 50) return 'text-orange-400';
    return 'text-green-400';
  }

  function getTemperatureColor(temp: number): string {
    if (temp >= 85) return 'text-red-400';
    if (temp >= 75) return 'text-yellow-400';
    return 'text-green-400';
  }
</script>

<div class="hardware-metrics">
  {#if !hasData}
    <div class="no-data">
      <div class="loading-spinner"></div>
      <p>Waiting for hardware data...</p>
    </div>
  {:else}
    <!-- Alert Summary -->
    {#if alertCount > 0 && showAlerts}
      <div class="alert-summary">
        <div class="alert-header">
          <h3>System Alerts ({alertCount})</h3>
          <button onclick={() => showAlerts = false} class="close-btn">×</button>
        </div>
        <div class="alert-list">
          {#each hardwareStore.alerts.slice(0, 3) as alert}
            <div class="alert-item {alert.severity}">
              <span class="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
              <span class="alert-message">{alert.message}</span>
            </div>
          {/each}
          {#if alertCount > 3}
            <p class="alert-more">+{alertCount - 3} more alerts</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      {#each ['overview', 'cpu', 'gpu', 'memory', 'storage', 'network'] as tab}
        <button 
          class="tab-btn"
          class:active={selectedTab === tab}
          onclick={() => selectedTab = tab}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      {/each}
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      {#if selectedTab === 'overview'}
        <div class="overview-grid">
          <!-- CPU Overview -->
          <div class="metric-card">
            <h4>CPU</h4>
            <div class="metric-value {getUsageColor(hardwareStore.cpu?.usage || 0)}">
              {(hardwareStore.cpu?.usage || 0).toFixed(1)}%
            </div>
            <div class="metric-details">
              <div>Temp: {formatTemperature(hardwareStore.cpu?.temperature || 0)}</div>
              <div>Freq: {formatFrequency(hardwareStore.cpu?.frequency || 0)}</div>
            </div>
          </div>

          <!-- GPU Overview -->
          <div class="metric-card">
            <h4>GPU</h4>
            <div class="metric-value {getUsageColor(hardwareStore.gpu?.usage || 0)}">
              {(hardwareStore.gpu?.usage || 0).toFixed(1)}%
            </div>
            <div class="metric-details">
              <div>Temp: {formatTemperature(hardwareStore.gpu?.temperature || 0)}</div>
              <div>VRAM: {(hardwareStore.gpu?.memory?.usage || 0).toFixed(1)}%</div>
            </div>
          </div>

          <!-- Memory Overview -->
          <div class="metric-card">
            <h4>Memory</h4>
            <div class="metric-value {getUsageColor(hardwareStore.memory?.usage || 0)}">
              {(hardwareStore.memory?.usage || 0).toFixed(1)}%
            </div>
            <div class="metric-details">
              <div>Used: {formatBytes((hardwareStore.memory?.used || 0) * 1024 * 1024)}</div>
              <div>Total: {formatBytes((hardwareStore.memory?.total || 0) * 1024 * 1024)}</div>
            </div>
          </div>

          <!-- System Overview -->
          <div class="metric-card">
            <h4>System</h4>
            <div class="metric-value">
              {hardwareStore.system?.processes || 0}
            </div>
            <div class="metric-details">
              <div>Processes</div>
              <div>Uptime: {formatUptime(hardwareStore.system?.uptime || 0)}</div>
            </div>
          </div>
        </div>

      {:else if selectedTab === 'cpu'}
        <div class="cpu-details">
          <div class="cpu-summary">
            <div class="cpu-main">
              <div class="cpu-usage {getUsageColor(hardwareStore.cpu?.usage || 0)}">
                {(hardwareStore.cpu?.usage || 0).toFixed(1)}%
              </div>
              <div class="cpu-info">
                <div>Temperature: <span class="{getTemperatureColor(hardwareStore.cpu?.temperature || 0)}">{formatTemperature(hardwareStore.cpu?.temperature || 0)}</span></div>
                <div>Frequency: {formatFrequency(hardwareStore.cpu?.frequency || 0)}</div>
                <div>Power: {(hardwareStore.cpu?.power || 0).toFixed(1)}W</div>
              </div>
            </div>
          </div>

          {#if hardwareStore.cpu?.cores && hardwareStore.cpu.cores.length > 0}
            <div class="cpu-cores">
              <h5>CPU Cores</h5>
              <div class="cores-grid">
                {#each hardwareStore.cpu.cores as core}
                  <div class="core-item">
                    <div class="core-id">Core {core.id}</div>
                    <div class="core-usage {getUsageColor(core.usage)}">{core.usage.toFixed(1)}%</div>
                    <div class="core-temp">{formatTemperature(core.temperature)}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

      {:else if selectedTab === 'gpu'}
        <div class="gpu-details">
          <div class="gpu-summary">
            <div class="gpu-main">
              <div class="gpu-usage {getUsageColor(hardwareStore.gpu?.usage || 0)}">
                {(hardwareStore.gpu?.usage || 0).toFixed(1)}%
              </div>
              <div class="gpu-info">
                <div>Temperature: <span class="{getTemperatureColor(hardwareStore.gpu?.temperature || 0)}">{formatTemperature(hardwareStore.gpu?.temperature || 0)}</span></div>
                <div>Core Clock: {formatFrequency(hardwareStore.gpu?.frequency?.core || 0)}</div>
                <div>Memory Clock: {formatFrequency(hardwareStore.gpu?.frequency?.memory || 0)}</div>
                <div>Power: {(hardwareStore.gpu?.power || 0).toFixed(1)}W</div>
                <div>Fan Speed: {(hardwareStore.gpu?.fanSpeed || 0).toFixed(0)} RPM</div>
              </div>
            </div>
          </div>

          {#if hardwareStore.gpu?.memory}
            <div class="gpu-memory">
              <h5>VRAM Usage</h5>
              <div class="memory-bar">
                <div class="memory-used" style="width: {hardwareStore.gpu.memory.usage}%"></div>
              </div>
              <div class="memory-info">
                <span>Used: {formatBytes(hardwareStore.gpu.memory.used * 1024 * 1024)}</span>
                <span>Total: {formatBytes(hardwareStore.gpu.memory.total * 1024 * 1024)}</span>
              </div>
            </div>
          {/if}
        </div>

      {:else if selectedTab === 'memory'}
        <div class="memory-details">
          <div class="memory-summary">
            <div class="memory-main">
              <div class="memory-usage {getUsageColor(hardwareStore.memory?.usage || 0)}">
                {(hardwareStore.memory?.usage || 0).toFixed(1)}%
              </div>
              <div class="memory-info">
                <div>Used: {formatBytes((hardwareStore.memory?.used || 0) * 1024 * 1024)}</div>
                <div>Available: {formatBytes((hardwareStore.memory?.available || 0) * 1024 * 1024)}</div>
                <div>Total: {formatBytes((hardwareStore.memory?.total || 0) * 1024 * 1024)}</div>
                <div>Speed: {formatFrequency(hardwareStore.memory?.speed || 0)}</div>
              </div>
            </div>
          </div>

          <div class="memory-bar">
            <div class="memory-used" style="width: {hardwareStore.memory?.usage || 0}%"></div>
          </div>
        </div>

      {:else if selectedTab === 'storage'}
        <div class="storage-details">
          {#if hardwareStore.storage && hardwareStore.storage.length > 0}
            <div class="storage-grid">
              {#each hardwareStore.storage as storage}
                <div class="storage-item">
                  <div class="storage-header">
                    <h5>{storage.name || 'Unknown Device'}</h5>
                    <span class="storage-type">{storage.type}</span>
                  </div>
                  <div class="storage-usage {getUsageColor(storage.usage)}">
                    {storage.usage.toFixed(1)}%
                  </div>
                  <div class="storage-bar">
                    <div class="storage-used" style="width: {storage.usage}%"></div>
                  </div>
                  <div class="storage-info">
                    <div>Used: {storage.used} GB</div>
                    <div>Total: {storage.total} GB</div>
                    <div>Temp: {formatTemperature(storage.temperature)}</div>
                    <div>Health: {storage.health}</div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-storage">No storage devices detected</div>
          {/if}
        </div>

      {:else if selectedTab === 'network'}
        <div class="network-details">
          {#if hardwareStore.network}
            <div class="network-summary">
              <div class="network-main">
                <div class="network-speed">
                  {(hardwareStore.network.speed || 0).toFixed(2)} Mbps
                </div>
                <div class="network-info">
                  <div>Interface: {hardwareStore.network.interface}</div>
                  <div>Bytes Received: {formatBytes(hardwareStore.network.bytesReceived)}</div>
                  <div>Bytes Sent: {formatBytes(hardwareStore.network.bytesSent)}</div>
                  <div>Packets Received: {hardwareStore.network.packetsReceived.toLocaleString()}</div>
                  <div>Packets Sent: {hardwareStore.network.packetsSent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          {:else}
            <div class="no-network">No network data available</div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .hardware-metrics {
    @apply bg-gray-900 text-white font-mono;
  }

  .no-data {
    @apply flex flex-col items-center justify-center py-12 text-gray-400;
  }

  .loading-spinner {
    @apply w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4;
  }

  .alert-summary {
    @apply bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-6;
  }

  .alert-header {
    @apply flex justify-between items-center mb-2;
  }

  .alert-header h3 {
    @apply text-red-400 font-bold;
  }

  .close-btn {
    @apply text-red-400 hover:text-red-300 text-xl leading-none;
  }

  .alert-item {
    @apply flex justify-between items-center py-1 text-sm;
  }

  .alert-item.critical {
    @apply text-red-400;
  }

  .alert-item.warning {
    @apply text-yellow-400;
  }

  .alert-more {
    @apply text-gray-400 text-xs mt-2;
  }

  .tab-navigation {
    @apply flex border-b border-gray-700 mb-6;
  }

  .tab-btn {
    @apply px-4 py-2 text-gray-400 hover:text-cyan-400 border-b-2 border-transparent;
    @apply hover:border-cyan-400/50 transition-colors;
  }

  .tab-btn.active {
    @apply text-cyan-400 border-cyan-400;
  }

  .overview-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
  }

  .metric-card {
    @apply bg-gray-800 border border-gray-700 rounded-lg p-4;
  }

  .metric-card h4 {
    @apply text-gray-400 text-sm mb-2;
  }

  .metric-value {
    @apply text-2xl font-bold mb-2;
  }

  .metric-details {
    @apply text-sm text-gray-400 space-y-1;
  }

  .cpu-details,
  .gpu-details,
  .memory-details,
  .storage-details,
  .network-details {
    @apply space-y-6;
  }

  .cpu-summary,
  .gpu-summary,
  .memory-summary,
  .network-summary {
    @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
  }

  .cpu-main,
  .gpu-main,
  .memory-main,
  .network-main {
    @apply flex items-center gap-6;
  }

  .cpu-usage,
  .gpu-usage,
  .memory-usage {
    @apply text-4xl font-bold;
  }

  .network-speed {
    @apply text-4xl font-bold text-cyan-400;
  }

  .cpu-info,
  .gpu-info,
  .memory-info,
  .network-info {
    @apply space-y-2 text-sm;
  }

  .cpu-cores {
    @apply bg-gray-800 border border-gray-700 rounded-lg p-4;
  }

  .cpu-cores h5 {
    @apply text-gray-400 mb-4;
  }

  .cores-grid {
    @apply grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2;
  }

  .core-item {
    @apply bg-gray-700 rounded p-2 text-center text-xs;
  }

  .core-id {
    @apply text-gray-400 mb-1;
  }

  .core-usage {
    @apply font-bold;
  }

  .core-temp {
    @apply text-gray-400 text-xs;
  }

  .gpu-memory {
    @apply bg-gray-800 border border-gray-700 rounded-lg p-4;
  }

  .gpu-memory h5 {
    @apply text-gray-400 mb-2;
  }

  .memory-bar,
  .storage-bar {
    @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2;
  }

  .memory-used,
  .storage-used {
    @apply h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300;
  }

  .memory-info {
    @apply flex justify-between text-sm text-gray-400;
  }

  .storage-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
  }

  .storage-item {
    @apply bg-gray-800 border border-gray-700 rounded-lg p-4;
  }

  .storage-header {
    @apply flex justify-between items-center mb-2;
  }

  .storage-header h5 {
    @apply text-cyan-400;
  }

  .storage-type {
    @apply text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded;
  }

  .storage-usage {
    @apply text-xl font-bold mb-2;
  }

  .storage-info {
    @apply text-sm text-gray-400 space-y-1;
  }

  .no-storage,
  .no-network {
    @apply text-center text-gray-400 py-8;
  }
</style>