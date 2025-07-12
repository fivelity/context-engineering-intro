<!--
SenseCanvas Widget Configurator Component
Modal configurator with tabs for Library, AI Generate, and Create Custom following PRP specifications.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { WidgetConfigSchema, type WidgetConfig } from '../../types/widgets.js';
  import { createWidget } from '../widgets/index.js';
  import LibraryTab from './LibraryTab.svelte';
  import AiGenerateTab from './AiGenerateTab.svelte';
  import CreateCustomTab from './CreateCustomTab.svelte';
  import WidgetPreview from './WidgetPreview.svelte';

  interface Props {
    isOpen: boolean;
    editingWidget?: WidgetConfig | null;
    onClose: () => void;
  }

  let { isOpen, editingWidget = null, onClose }: Props = $props();

  const dispatch = createEventDispatcher<{
    widgetAdded: WidgetConfig;
    widgetUpdated: WidgetConfig;
    widgetSaved: WidgetConfig;
  }>();

  // ✅ Using Svelte 5 runes for configurator state
  let activeTab = $state<'library' | 'ai-generate' | 'create-custom'>('library');
  let isValid = $state(false);
  let validationErrors = $state<string[]>([]);
  let isSaving = $state(false);

  // Widget configuration state with defaults
  let widgetConfig = $state<Partial<WidgetConfig>>({
    id: '',
    type: 'gauge',
    title: '',
    sensorType: 'cpu',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    style: {
      theme: 'default',
      colors: ['#22d3ee', '#ef4444', '#f59e0b'],
      opacity: 1,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'Orbitron, monospace',
      borderWidth: 1,
      borderColor: '#374151',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      gradientEnabled: false,
      gradientDirection: 'horizontal'
    },
    alerts: {
      enabled: false,
      thresholds: {
        warning: 75,
        critical: 90
      },
      showNotifications: true,
      playSound: false,
      flashWidget: true
    },
    // Type-specific configs (will be set based on widget type)
    gaugeConfig: {
      minValue: 0,
      maxValue: 100,
      startAngle: -135,
      endAngle: 135,
      arcWidth: 10,
      showValue: true,
      showLabel: true,
      showTicks: true,
      tickInterval: 20,
      unit: '%'
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: '1.0.0',
    tags: [],
    isSelected: false,
    isResizing: false,
    isDragging: false,
    zIndex: 1
  });

  // ✅ Derived validation state
  let validatedConfig = $derived(() => {
    const result = WidgetConfigSchema.safeParse({
      ...widgetConfig,
      id: widgetConfig.id || generateId()
    });
    
    isValid = result.success;
    validationErrors = result.success ? [] : result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    
    return result.success ? result.data : null;
  });

  let previewConfig = $derived(() => {
    return validatedConfig() || widgetConfig as WidgetConfig;
  });

  // ✅ Using $effect for initialization with editing widget
  $effect(() => {
    if (editingWidget && isOpen) {
      widgetConfig = { ...editingWidget };
      activeTab = 'create-custom';
    } else if (isOpen && !editingWidget) {
      // Reset to defaults when opening for new widget
      widgetConfig = {
        id: '',
        type: 'gauge',
        title: '',
        sensorType: 'cpu',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        style: {
          theme: 'default',
          colors: ['#22d3ee', '#ef4444', '#f59e0b'],
          opacity: 1,
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Orbitron, monospace',
          borderWidth: 1,
          borderColor: '#374151',
          shadowEnabled: false,
          shadowColor: '#000000',
          shadowBlur: 4,
          gradientEnabled: false,
          gradientDirection: 'horizontal'
        },
        alerts: {
          enabled: false,
          thresholds: {
            warning: 75,
            critical: 90
          },
          showNotifications: true,
          playSound: false,
          flashWidget: true
        },
        gaugeConfig: {
          minValue: 0,
          maxValue: 100,
          startAngle: -135,
          endAngle: 135,
          arcWidth: 10,
          showValue: true,
          showLabel: true,
          showTicks: true,
          tickInterval: 20,
          unit: '%'
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        tags: [],
        isSelected: false,
        isResizing: false,
        isDragging: false,
        zIndex: 1
      };
      activeTab = 'library';
    }
  });

  // Handle tab switching
  function switchTab(tab: 'library' | 'ai-generate' | 'create-custom') {
    activeTab = tab;
  }

  // Handle widget selection from library
  function handleLibrarySelection(widget: WidgetConfig) {
    widgetConfig = { ...widget, id: generateId(), position: { x: 0, y: 0 } };
    activeTab = 'create-custom';
  }

  // Handle AI generated widget
  function handleAiGenerated(widget: Partial<WidgetConfig>) {
    widgetConfig = { 
      ...widgetConfig, 
      ...widget, 
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    activeTab = 'create-custom';
  }

  // Handle configuration changes
  function handleConfigChange(newConfig: Partial<WidgetConfig>) {
    widgetConfig = { 
      ...widgetConfig, 
      ...newConfig, 
      updatedAt: Date.now()
    };
  }

  // Generate unique ID
  function generateId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export widget configuration as JSON
  function exportConfig() {
    if (!validatedConfig()) return;
    
    const configJson = JSON.stringify(validatedConfig(), null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widgetConfig.title || 'widget'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import widget configuration
  function importConfig(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        const validatedImport = WidgetConfigSchema.parse(config);
        widgetConfig = { ...validatedImport, id: generateId() };
        activeTab = 'create-custom';
      } catch (error) {
        console.error('Invalid widget configuration:', error);
        alert('Invalid widget configuration file');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    input.value = '';
  }

  // Handle save/add widget
  async function handleSave() {
    if (!validatedConfig() || isSaving) return;

    isSaving = true;
    
    try {
      const finalConfig = validatedConfig()!;
      
      if (editingWidget) {
        dispatch('widgetUpdated', finalConfig);
      } else {
        dispatch('widgetAdded', finalConfig);
      }
      
      dispatch('widgetSaved', finalConfig);
      onClose();
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('Error saving widget configuration');
    } finally {
      isSaving = false;
    }
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter' && event.ctrlKey && isValid) {
      handleSave();
    }
  }

  // Backdrop click handler
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="modal-backdrop" 
    onclick={handleBackdropClick}
    role="dialog" 
    aria-modal="true"
    aria-labelledby="configurator-title"
  >
    <div class="modal-container" onclick={(e) => e.stopPropagation()}>
      <!-- Modal header -->
      <div class="modal-header">
        <h2 id="configurator-title" class="modal-title">
          {editingWidget ? 'Edit Widget' : 'Add Widget'}
        </h2>
        <div class="header-actions">
          <button 
            class="action-btn import-btn"
            title="Import Configuration"
          >
            <label>
              📁 Import
              <input 
                type="file" 
                accept=".json" 
                onchange={importConfig} 
                hidden 
              />
            </label>
          </button>
          <button 
            class="action-btn export-btn"
            onclick={exportConfig}
            disabled={!isValid}
            title="Export Configuration"
          >
            💾 Export
          </button>
          <button 
            class="close-button" 
            onclick={onClose} 
            aria-label="Close configurator"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Modal body -->
      <div class="modal-body">
        <!-- Left column: Controls -->
        <div class="controls-column">
          <!-- Tab navigation -->
          <div class="tab-nav">
            <button
              class="tab-button"
              class:active={activeTab === 'library'}
              onclick={() => switchTab('library')}
            >
              <span class="tab-icon">🧩</span>
              Library
            </button>
            <button
              class="tab-button"
              class:active={activeTab === 'ai-generate'}
              onclick={() => switchTab('ai-generate')}
            >
              <span class="tab-icon">🤖</span>
              AI Generate
            </button>
            <button
              class="tab-button"
              class:active={activeTab === 'create-custom'}
              onclick={() => switchTab('create-custom')}
            >
              <span class="tab-icon">⚙️</span>
              Create Custom
            </button>
          </div>

          <!-- Tab content -->
          <div class="tab-content">
            {#if activeTab === 'library'}
              <LibraryTab onSelection={handleLibrarySelection} />
            {:else if activeTab === 'ai-generate'}
              <AiGenerateTab onGenerated={handleAiGenerated} />
            {:else if activeTab === 'create-custom'}
              <CreateCustomTab 
                config={widgetConfig} 
                onChange={handleConfigChange}
                validationErrors={validationErrors}
              />
            {/if}
          </div>
        </div>

        <!-- Right column: Live preview -->
        <div class="preview-column">
          <div class="preview-header">
            <h3>Live Preview</h3>
            <div class="preview-status">
              {#if isValid}
                <span class="status-valid">✅ Valid</span>
              {:else}
                <span class="status-invalid">❌ Invalid</span>
              {/if}
            </div>
          </div>
          
          <div class="preview-container">
            <WidgetPreview config={previewConfig} />
          </div>
          
          {#if validationErrors.length > 0}
            <div class="validation-errors">
              <h4>Validation Errors:</h4>
              <ul>
                {#each validationErrors as error}
                  <li class="error-item">{error}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal footer -->
      <div class="modal-footer">
        <div class="footer-info">
          {#if widgetConfig.type}
            <span class="widget-type-badge">{widgetConfig.type}</span>
          {/if}
          {#if widgetConfig.sensorType}
            <span class="sensor-type-badge">{widgetConfig.sensorType}</span>
          {/if}
        </div>
        
        <div class="footer-actions">
          <button 
            class="cancel-button" 
            onclick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            class="save-button" 
            onclick={handleSave}
            disabled={!isValid || isSaving}
          >
            {#if isSaving}
              <span class="loading-spinner"></span>
              Saving...
            {:else}
              {editingWidget ? 'Update Widget' : 'Add Widget'}
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    @apply fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50;
    animation: backdrop-fade-in 0.2s ease-out;
  }

  .modal-container {
    @apply bg-gray-900 border border-cyan-400/30 rounded-xl shadow-2xl;
    @apply max-w-7xl w-full max-h-[90vh] overflow-hidden mx-4;
    animation: modal-slide-in 0.3s ease-out;
    font-family: 'Orbitron', monospace;
  }

  .modal-header {
    @apply flex items-center justify-between p-6 border-b border-gray-700;
    @apply bg-gradient-to-r from-gray-900 to-gray-800;
  }

  .modal-title {
    @apply text-2xl font-bold text-cyan-400;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  }

  .header-actions {
    @apply flex items-center gap-3;
  }

  .action-btn {
    @apply px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .action-btn label {
    @apply cursor-pointer;
  }

  .action-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .close-button {
    @apply w-8 h-8 flex items-center justify-center rounded-lg;
    @apply text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-xl;
  }

  .modal-body {
    @apply flex h-[600px];
  }

  .controls-column {
    @apply flex-1 border-r border-gray-700 flex flex-col;
  }

  .tab-nav {
    @apply flex border-b border-gray-700 bg-gray-800/50;
  }

  .tab-button {
    @apply flex-1 flex items-center justify-center gap-2 px-4 py-3;
    @apply text-sm font-medium text-gray-400 border-b-2 border-transparent;
    @apply hover:text-cyan-400 hover:border-cyan-400/50 transition-colors;
  }

  .tab-button.active {
    @apply text-cyan-400 border-cyan-400 bg-gray-700/50;
  }

  .tab-icon {
    @apply text-lg;
  }

  .tab-content {
    @apply flex-1 overflow-y-auto;
  }

  .preview-column {
    @apply flex-1 flex flex-col bg-gray-800/20;
  }

  .preview-header {
    @apply flex items-center justify-between p-4 border-b border-gray-700;
  }

  .preview-header h3 {
    @apply text-lg font-bold text-gray-300;
  }

  .preview-status {
    @apply text-sm;
  }

  .status-valid {
    @apply text-green-400;
  }

  .status-invalid {
    @apply text-red-400;
  }

  .preview-container {
    @apply flex-1 p-6 overflow-auto;
    background: radial-gradient(circle at center, rgba(34, 211, 238, 0.05) 0%, transparent 70%);
  }

  .validation-errors {
    @apply p-4 border-t border-gray-700 bg-red-900/20;
  }

  .validation-errors h4 {
    @apply text-sm font-bold text-red-400 mb-2;
  }

  .validation-errors ul {
    @apply space-y-1;
  }

  .error-item {
    @apply text-xs text-red-300;
  }

  .modal-footer {
    @apply flex items-center justify-between p-6 border-t border-gray-700;
    @apply bg-gradient-to-r from-gray-900 to-gray-800;
  }

  .footer-info {
    @apply flex gap-2;
  }

  .widget-type-badge,
  .sensor-type-badge {
    @apply px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs;
  }

  .widget-type-badge {
    @apply text-cyan-400 border-cyan-400/30;
  }

  .sensor-type-badge {
    @apply text-yellow-400 border-yellow-400/30;
  }

  .footer-actions {
    @apply flex gap-3;
  }

  .cancel-button {
    @apply px-6 py-3 bg-gray-700 border border-gray-600 rounded-lg;
    @apply hover:bg-gray-600 transition-colors;
  }

  .save-button {
    @apply px-6 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg;
    @apply text-cyan-400 hover:bg-cyan-500/30 transition-colors;
    @apply flex items-center gap-2;
  }

  .save-button:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .loading-spinner {
    @apply w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin;
  }

  @keyframes backdrop-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-slide-in {
    from { 
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .modal-container {
      @apply mx-2 max-h-[95vh];
    }

    .modal-body {
      @apply flex-col h-auto max-h-[500px];
    }

    .controls-column {
      @apply border-r-0 border-b border-gray-700;
    }

    .tab-nav {
      @apply grid grid-cols-3;
    }

    .tab-button {
      @apply px-2 py-2 text-xs;
    }

    .preview-container {
      @apply p-3;
    }
  }
</style>