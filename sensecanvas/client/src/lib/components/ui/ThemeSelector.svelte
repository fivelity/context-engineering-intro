<!--
SenseCanvas Theme Selector Component
Interactive theme switcher with preview and auto-switching functionality.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { themeStore, type ThemeDefinition } from '../../stores/theme.svelte.js';

  interface Props {
    className?: string;
    showPreview?: boolean;
    compactMode?: boolean;
  }

  let { className = '', showPreview = true, compactMode = false }: Props = $props();

  const dispatch = createEventDispatcher<{
    themeChanged: { themeId: string; theme: ThemeDefinition };
  }>();

  // ✅ Using Svelte 5 runes for theme selector state
  let isOpen = $state(false);
  let previewTheme = $state<string | null>(null);
  let showExportModal = $state(false);
  let exportedConfig = $state('');

  // ✅ Derived theme data
  let currentTheme = $derived(() => themeStore.currentTheme);
  let availableThemes = $derived(() => themeStore.availableThemes);
  let themesByCategory = $derived(() => themeStore.themesByCategory);
  let autoSwitch = $derived(() => themeStore.autoSwitch);

  let selectorClasses = $derived(() => {
    const classes = ['theme-selector', className];
    if (isOpen) classes.push('open');
    if (compactMode) classes.push('compact');
    return classes.join(' ');
  });

  // Handle theme selection
  function selectTheme(themeId: string) {
    themeStore.setTheme(themeId);
    isOpen = false;
    previewTheme = null;
    
    dispatch('themeChanged', {
      themeId,
      theme: themeStore.currentTheme
    });
  }

  // Handle theme preview
  function previewThemeHandler(themeId: string) {
    if (!showPreview) return;
    
    previewTheme = themeId;
    // Apply preview temporarily
    themeStore.setTheme(themeId);
  }

  function stopPreview() {
    if (previewTheme) {
      themeStore.setTheme(themeStore.currentThemeId);
      previewTheme = null;
    }
  }

  // Handle auto-switching
  function toggleAutoSwitch() {
    themeStore.setAutoSwitch(!autoSwitch);
  }

  // Export/Import functionality
  function exportTheme() {
    exportedConfig = themeStore.exportTheme();
    showExportModal = true;
  }

  function importTheme() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const configJson = e.target?.result as string;
          const success = themeStore.importTheme(configJson);
          if (success) {
            alert('Theme imported successfully!');
          } else {
            alert('Invalid theme configuration file.');
          }
        } catch (error) {
          alert('Failed to import theme configuration.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  // Copy exported config to clipboard
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(exportedConfig);
      alert('Theme configuration copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  // Close selector when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.theme-selector')) {
      isOpen = false;
      stopPreview();
    }
  }

  // ✅ Using $effect for click outside handler
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  // Get theme preview colors
  function getThemeColors(theme: ThemeDefinition): string[] {
    return [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
  }

  // Get category icon
  function getCategoryIcon(category: string): string {
    const icons = {
      'sci-fi': '🚀',
      'gaming': '🎮',
      'professional': '💼',
      'colorful': '🌈'
    };
    return icons[category] || '🎨';
  }
</script>

<div class={selectorClasses}>
  <!-- Theme Selector Button -->
  <button 
    class="theme-button"
    onclick={() => isOpen = !isOpen}
    title="Change Theme"
    aria-label="Theme selector"
  >
    <div class="theme-preview">
      {#each getThemeColors(currentTheme) as color}
        <div class="color-dot" style="background-color: {color}"></div>
      {/each}
    </div>
    
    {#if !compactMode}
      <span class="theme-name">{currentTheme.name}</span>
    {/if}
    
    <span class="dropdown-arrow" class:rotated={isOpen}>▼</span>
  </button>

  <!-- Theme Dropdown -->
  {#if isOpen}
    <div class="theme-dropdown">
      <div class="dropdown-header">
        <h3 class="dropdown-title">Select Theme</h3>
        
        <div class="header-actions">
          <button 
            class="action-btn"
            onclick={toggleAutoSwitch}
            class:active={autoSwitch}
            title={autoSwitch ? 'Disable auto-switching' : 'Enable auto-switching'}
          >
            🔄
          </button>
          
          <button 
            class="action-btn"
            onclick={exportTheme}
            title="Export theme configuration"
          >
            💾
          </button>
          
          <button 
            class="action-btn"
            onclick={importTheme}
            title="Import theme configuration"
          >
            📁
          </button>
        </div>
      </div>

      <div class="themes-container">
        {#each Object.entries(themesByCategory) as [category, themes]}
          <div class="theme-category">
            <h4 class="category-title">
              <span class="category-icon">{getCategoryIcon(category)}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            
            <div class="themes-grid">
              {#each themes as theme}
                <button
                  class="theme-option"
                  class:active={theme.id === currentTheme.id}
                  class:previewing={previewTheme === theme.id}
                  onclick={() => selectTheme(theme.id)}
                  onmouseenter={() => previewThemeHandler(theme.id)}
                  onmouseleave={stopPreview}
                  title={theme.description}
                >
                  <div class="theme-colors">
                    {#each getThemeColors(theme) as color}
                      <div class="color-swatch" style="background-color: {color}"></div>
                    {/each}
                  </div>
                  
                  <div class="theme-info">
                    <span class="theme-title">{theme.name}</span>
                    <span class="theme-desc">{theme.description}</span>
                  </div>
                  
                  {#if theme.id === currentTheme.id}
                    <div class="active-indicator">✓</div>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      {#if autoSwitch}
        <div class="auto-switch-info">
          <span class="info-icon">🔄</span>
          <span class="info-text">Auto-switching enabled (10s intervals)</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Export Modal -->
{#if showExportModal}
  <div class="modal-backdrop" onclick={() => showExportModal = false}>
    <div class="export-modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Export Theme Configuration</h3>
        <button onclick={() => showExportModal = false} class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <p class="export-description">
          Copy this configuration to share your theme settings:
        </p>
        
        <div class="config-container">
          <textarea
            class="config-textarea"
            readonly
            bind:value={exportedConfig}
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" onclick={copyToClipboard}>
            📋 Copy to Clipboard
          </button>
          <button class="btn btn-secondary" onclick={() => showExportModal = false}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .theme-selector {
    @apply relative;
  }

  .theme-button {
    @apply flex items-center gap-2 px-3 py-2 rounded-lg;
    @apply bg-gray-800 border border-gray-600 text-gray-300;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
    @apply cursor-pointer;
  }

  .theme-selector.compact .theme-button {
    @apply px-2 py-2;
  }

  .theme-preview {
    @apply flex gap-1;
  }

  .color-dot {
    @apply w-3 h-3 rounded-full border border-gray-600;
  }

  .theme-name {
    @apply text-sm font-medium;
  }

  .dropdown-arrow {
    @apply text-xs transition-transform duration-200;
  }

  .dropdown-arrow.rotated {
    @apply rotate-180;
  }

  .theme-dropdown {
    @apply absolute top-full mt-2 right-0 z-50;
    @apply bg-gray-900 border border-cyan-400/30 rounded-lg shadow-xl;
    @apply min-w-80 max-w-lg max-h-96 overflow-y-auto;
    animation: dropdown-in 0.2s ease-out;
  }

  @keyframes dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .dropdown-header {
    @apply flex items-center justify-between p-4 border-b border-gray-700;
  }

  .dropdown-title {
    @apply text-lg font-bold text-cyan-400;
  }

  .header-actions {
    @apply flex gap-2;
  }

  .action-btn {
    @apply w-8 h-8 flex items-center justify-center rounded;
    @apply bg-gray-800 border border-gray-600 text-gray-300;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .action-btn.active {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
  }

  .themes-container {
    @apply p-4 space-y-4;
  }

  .theme-category {
    @apply space-y-2;
  }

  .category-title {
    @apply flex items-center gap-2 text-sm font-bold text-gray-300;
  }

  .category-icon {
    @apply text-lg;
  }

  .themes-grid {
    @apply grid grid-cols-1 gap-2;
  }

  .theme-option {
    @apply flex items-center gap-3 p-3 rounded-lg border border-gray-600;
    @apply hover:border-cyan-400/50 hover:bg-gray-800/50 transition-all;
    @apply cursor-pointer relative;
  }

  .theme-option.active {
    @apply border-cyan-400 bg-cyan-500/20;
  }

  .theme-option.previewing {
    @apply border-yellow-400/50 bg-yellow-500/10;
  }

  .theme-colors {
    @apply flex gap-1;
  }

  .color-swatch {
    @apply w-4 h-4 rounded border border-gray-600;
  }

  .theme-info {
    @apply flex-1 text-left;
  }

  .theme-title {
    @apply block text-sm font-medium text-gray-300;
  }

  .theme-desc {
    @apply block text-xs text-gray-400;
  }

  .active-indicator {
    @apply absolute top-2 right-2 text-cyan-400 text-sm;
  }

  .auto-switch-info {
    @apply flex items-center gap-2 p-3 bg-cyan-500/10 border-t border-cyan-400/30;
    @apply text-xs text-cyan-400;
  }

  .info-icon {
    @apply text-lg;
  }

  /* Export Modal */
  .modal-backdrop {
    @apply fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50;
  }

  .export-modal {
    @apply bg-gray-900 border border-cyan-400/30 rounded-lg shadow-xl;
    @apply max-w-2xl w-full mx-4;
  }

  .modal-header {
    @apply flex items-center justify-between p-4 border-b border-gray-700;
  }

  .modal-header h3 {
    @apply text-lg font-bold text-cyan-400;
  }

  .close-btn {
    @apply text-gray-400 hover:text-white text-xl;
  }

  .modal-body {
    @apply p-4 space-y-4;
  }

  .export-description {
    @apply text-sm text-gray-400;
  }

  .config-container {
    @apply relative;
  }

  .config-textarea {
    @apply w-full h-40 p-3 bg-gray-800 border border-gray-600 rounded;
    @apply text-sm font-mono text-gray-300 resize-none;
  }

  .modal-actions {
    @apply flex gap-3 justify-end;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .theme-dropdown {
      @apply left-0 right-0 min-w-0;
    }

    .themes-grid {
      @apply grid-cols-1;
    }

    .theme-option {
      @apply flex-col items-start gap-2;
    }

    .theme-colors {
      @apply order-2;
    }

    .export-modal {
      @apply mx-2;
    }
  }
</style>