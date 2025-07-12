<!--
SenseCanvas Create Custom Widget Tab Component
Manual widget configuration with form controls for all properties.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { WidgetConfigSchema, type WidgetConfig } from '../../types/widgets.js';

  interface Props {
    config: Partial<WidgetConfig>;
    onChange: (config: Partial<WidgetConfig>) => void;
    validationErrors: string[];
  }

  let { config, onChange, validationErrors }: Props = $props();

  const dispatch = createEventDispatcher();

  // ✅ Using Svelte 5 runes for form state
  let activeSection = $state<'basic' | 'appearance' | 'behavior' | 'advanced'>('basic');
  let colorPickerOpen = $state<string | null>(null);
  let presetTemplates = $state([
    {
      name: 'Gaming CPU Gauge',
      config: {
        type: 'gauge',
        title: 'CPU Load',
        sensorType: 'cpu',
        style: {
          theme: 'gaming',
          colors: ['#22c55e', '#eab308', '#dc2626'],
          borderRadius: 16
        },
        gaugeConfig: {
          minValue: 0,
          maxValue: 100,
          startAngle: -120,
          endAngle: 120,
          arcWidth: 15
        }
      }
    },
    {
      name: 'Minimal Memory Display',
      config: {
        type: 'text',
        title: 'RAM Usage',
        sensorType: 'memory',
        style: {
          theme: 'minimal',
          colors: ['#6b7280'],
          borderRadius: 4
        },
        textConfig: {
          format: '{value}% used',
          fontSize: 16,
          alignment: 'center'
        }
      }
    },
    {
      name: 'Cyberpunk System Overview',
      config: {
        type: 'multi-sensor',
        title: 'System Status',
        sensorType: 'cpu',
        style: {
          theme: 'cyberpunk',
          colors: ['#a855f7', '#ec4899', '#06b6d4'],
          borderRadius: 8
        },
        multiSensorConfig: {
          sensors: ['cpu', 'gpu', 'memory'],
          layout: 'grid'
        }
      }
    }
  ]);

  // Configuration options
  const widgetTypes = [
    { value: 'gauge', label: 'Gauge', description: 'Circular progress indicator' },
    { value: 'graph', label: 'Graph', description: 'Time-series chart' },
    { value: 'text', label: 'Text', description: 'Text display' },
    { value: 'multi-sensor', label: 'Multi-Sensor', description: 'Multiple sensors' }
  ];

  const sensorTypes = [
    { value: 'cpu', label: 'CPU', icon: '🖥️' },
    { value: 'gpu', label: 'GPU', icon: '🎮' },
    { value: 'memory', label: 'Memory', icon: '🧠' },
    { value: 'storage', label: 'Storage', icon: '💾' },
    { value: 'network', label: 'Network', icon: '🌐' }
  ];

  const themes = [
    { value: 'default', label: 'Default', description: 'Clean and modern' },
    { value: 'cyberpunk', label: 'Cyberpunk', description: 'Neon and futuristic' },
    { value: 'gaming', label: 'Gaming', description: 'RGB and dynamic' },
    { value: 'minimal', label: 'Minimal', description: 'Simple and clean' },
    { value: 'rgb', label: 'RGB', description: 'Colorful and vibrant' }
  ];

  // ✅ Derived validation state
  let sectionValidation = $derived(() => {
    const errors = validationErrors.reduce((acc, error) => {
      if (error.includes('title') || error.includes('type') || error.includes('sensorType')) {
        acc.basic.push(error);
      } else if (error.includes('style') || error.includes('colors')) {
        acc.appearance.push(error);
      } else if (error.includes('alerts') || error.includes('Config')) {
        acc.behavior.push(error);
      } else {
        acc.advanced.push(error);
      }
      return acc;
    }, { basic: [], appearance: [], behavior: [], advanced: [] } as Record<string, string[]>);
    
    return errors;
  });

  let isValidSection = $derived(() => {
    return {
      basic: sectionValidation.basic.length === 0,
      appearance: sectionValidation.appearance.length === 0,
      behavior: sectionValidation.behavior.length === 0,
      advanced: sectionValidation.advanced.length === 0
    };
  });

  // Update configuration
  function updateConfig(updates: Partial<WidgetConfig>) {
    onChange({ ...config, ...updates });
  }

  function updateStyle(styleUpdates: Partial<WidgetConfig['style']>) {
    updateConfig({
      style: { ...config.style, ...styleUpdates }
    });
  }

  function updateGaugeConfig(gaugeUpdates: Partial<WidgetConfig['gaugeConfig']>) {
    updateConfig({
      gaugeConfig: { ...config.gaugeConfig, ...gaugeUpdates }
    });
  }

  function updateGraphConfig(graphUpdates: Partial<WidgetConfig['graphConfig']>) {
    updateConfig({
      graphConfig: { ...config.graphConfig, ...graphUpdates }
    });
  }

  function updateTextConfig(textUpdates: Partial<WidgetConfig['textConfig']>) {
    updateConfig({
      textConfig: { ...config.textConfig, ...textUpdates }
    });
  }

  function updateMultiSensorConfig(multiUpdates: Partial<WidgetConfig['multiSensorConfig']>) {
    updateConfig({
      multiSensorConfig: { ...config.multiSensorConfig, ...multiUpdates }
    });
  }

  function updateAlerts(alertUpdates: Partial<WidgetConfig['alerts']>) {
    updateConfig({
      alerts: { ...config.alerts, ...alertUpdates }
    });
  }

  // Color management
  function addColor() {
    const colors = config.style?.colors || [];
    updateStyle({
      colors: [...colors, '#22d3ee']
    });
  }

  function removeColor(index: number) {
    const colors = config.style?.colors || [];
    updateStyle({
      colors: colors.filter((_, i) => i !== index)
    });
  }

  function updateColor(index: number, color: string) {
    const colors = config.style?.colors || [];
    const newColors = [...colors];
    newColors[index] = color;
    updateStyle({ colors: newColors });
  }

  // Apply preset template
  function applyTemplate(template: any) {
    if (confirm(`Apply "${template.name}" template? This will overwrite current settings.`)) {
      onChange({ ...config, ...template.config });
    }
  }

  // Reset to defaults
  function resetToDefaults() {
    if (confirm('Reset all settings to defaults?')) {
      onChange({
        id: config.id || '',
        type: 'gauge',
        title: '',
        sensorType: 'cpu',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        style: {
          theme: 'default',
          colors: ['#22d3ee', '#ef4444', '#f59e0b'],
          opacity: 1,
          borderRadius: 8
        }
      });
    }
  }
</script>

<div class="create-custom-tab">
  <!-- Section Navigation -->
  <div class="section-nav">
    <button 
      class="nav-btn"
      class:active={activeSection === 'basic'}
      class:has-errors={!isValidSection.basic}
      onclick={() => activeSection = 'basic'}
    >
      <span class="nav-icon">📋</span>
      <span class="nav-text">Basic</span>
      {#if !isValidSection.basic}
        <span class="error-indicator">!</span>
      {/if}
    </button>
    
    <button 
      class="nav-btn"
      class:active={activeSection === 'appearance'}
      class:has-errors={!isValidSection.appearance}
      onclick={() => activeSection = 'appearance'}
    >
      <span class="nav-icon">🎨</span>
      <span class="nav-text">Appearance</span>
      {#if !isValidSection.appearance}
        <span class="error-indicator">!</span>
      {/if}
    </button>
    
    <button 
      class="nav-btn"
      class:active={activeSection === 'behavior'}
      class:has-errors={!isValidSection.behavior}
      onclick={() => activeSection = 'behavior'}
    >
      <span class="nav-icon">⚙️</span>
      <span class="nav-text">Behavior</span>
      {#if !isValidSection.behavior}
        <span class="error-indicator">!</span>
      {/if}
    </button>
    
    <button 
      class="nav-btn"
      class:active={activeSection === 'advanced'}
      class:has-errors={!isValidSection.advanced}
      onclick={() => activeSection = 'advanced'}
    >
      <span class="nav-icon">🔧</span>
      <span class="nav-text">Advanced</span>
      {#if !isValidSection.advanced}
        <span class="error-indicator">!</span>
      {/if}
    </button>
  </div>

  <!-- Section Content -->
  <div class="section-content">
    {#if activeSection === 'basic'}
      <div class="config-section">
        <h3 class="section-title">Basic Configuration</h3>
        
        <!-- Widget Type -->
        <div class="form-group">
          <label class="form-label">Widget Type</label>
          <div class="type-selector">
            {#each widgetTypes as type}
              <button 
                class="type-option"
                class:selected={config.type === type.value}
                onclick={() => updateConfig({ type: type.value })}
                title={type.description}
              >
                <span class="type-name">{type.label}</span>
                <span class="type-desc">{type.description}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Widget Title -->
        <div class="form-group">
          <label class="form-label" for="widget-title">Widget Title</label>
          <input 
            id="widget-title"
            type="text" 
            class="form-input"
            bind:value={config.title}
            placeholder="Enter widget title..."
            maxlength="50"
          />
          <div class="field-hint">Max 50 characters</div>
        </div>

        <!-- Sensor Type -->
        <div class="form-group">
          <label class="form-label">Sensor Type</label>
          <div class="sensor-selector">
            {#each sensorTypes as sensor}
              <button 
                class="sensor-option"
                class:selected={config.sensorType === sensor.value}
                onclick={() => updateConfig({ sensorType: sensor.value })}
              >
                <span class="sensor-icon">{sensor.icon}</span>
                <span class="sensor-label">{sensor.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Size Configuration -->
        <div class="form-group">
          <label class="form-label">Size</label>
          <div class="size-controls">
            <div class="size-input">
              <label>Width</label>
              <input 
                type="number" 
                class="form-input small"
                bind:value={config.size.width}
                min="100" 
                max="800"
              />
            </div>
            <div class="size-input">
              <label>Height</label>
              <input 
                type="number" 
                class="form-input small"
                bind:value={config.size.height}
                min="100" 
                max="600"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeSection === 'appearance'}
      <div class="config-section">
        <h3 class="section-title">Appearance</h3>

        <!-- Theme Selection -->
        <div class="form-group">
          <label class="form-label">Theme</label>
          <div class="theme-selector">
            {#each themes as theme}
              <button 
                class="theme-option"
                class:selected={config.style?.theme === theme.value}
                onclick={() => updateStyle({ theme: theme.value })}
                title={theme.description}
              >
                <span class="theme-name">{theme.label}</span>
                <span class="theme-desc">{theme.description}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Color Palette -->
        <div class="form-group">
          <label class="form-label">Color Palette</label>
          <div class="color-palette">
            {#each (config.style?.colors || []) as color, index}
              <div class="color-item">
                <input 
                  type="color" 
                  class="color-picker"
                  bind:value={color}
                  oninput={(e) => updateColor(index, e.target.value)}
                />
                <button 
                  class="remove-color"
                  onclick={() => removeColor(index)}
                  disabled={(config.style?.colors || []).length <= 1}
                >
                  ×
                </button>
              </div>
            {/each}
            <button class="add-color" onclick={addColor}>+</button>
          </div>
        </div>

        <!-- Styling Options -->
        <div class="form-group">
          <label class="form-label">Styling</label>
          <div class="styling-controls">
            <div class="control-group">
              <label>Opacity</label>
              <input 
                type="range" 
                class="range-input"
                bind:value={config.style.opacity}
                min="0.1" 
                max="1" 
                step="0.1"
              />
              <span class="range-value">{Math.round((config.style?.opacity || 1) * 100)}%</span>
            </div>
            
            <div class="control-group">
              <label>Border Radius</label>
              <input 
                type="range" 
                class="range-input"
                bind:value={config.style.borderRadius}
                min="0" 
                max="50" 
                step="1"
              />
              <span class="range-value">{config.style?.borderRadius || 0}px</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeSection === 'behavior'}
      <div class="config-section">
        <h3 class="section-title">Behavior & Alerts</h3>

        <!-- Alert Configuration -->
        <div class="form-group">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="checkbox-input"
                bind:checked={config.alerts.enabled}
              />
              <span class="checkbox-text">Enable Alerts</span>
            </label>
          </div>
        </div>

        {#if config.alerts?.enabled}
          <div class="alert-config">
            <div class="form-group">
              <label class="form-label">Warning Threshold</label>
              <input 
                type="number" 
                class="form-input"
                bind:value={config.alerts.thresholds.warning}
                min="0" 
                max="100"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Critical Threshold</label>
              <input 
                type="number" 
                class="form-input"
                bind:value={config.alerts.thresholds.critical}
                min="0" 
                max="100"
              />
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  class="checkbox-input"
                  bind:checked={config.alerts.showNotifications}
                />
                <span class="checkbox-text">Show Notifications</span>
              </label>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  class="checkbox-input"
                  bind:checked={config.alerts.flashWidget}
                />
                <span class="checkbox-text">Flash Widget on Alert</span>
              </label>
            </div>
          </div>
        {/if}

        <!-- Type-specific Configuration -->
        {#if config.type === 'gauge' && config.gaugeConfig}
          <div class="type-config">
            <h4 class="config-subtitle">Gauge Settings</h4>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Min Value</label>
                <input 
                  type="number" 
                  class="form-input"
                  bind:value={config.gaugeConfig.minValue}
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Max Value</label>
                <input 
                  type="number" 
                  class="form-input"
                  bind:value={config.gaugeConfig.maxValue}
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Arc Width</label>
                <input 
                  type="number" 
                  class="form-input"
                  bind:value={config.gaugeConfig.arcWidth}
                  min="1" 
                  max="50"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Unit</label>
                <input 
                  type="text" 
                  class="form-input"
                  bind:value={config.gaugeConfig.unit}
                  placeholder="e.g., %, °C, MB/s"
                />
              </div>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  class="checkbox-input"
                  bind:checked={config.gaugeConfig.showValue}
                />
                <span class="checkbox-text">Show Value</span>
              </label>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  class="checkbox-input"
                  bind:checked={config.gaugeConfig.showTicks}
                />
                <span class="checkbox-text">Show Tick Marks</span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if activeSection === 'advanced'}
      <div class="config-section">
        <h3 class="section-title">Advanced Settings</h3>

        <!-- Preset Templates -->
        <div class="form-group">
          <label class="form-label">Preset Templates</label>
          <div class="template-grid">
            {#each presetTemplates as template}
              <button 
                class="template-card"
                onclick={() => applyTemplate(template)}
              >
                <span class="template-name">{template.name}</span>
                <span class="template-type">{template.config.type}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Actions -->
        <div class="form-group">
          <label class="form-label">Actions</label>
          <div class="action-buttons">
            <button class="action-btn danger" onclick={resetToDefaults}>
              🔄 Reset to Defaults
            </button>
          </div>
        </div>

        <!-- Validation Errors -->
        {#if validationErrors.length > 0}
          <div class="form-group">
            <label class="form-label">Validation Errors</label>
            <div class="error-list">
              {#each validationErrors as error}
                <div class="error-item">{error}</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .create-custom-tab {
    @apply h-full flex flex-col;
  }

  .section-nav {
    @apply flex border-b border-gray-700 bg-gray-800/50;
  }

  .nav-btn {
    @apply flex-1 flex items-center justify-center gap-2 px-3 py-3;
    @apply text-sm font-medium text-gray-400 border-b-2 border-transparent;
    @apply hover:text-cyan-400 hover:border-cyan-400/50 transition-colors;
    @apply relative;
  }

  .nav-btn.active {
    @apply text-cyan-400 border-cyan-400 bg-gray-700/50;
  }

  .nav-btn.has-errors {
    @apply text-red-400 border-red-400/50;
  }

  .nav-icon {
    @apply text-lg;
  }

  .nav-text {
    @apply hidden sm:block;
  }

  .error-indicator {
    @apply absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full;
    @apply text-xs text-white flex items-center justify-center;
  }

  .section-content {
    @apply flex-1 overflow-y-auto p-4;
  }

  .config-section {
    @apply space-y-6;
  }

  .section-title {
    @apply text-lg font-bold text-cyan-400 mb-4;
  }

  .config-subtitle {
    @apply text-md font-bold text-gray-300 mb-3;
  }

  .form-group {
    @apply space-y-2;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-300;
  }

  .form-input {
    @apply w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg;
    @apply text-white placeholder-gray-400;
    @apply focus:border-cyan-400 focus:outline-none;
  }

  .form-input.small {
    @apply w-20;
  }

  .field-hint {
    @apply text-xs text-gray-400;
  }

  .type-selector,
  .theme-selector {
    @apply grid grid-cols-1 sm:grid-cols-2 gap-2;
  }

  .type-option,
  .theme-option {
    @apply p-3 border border-gray-600 rounded-lg text-left;
    @apply hover:border-cyan-400/50 transition-colors;
  }

  .type-option.selected,
  .theme-option.selected {
    @apply border-cyan-400 bg-cyan-500/20;
  }

  .type-name,
  .theme-name {
    @apply block font-medium text-gray-300;
  }

  .type-desc,
  .theme-desc {
    @apply block text-xs text-gray-400;
  }

  .sensor-selector {
    @apply flex flex-wrap gap-2;
  }

  .sensor-option {
    @apply flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg;
    @apply hover:border-cyan-400/50 transition-colors;
  }

  .sensor-option.selected {
    @apply border-cyan-400 bg-cyan-500/20;
  }

  .sensor-icon {
    @apply text-lg;
  }

  .size-controls {
    @apply flex gap-4;
  }

  .size-input {
    @apply flex flex-col gap-1;
  }

  .size-input label {
    @apply text-xs text-gray-400;
  }

  .color-palette {
    @apply flex flex-wrap gap-2;
  }

  .color-item {
    @apply relative;
  }

  .color-picker {
    @apply w-10 h-10 border border-gray-600 rounded-lg cursor-pointer;
  }

  .remove-color {
    @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full;
    @apply text-white text-xs flex items-center justify-center;
    @apply hover:bg-red-600;
  }

  .add-color {
    @apply w-10 h-10 border-2 border-dashed border-gray-600 rounded-lg;
    @apply text-gray-400 hover:border-cyan-400 hover:text-cyan-400;
  }

  .styling-controls {
    @apply space-y-3;
  }

  .control-group {
    @apply flex items-center gap-3;
  }

  .control-group label {
    @apply text-sm text-gray-300 min-w-[100px];
  }

  .range-input {
    @apply flex-1;
  }

  .range-value {
    @apply text-sm text-cyan-400 min-w-[50px] text-right;
  }

  .checkbox-group {
    @apply flex items-center gap-2;
  }

  .checkbox-input {
    @apply w-4 h-4 text-cyan-400 border-gray-600 rounded;
    @apply focus:ring-cyan-400 focus:ring-2;
  }

  .checkbox-text {
    @apply text-sm text-gray-300;
  }

  .alert-config {
    @apply pl-6 border-l-2 border-cyan-400/30 space-y-4;
  }

  .type-config {
    @apply bg-gray-800/30 border border-gray-600 rounded-lg p-4;
  }

  .form-grid {
    @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
  }

  .template-grid {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2;
  }

  .template-card {
    @apply p-3 border border-gray-600 rounded-lg text-left;
    @apply hover:border-cyan-400/50 hover:bg-gray-700/50 transition-colors;
  }

  .template-name {
    @apply block font-medium text-gray-300;
  }

  .template-type {
    @apply block text-xs text-gray-400 uppercase;
  }

  .action-buttons {
    @apply flex gap-2;
  }

  .action-btn {
    @apply px-3 py-2 border border-gray-600 rounded-lg text-sm;
    @apply hover:bg-gray-700 transition-colors;
  }

  .action-btn.danger {
    @apply border-red-400/50 text-red-400 hover:bg-red-500/20;
  }

  .error-list {
    @apply space-y-1;
  }

  .error-item {
    @apply text-sm text-red-400 bg-red-900/20 border border-red-400/30 rounded px-2 py-1;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .section-content {
      @apply p-2;
    }

    .form-grid {
      @apply grid-cols-1;
    }

    .size-controls {
      @apply flex-col gap-2;
    }

    .control-group {
      @apply flex-col items-start gap-1;
    }

    .control-group label {
      @apply min-w-0;
    }
  }
</style>