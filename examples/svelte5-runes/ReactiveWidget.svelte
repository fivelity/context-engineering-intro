<!-- SenseCanvas: Svelte 5 Runes Example -->
<!-- Demonstrates proper reactive state management for hardware monitoring widgets -->

<script lang="ts">
  import { onMount } from 'svelte';
  import type { HardwareMetrics } from '../../types/sensor.js';

  interface Props {
    sensorType: 'cpu' | 'gpu' | 'memory';
    updateInterval?: number;
  }

  let { sensorType, updateInterval = 1000 }: Props = $props();

  // ✅ Correct: Using $state for reactive variables
  let metrics = $state<HardwareMetrics | null>(null);
  let isConnected = $state(false);
  let error = $state<string | null>(null);

  // ✅ Correct: Using $derived for computed values
  let status = $derived(() => {
    if (error) return 'error';
    if (!isConnected) return 'disconnecting';
    if (!metrics) return 'loading';
    return 'connected';
  });

  let displayValue = $derived(() => {
    if (!metrics) return 0;
    switch (sensorType) {
      case 'cpu':
        return metrics.cpu.usage;
      case 'gpu':
        return metrics.gpu.usage;
      case 'memory':
        return metrics.memory.usage;
      default:
        return 0;
    }
  });

  let alertLevel = $derived(() => {
    const value = displayValue();
    if (value > 90) return 'critical';
    if (value > 75) return 'warning';
    return 'normal';
  });

  // ✅ Correct: Using $effect for side effects with cleanup
  $effect(() => {
    let ws: WebSocket | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onopen = () => {
          isConnected = true;
          error = null;
          console.log(`Connected to ${sensorType} sensor stream`);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            metrics = data;
          } catch (e) {
            error = 'Failed to parse sensor data';
          }
        };

        ws.onclose = () => {
          isConnected = false;
          console.log(`Disconnected from ${sensorType} sensor stream`);
          
          // Auto-reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        ws.onerror = (e) => {
          error = `WebSocket error: ${e}`;
          isConnected = false;
        };

      } catch (e) {
        error = `Connection failed: ${e}`;
      }
    };

    // Start connection
    connect();

    // Cleanup function - CRITICAL for preventing memory leaks
    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  });

  // ✅ Correct: Another $effect for handling alerts
  $effect(() => {
    if (alertLevel() === 'critical') {
      // Browser notification for critical alerts
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${sensorType.toUpperCase()} Alert`, {
          body: `${sensorType.toUpperCase()} usage at ${displayValue()}%`,
          icon: '/icons/alert.svg'
        });
      }
    }
  });

  // ❌ WRONG: Don't use old Svelte 4 patterns
  // $: status = error ? 'error' : isConnected ? 'connected' : 'disconnected';
  // $: displayValue = metrics?.[sensorType]?.usage || 0;
  // $: if (displayValue > 90) { /* trigger alert */ }
</script>

<div class="reactive-widget" class:error={status === 'error'}>
  <div class="widget-header">
    <h3>{sensorType.toUpperCase()} Monitor</h3>
    <div class="status-indicator" class:connected={isConnected}>
      {status}
    </div>
  </div>

  <div class="widget-content">
    {#if error}
      <div class="error-message">{error}</div>
    {:else if metrics}
      <div class="metric-display">
        <span class="value">{displayValue().toFixed(1)}%</span>
        <span class="alert-level" class:critical={alertLevel() === 'critical'}>
          {alertLevel()}
        </span>
      </div>
    {:else}
      <div class="loading">Loading...</div>
    {/if}
  </div>
</div>

<style>
  .reactive-widget {
    @apply p-4 border border-gray-300 rounded-lg bg-white;
    min-width: 200px;
    min-height: 120px;
  }

  .widget-header {
    @apply flex justify-between items-center mb-2;
  }

  .status-indicator {
    @apply px-2 py-1 rounded text-sm;
    background: #f3f4f6;
    color: #6b7280;
  }

  .status-indicator.connected {
    @apply bg-green-100 text-green-800;
  }

  .error-message {
    @apply text-red-600 text-sm;
  }

  .metric-display {
    @apply flex flex-col items-center;
  }

  .value {
    @apply text-2xl font-bold;
  }

  .alert-level {
    @apply text-sm uppercase tracking-wide;
    color: #10b981;
  }

  .alert-level.critical {
    @apply text-red-600;
  }

  .loading {
    @apply text-gray-500 text-center;
  }
</style> 