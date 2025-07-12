<!-- SenseCanvas: Widget Configurator Example -->
<!-- Demonstrates modal configurator with tabs for Library, AI Generate, and Create Custom -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';
  import type { WidgetConfig, WidgetType } from '../types/widget.js';
  import LibraryTab from './tabs/LibraryTab.svelte';
  import AiGenerateTab from './tabs/AiGenerateTab.svelte';
  import CreateCustomTab from './tabs/CreateCustomTab.svelte';
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

  // Tab management with Svelte 5 runes
  let activeTab = $state<'library' | 'ai-generate' | 'create-custom'>('library');
  let isValid = $state(false);
  let validationErrors = $state<string[]>([]);

  // Widget configuration state
  let widgetConfig = $state<Partial<WidgetConfig>>({
    id: '',
    type: 'gauge',
    title: '',
    sensorType: 'cpu',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    style: {
      theme: 'default',
      colors: ['#00ff88', '#ff6b6b'],
      opacity: 1,
      borderRadius: 8
    },
    alerts: {
      enabled: false,
      thresholds: {
        warning: 75,
        critical: 90
      }
    }
  });

  // Validation schema using Zod
  const widgetConfigSchema = z.object({
    id: z.string().min(1, 'Widget ID is required'),
    type: z.enum(['gauge', 'graph', 'text', 'multi-sensor']),
    title: z.string().min(1, 'Title is required'),
    sensorType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']),
    position: z.object({
      x: z.number().min(0),
      y: z.number().min(0)
    }),
    size: z.object({
      width: z.number().min(100).max(800),
      height: z.number().min(100).max(600)
    }),
    style: z.object({
      theme: z.string(),
      colors: z.array(z.string()),
      opacity: z.number().min(0).max(1),
      borderRadius: z.number().min(0)
    }),
    alerts: z.object({
      enabled: z.boolean(),
      thresholds: z.object({
        warning: z.number().min(0).max(100),
        critical: z.number().min(0).max(100)
      })
    })
  });

  // Reactive validation
  $effect(() => {
    const result = widgetConfigSchema.safeParse(widgetConfig);
    isValid = result.success;
    validationErrors = result.success ? [] : result.error.errors.map(e => e.message);
  });

  // Initialize with editing widget if provided
  $effect(() => {
    if (editingWidget) {
      widgetConfig = { ...editingWidget };
      activeTab = 'create-custom';
    }
  });

  // Handle tab switching
  function switchTab(tab: 'library' | 'ai-generate' | 'create-custom') {
    activeTab = tab;
  }

  // Handle widget selection from library
  function handleLibrarySelection(widget: WidgetConfig) {
    widgetConfig = { ...widget, id: generateId() };
    activeTab = 'create-custom';
  }

  // Handle AI generated widget
  function handleAiGenerated(widget: Partial<WidgetConfig>) {
    widgetConfig = { ...widgetConfig, ...widget, id: generateId() };
    activeTab = 'create-custom';
  }

  // Handle configuration changes
  function handleConfigChange(newConfig: Partial<WidgetConfig>) {
    widgetConfig = { ...widgetConfig, ...newConfig };
  }

  // Generate unique ID
  function generateId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export widget configuration as JSON
  function exportConfig() {
    const configJson = JSON.stringify(widgetConfig, null, 2);
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
        const validatedConfig = widgetConfigSchema.parse(config);
        widgetConfig = validatedConfig;
        activeTab = 'create-custom';
      } catch (error) {
        console.error('Invalid widget configuration:', error);
        alert('Invalid widget configuration file');
      }
    };
    reader.readAsText(file);
  }

  // Handle save/add widget
  function handleSave() {
    if (!isValid) return;

    const finalConfig = widgetConfigSchema.parse(widgetConfig);
    
    if (editingWidget) {
      dispatch('widgetUpdated', finalConfig);
    } else {
      dispatch('widgetAdded', finalConfig);
    }
    
    onClose();
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      handleSave();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div class="modal-backdrop" on:click={onClose} role="dialog" aria-modal="true">
    <div class="modal-container" on:click|stopPropagation>
      <!-- Modal header -->
      <div class="modal-header">
        <h2 class="modal-title">
          {editingWidget ? 'Edit Widget' : 'Add Widget'}
        </h2>
        <button class="close-button" on:click={onClose} aria-label="Close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
              on:click={() => switchTab('library')}
            >
              Library
            </button>
            <button
              class="tab-button"
              class:active={activeTab === 'ai-generate'}
              on:click={() => switchTab('ai-generate')}
            >
              AI Generate
            </button>
            <button
              class="tab-button"
              class:active={activeTab === 'create-custom'}
              on:click={() => switchTab('create-custom')}
            >
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
            <div class="preview-actions">
              <button class="action-button" on:click={exportConfig}>
                Export JSON
              </button>
              <label class="action-button">
                Import JSON
                <input type="file" accept=".json" on:change={importConfig} hidden />
              </label>
            </div>
          </div>
          
          <div class="preview-container">
            <WidgetPreview config={widgetConfig} />
          </div>
        </div>
      </div>

      <!-- Modal footer -->
      <div class="modal-footer">
        <div class="validation-status">
          {#if !isValid && validationErrors.length > 0}
            <div class="validation-errors">
              {#each validationErrors as error}
                <span class="error-message">{error}</span>
              {/each}
            </div>
          {/if}
        </div>
        
        <div class="footer-actions">
          <button class="cancel-button" on:click={onClose}>
            Cancel
          </button>
          <button 
            class="save-button" 
            on:click={handleSave}
            disabled={!isValid}
          >
            {editingWidget ? 'Update Widget' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  }

  .modal-container {
    @apply bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden;
    margin: 2rem;
  }

  .modal-header {
    @apply flex items-center justify-between p-6 border-b border-gray-200;
  }

  .modal-title {
    @apply text-xl font-semibold text-gray-900;
  }

  .close-button {
    @apply text-gray-400 hover:text-gray-600 transition-colors;
  }

  .modal-body {
    @apply flex h-96 min-h-[500px];
  }

  .controls-column {
    @apply flex-1 border-r border-gray-200;
  }

  .tab-nav {
    @apply flex border-b border-gray-200;
  }

  .tab-button {
    @apply px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors;
  }

  .tab-button.active {
    @apply text-blue-600 border-blue-500;
  }

  .tab-content {
    @apply p-6 overflow-y-auto;
    height: calc(100% - 48px);
  }

  .preview-column {
    @apply flex-1 flex flex-col;
  }

  .preview-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .preview-actions {
    @apply flex gap-2;
  }

  .action-button {
    @apply px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer;
  }

  .preview-container {
    @apply flex-1 p-6 bg-gray-50 overflow-auto;
  }

  .modal-footer {
    @apply flex items-center justify-between p-6 border-t border-gray-200;
  }

  .validation-errors {
    @apply flex flex-col gap-1;
  }

  .error-message {
    @apply text-sm text-red-600;
  }

  .footer-actions {
    @apply flex gap-3;
  }

  .cancel-button {
    @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
  }

  .save-button {
    @apply px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
  }
</style> 