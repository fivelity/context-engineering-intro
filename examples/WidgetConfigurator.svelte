<!--
Widget Configurator Modal Component
Main configurator modal with two-column layout (controls + live preview)
Features: Library, AI Generate, and Create Custom tabs
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { Frame, Button, Input, Select, ColorPicker, Slider, Tabs, TabPanel } from 'cosmic-ui';
  import { Plus, X, Download, Upload, Wand2, Settings, Eye } from 'lucide-svelte';
  import WidgetWrapper from './WidgetWrapper.svelte';
  import AIGenerateTab from './AIGenerateTab.svelte';
  import WidgetLibrary from './WidgetLibrary.svelte';
  import { validateWidgetConfig, type CompleteWidget, type WidgetPreset } from './widget-schemas';
  import { generateWidget, type AIGenerationRequest } from './ai-widget-generation';
  import { sensorDataStore, availableSensors } from './sensor-data-store';
  
  // Props
  interface Props {
    isOpen: boolean;
    editingWidget?: CompleteWidget;
    onClose: () => void;
    onSave: (widget: CompleteWidget) => void;
    onAddFromLibrary: (preset: WidgetPreset) => void;
  }
  
  let { isOpen, editingWidget, onClose, onSave, onAddFromLibrary }: Props = $props();
  
  // Reactive state using Svelte 5 runes
  let activeTab = $state<'library' | 'ai-generate' | 'create-custom'>('library');
  let activeCustomTab = $state<'general' | 'style' | 'alerts'>('general');
  
  // Widget configuration state
  let widgetConfig = $state<CompleteWidget>({
    id: crypto.randomUUID(),
    title: 'New Widget',
    displayType: 'gauge',
    orientation: 'vertical',
    position: { x: 0, y: 0, width: 200, height: 200 },
    sensors: [],
    theme: 'gaming',
    style: {
      appearance: {
        style: 'circular',
        primaryColor: '#00ff88',
        thickness: 4,
        width: 2
      },
      typography: {
        showValue: true,
        showLabel: true,
        valueColor: '#ffffff',
        labelColor: '#00ff88'
      }
    },
    alerts: {
      enabled: false,
      thresholds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // AI generation state
  let aiPrompt = $state('');
  let aiGenerating = $state(false);
  let aiVariations = $state<any[]>([]);
  let selectedVariation = $state<number | null>(null);
  
  // Load editing widget if provided
  $effect(() => {
    if (editingWidget) {
      widgetConfig = { ...editingWidget };
      activeTab = 'create-custom';
    }
  });
  
  // Derived preview config for live updates
  let previewConfig = $derived({
    ...widgetConfig,
    // Add real-time sensor data for preview
    sensorData: widgetConfig.sensors.map(sensorId => {
      const sensor = $sensorDataStore.find(s => s.id === sensorId);
      return sensor ? {
        value: sensor.value,
        unit: sensor.unit,
        min: sensor.min,
        max: sensor.max
      } : null;
    }).filter(Boolean)
  });
  
  // Handle tab switching
  function switchTab(tab: typeof activeTab) {
    activeTab = tab;
    
    // Reset AI state when switching away from AI tab
    if (tab !== 'ai-generate') {
      aiVariations = [];
      selectedVariation = null;
    }
  }
  
  // Handle AI generation
  async function handleAIGeneration() {
    if (!aiPrompt.trim()) return;
    
    aiGenerating = true;
    
    try {
      const request: AIGenerationRequest = {
        prompt: aiPrompt,
        context: {
          availableSensors: $availableSensors,
          currentTheme: widgetConfig.theme || 'gaming',
          dashboardState: {
            widgets: [], // Would be populated from dashboard context
            screenSize: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          }
        },
        options: {
          creativity: 0.7,
          model: 'gemini-1.5-pro',
          maxVariations: 3,
          includeCustomSvg: false
        }
      };
      
      const response = await generateWidget(request);
      
      if (response.success) {
        aiVariations = response.variations;
        selectedVariation = 0;
        
        // Apply first variation to preview
        if (aiVariations.length > 0) {
          widgetConfig = {
            ...widgetConfig,
            ...aiVariations[0].config,
            id: widgetConfig.id,
            createdAt: widgetConfig.createdAt,
            updatedAt: new Date()
          };
        }
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      aiGenerating = false;
    }
  }
  
  // Handle AI variation selection
  function selectAIVariation(index: number) {
    selectedVariation = index;
    const variation = aiVariations[index];
    
    if (variation) {
      widgetConfig = {
        ...widgetConfig,
        ...variation.config,
        id: widgetConfig.id,
        createdAt: widgetConfig.createdAt,
        updatedAt: new Date()
      };
    }
  }
  
  // Handle applying AI result and switching to custom tab
  function applyAIAndEdit() {
    activeTab = 'create-custom';
    activeCustomTab = 'general';
  }
  
  // Handle widget save
  function handleSave() {
    try {
      const validatedConfig = validateWidgetConfig(widgetConfig);
      onSave(validatedConfig);
      onClose();
    } catch (error) {
      console.error('Widget validation failed:', error);
    }
  }
  
  // Handle preset selection from library
  function handlePresetSelect(preset: WidgetPreset) {
    onAddFromLibrary(preset);
    onClose();
  }
  
  // Handle edit from library
  function handleEditFromLibrary(preset: WidgetPreset) {
    widgetConfig = {
      ...widgetConfig,
      ...preset.config,
      id: widgetConfig.id,
      createdAt: widgetConfig.createdAt,
      updatedAt: new Date()
    };
    activeTab = 'create-custom';
    activeCustomTab = 'general';
  }
  
  // Handle JSON export
  function handleExport() {
    const exportData = {
      type: 'widget',
      version: '1.0.0',
      data: widgetConfig,
      metadata: {
        exportedAt: new Date(),
        description: `Widget: ${widgetConfig.title}`
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widgetConfig.title.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Handle JSON import
  function handleImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        const validatedConfig = validateWidgetConfig(importData.data);
        
        widgetConfig = {
          ...validatedConfig,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        activeTab = 'create-custom';
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
  }
  
  // Keyboard shortcuts
  onMount(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        handleSave();
      } else if (e.key === 'Tab' && e.ctrlKey) {
        e.preventDefault();
        const tabs = ['library', 'ai-generate', 'create-custom'] as const;
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        switchTab(tabs[nextIndex]);
      }
    }
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- Modal backdrop -->
{#if isOpen}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
      <Frame 
        type="enhanced" 
        glowEffect={true}
        class="w-full h-full bg-gray-900/95 border border-cyan-500/30"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <h2 class="text-xl font-bold text-cyan-100">Widget Configurator</h2>
          
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onclick={handleExport}
              class="text-cyan-400 hover:text-cyan-300"
            >
              <Download size={16} />
              Export
            </Button>
            
            <label class="cursor-pointer">
              <input
                type="file"
                accept=".json"
                class="hidden"
                onchange={handleImport}
              />
              <Button
                variant="ghost"
                size="sm"
                class="text-cyan-400 hover:text-cyan-300"
              >
                <Upload size={16} />
                Import
              </Button>
            </label>
            
            <Button
              variant="ghost"
              size="sm"
              onclick={onClose}
              class="text-red-400 hover:text-red-300"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        
        <!-- Main content - Two column layout -->
        <div class="flex h-full">
          <!-- Left Column - Controls -->
          <div class="w-1/2 border-r border-cyan-500/20 overflow-y-auto">
            <div class="h-full">
              <!-- Tab Navigation -->
              <div class="flex border-b border-cyan-500/20">
                <button
                  class="px-4 py-2 text-sm font-medium transition-colors"
                  class:text-cyan-400={activeTab === 'library'}
                  class:text-gray-400={activeTab !== 'library'}
                  class:border-b-2={activeTab === 'library'}
                  class:border-cyan-400={activeTab === 'library'}
                  onclick={() => switchTab('library')}
                >
                  Library
                </button>
                
                <button
                  class="px-4 py-2 text-sm font-medium transition-colors"
                  class:text-cyan-400={activeTab === 'ai-generate'}
                  class:text-gray-400={activeTab !== 'ai-generate'}
                  class:border-b-2={activeTab === 'ai-generate'}
                  class:border-cyan-400={activeTab === 'ai-generate'}
                  onclick={() => switchTab('ai-generate')}
                >
                  <Wand2 size={14} class="inline mr-1" />
                  AI Generate
                </button>
                
                <button
                  class="px-4 py-2 text-sm font-medium transition-colors"
                  class:text-cyan-400={activeTab === 'create-custom'}
                  class:text-gray-400={activeTab !== 'create-custom'}
                  class:border-b-2={activeTab === 'create-custom'}
                  class:border-cyan-400={activeTab === 'create-custom'}
                  onclick={() => switchTab('create-custom')}
                >
                  <Settings size={14} class="inline mr-1" />
                  Create Custom
                </button>
              </div>
              
              <!-- Tab Content -->
              <div class="p-4 h-full overflow-y-auto">
                {#if activeTab === 'library'}
                  <WidgetLibrary
                    onSelect={handlePresetSelect}
                    onEdit={handleEditFromLibrary}
                  />
                  
                {:else if activeTab === 'ai-generate'}
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-cyan-200 mb-2">
                        Describe your widget
                      </label>
                      <textarea
                        bind:value={aiPrompt}
                        placeholder="Generate a cyberpunk arc gauge for GPU temp with RGB gradients and fan alert"
                        class="w-full h-24 px-3 py-2 bg-gray-800 border border-cyan-500/30 rounded-md text-cyan-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                      />
                    </div>
                    
                    <Button
                      onclick={handleAIGeneration}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                    >
                      {#if aiGenerating}
                        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating...
                      {:else}
                        <Wand2 size={16} class="mr-2" />
                        Generate Widget
                      {/if}
                    </Button>
                    
                    {#if aiVariations.length > 0}
                      <div class="space-y-3">
                        <h4 class="font-medium text-cyan-200">AI Suggestions</h4>
                        {#each aiVariations as variation, index}
                          <div
                            class="p-3 border rounded-md cursor-pointer transition-colors"
                            class:border-cyan-500={selectedVariation === index}
                            class:bg-cyan-500/10={selectedVariation === index}
                            class:border-gray-600={selectedVariation !== index}
                            onclick={() => selectAIVariation(index)}
                          >
                            <div class="flex justify-between items-start">
                              <div>
                                <p class="text-sm font-medium text-cyan-100">
                                  {variation.config.title}
                                </p>
                                <p class="text-xs text-gray-400 mt-1">
                                  {variation.reasoning}
                                </p>
                              </div>
                              <div class="text-xs text-cyan-400">
                                {Math.round(variation.confidence * 100)}%
                              </div>
                            </div>
                          </div>
                        {/each}
                        
                        <Button
                          onclick={applyAIAndEdit}
                          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
                        >
                          <Settings size={16} class="mr-2" />
                          Apply & Edit
                        </Button>
                      </div>
                    {/if}
                  </div>
                  
                {:else if activeTab === 'create-custom'}
                  <!-- Custom tab content with accordion sub-tabs -->
                  <div class="space-y-4">
                    <!-- Sub-tab navigation -->
                    <div class="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                      <button
                        class="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors"
                        class:bg-cyan-500={activeCustomTab === 'general'}
                        class:text-white={activeCustomTab === 'general'}
                        class:text-gray-400={activeCustomTab !== 'general'}
                        onclick={() => activeCustomTab = 'general'}
                      >
                        General
                      </button>
                      <button
                        class="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors"
                        class:bg-cyan-500={activeCustomTab === 'style'}
                        class:text-white={activeCustomTab === 'style'}
                        class:text-gray-400={activeCustomTab !== 'style'}
                        onclick={() => activeCustomTab = 'style'}
                      >
                        Style
                      </button>
                      <button
                        class="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors"
                        class:bg-cyan-500={activeCustomTab === 'alerts'}
                        class:text-white={activeCustomTab === 'alerts'}
                        class:text-gray-400={activeCustomTab !== 'alerts'}
                        onclick={() => activeCustomTab = 'alerts'}
                      >
                        Alerts
                      </button>
                    </div>
                    
                    <!-- Sub-tab content -->
                    {#if activeCustomTab === 'general'}
                      <div class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Widget Title
                          </label>
                          <Input
                            bind:value={widgetConfig.title}
                            placeholder="Enter widget title"
                            class="w-full"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Display Type
                          </label>
                          <Select
                            bind:value={widgetConfig.displayType}
                            options={[
                              { value: 'gauge', label: 'Gauge' },
                              { value: 'graph', label: 'Graph' },
                              { value: 'simple', label: 'Simple' },
                              { value: 'meter', label: 'Meter' },
                              { value: 'multi-resource', label: 'Multi-Resource' }
                            ]}
                            class="w-full"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Data Source
                          </label>
                          <Select
                            bind:value={widgetConfig.sensors}
                            options={$availableSensors.map(sensor => ({
                              value: sensor.id,
                              label: `${sensor.name} (${sensor.unit})`
                            }))}
                            multiple={widgetConfig.displayType === 'multi-resource'}
                            class="w-full"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Orientation
                          </label>
                          <Select
                            bind:value={widgetConfig.orientation}
                            options={[
                              { value: 'vertical', label: 'Vertical' },
                              { value: 'horizontal', label: 'Horizontal' }
                            ]}
                            class="w-full"
                          />
                        </div>
                      </div>
                      
                    {:else if activeCustomTab === 'style'}
                      <div class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Primary Color
                          </label>
                          <ColorPicker
                            bind:value={widgetConfig.style.appearance.primaryColor}
                            class="w-full"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-cyan-200 mb-2">
                            Thickness: {widgetConfig.style.appearance.thickness}
                          </label>
                          <Slider
                            bind:value={widgetConfig.style.appearance.thickness}
                            min={1}
                            max={20}
                            step={1}
                            class="w-full"
                          />
                        </div>
                        
                        <!-- Additional style controls would go here -->
                      </div>
                      
                    {:else if activeCustomTab === 'alerts'}
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <label class="text-sm font-medium text-cyan-200">
                            Enable Alerts
                          </label>
                          <input
                            type="checkbox"
                            bind:checked={widgetConfig.alerts.enabled}
                            class="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                          />
                        </div>
                        
                        {#if widgetConfig.alerts.enabled}
                          <div class="space-y-3">
                            <h4 class="font-medium text-cyan-200">Thresholds</h4>
                            <!-- Threshold configuration would go here -->
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Right Column - Live Preview -->
          <div class="w-1/2 p-4 bg-gray-800/30">
            <div class="h-full flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-cyan-200">
                  <Eye size={16} class="inline mr-2" />
                  Live Preview
                </h3>
                <div class="text-xs text-gray-400">
                  {widgetConfig.displayType} • {widgetConfig.orientation}
                </div>
              </div>
              
              <div class="flex-1 flex items-center justify-center">
                <div class="max-w-md w-full">
                  <WidgetWrapper
                    config={previewConfig}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-between p-4 border-t border-cyan-500/20">
          <div class="text-xs text-gray-400">
            Last updated: {new Date(widgetConfig.updatedAt).toLocaleString()}
          </div>
          
          <div class="flex gap-2">
            <Button
              variant="ghost"
              onclick={onClose}
              class="text-gray-400 hover:text-gray-300"
            >
              Cancel
            </Button>
            
            <Button
              onclick={handleSave}
              class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              <Plus size={16} class="mr-2" />
              {editingWidget ? 'Update Widget' : 'Add Widget'}
            </Button>
          </div>
        </div>
      </Frame>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar styles */
  :global(.overflow-y-auto::-webkit-scrollbar) {
    width: 6px;
  }
  
  :global(.overflow-y-auto::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.1);
  }
  
  :global(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: rgba(34, 197, 94, 0.3);
    border-radius: 3px;
  }
  
  :global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: rgba(34, 197, 94, 0.5);
  }
</style> 