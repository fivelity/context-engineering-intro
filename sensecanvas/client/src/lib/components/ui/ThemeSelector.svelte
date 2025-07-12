<!--
SenseCanvas Theme Selector Component
Theme switching UI with previews and auto-switch options
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { themeStore } from '../../stores/theme.svelte.js';
  
  interface Props {
    showAutoSwitch?: boolean;
    showPreview?: boolean;
    compact?: boolean;
    class?: string;
  }

  let {
    showAutoSwitch = true,
    showPreview = true,
    compact = false,
    class: customClass = ''
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    themeChanged: string;
    autoSwitchToggled: boolean;
  }>();

  // ✅ Using Svelte 5 runes for theme state
  let isOpen = $state(false);
  let hoveredTheme = $state<string | null>(null);

  // Theme previews
  const themePreviews = {
    default: {
      colors: ['#22d3ee', '#06b6d4', '#0891b2'],
      description: 'Clean cyan and blue tech aesthetic'
    },
    cyberpunk: {
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
      description: 'Purple and pink neon vibes'
    },
    gaming: {
      colors: ['#22c55e', '#eab308', '#ef4444'],
      description: 'RGB gaming setup inspired'
    },
    minimal: {
      colors: ['#64748b', '#475569', '#334155'],
      description: 'Clean and distraction-free'
    },
    rgb: {
      colors: ['#f59e0b', '#ef4444', '#a855f7', '#22c55e'],
      description: 'Full spectrum rainbow effects'
    }
  };

  // Handle theme selection
  function selectTheme(themeId: string) {
    themeStore.setTheme(themeId);
    dispatch('themeChanged', themeId);
    isOpen = false;
  }

  // Toggle auto-switch
  function toggleAutoSwitch() {
    const newValue = !themeStore.autoSwitch;
    themeStore.setAutoSwitch(newValue);
    dispatch('autoSwitchToggled', newValue);
  }

  // Handle outside click
  function handleOutsideClick(event: MouseEvent) {
    if (isOpen && !(event.target as Element).closest('.theme-selector')) {
      isOpen = false;
    }
  }

  // ✅ Using $effect for document click listener
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      
      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }
  });
</script>

<div class="theme-selector {customClass}" class:compact>
  <button
    type="button"
    class="theme-button"
    onclick={(e) => { e.stopPropagation(); isOpen = !isOpen; }}
    aria-label="Select theme"
    aria-expanded={isOpen}
  >
    <div class="theme-preview">
      {#each themePreviews[themeStore.currentTheme.id as keyof typeof themePreviews]?.colors || [] as color, i}
        <div 
          class="preview-dot"
          style="background-color: {color}; animation-delay: {i * 0.1}s"
        />
      {/each}
    </div>
    
    {#if !compact}
      <span class="theme-name">{themeStore.currentTheme.name}</span>
    {/if}
    
    <svg
      class="dropdown-icon"
      class:rotate-180={isOpen}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {#if isOpen}
    <div class="theme-dropdown">
      <div class="theme-list">
        {#each themeStore.getThemeList() as theme}
          <button
            type="button"
            class="theme-option"
            class:active={theme.id === themeStore.currentTheme.id}
            onclick={() => selectTheme(theme.id)}
            onmouseenter={() => (hoveredTheme = theme.id)}
            onmouseleave={() => (hoveredTheme = null)}
          >
            <div class="option-content">
              <div class="option-header">
                <span class="option-name">{theme.name}</span>
                {#if theme.id === themeStore.currentTheme.id}
                  <svg
                    class="check-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {/if}
              </div>
              
              {#if showPreview}
                <div class="option-preview">
                  {#each themePreviews[theme.id as keyof typeof themePreviews]?.colors || [] as color}
                    <div 
                      class="preview-bar"
                      style="background-color: {color}"
                    />
                  {/each}
                </div>
              {/if}
              
              <p class="option-description">
                {themePreviews[theme.id as keyof typeof themePreviews]?.description || theme.description}
              </p>
            </div>
          </button>
        {/each}
      </div>

      {#if showAutoSwitch}
        <div class="auto-switch-section">
          <label class="auto-switch-label">
            <input
              type="checkbox"
              class="auto-switch-checkbox"
              checked={themeStore.autoSwitch}
              onchange={toggleAutoSwitch}
            />
            <span class="auto-switch-text">
              Auto-switch by time of day
            </span>
          </label>
          {#if themeStore.autoSwitch}
            <p class="auto-switch-info">
              Themes will change automatically:
              <br />
              • Default (9 AM - 6 PM)
              <br />
              • Gaming (6 PM - 8 PM)
              <br />
              • Cyberpunk (8 PM - 9 AM)
            </p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .theme-selector {
    @apply relative;
  }

  .theme-button {
    @apply flex items-center gap-2 px-3 py-2;
    @apply rounded-lg border border-border;
    @apply bg-surface hover:bg-surface/80;
    @apply text-text transition-all;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .theme-selector.compact .theme-button {
    @apply px-2 py-1;
  }

  .theme-preview {
    @apply flex gap-1;
  }

  .preview-dot {
    @apply w-4 h-4 rounded-full;
    @apply animate-pulse;
  }

  .theme-selector.compact .preview-dot {
    @apply w-3 h-3;
  }

  .theme-name {
    @apply text-sm font-medium;
  }

  .dropdown-icon {
    @apply transition-transform duration-200;
  }

  .rotate-180 {
    @apply transform rotate-180;
  }

  .theme-dropdown {
    @apply absolute top-full mt-2 right-0;
    @apply w-72 rounded-lg;
    @apply bg-background border border-border;
    @apply shadow-2xl;
    @apply animate-in fade-in slide-in-from-top-2 duration-200;
    @apply z-50;
  }

  .theme-list {
    @apply p-2;
  }

  .theme-option {
    @apply w-full p-3 rounded-md;
    @apply text-left transition-all;
    @apply hover:bg-surface;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .theme-option.active {
    @apply bg-primary/10;
  }

  .option-content {
    @apply space-y-2;
  }

  .option-header {
    @apply flex items-center justify-between;
  }

  .option-name {
    @apply font-medium text-text;
  }

  .check-icon {
    @apply text-primary;
  }

  .option-preview {
    @apply flex gap-1 h-6;
  }

  .preview-bar {
    @apply flex-1 rounded;
  }

  .option-description {
    @apply text-xs text-text-secondary;
  }

  .auto-switch-section {
    @apply p-4 border-t border-border;
    @apply bg-surface/50;
  }

  .auto-switch-label {
    @apply flex items-center gap-2 cursor-pointer;
  }

  .auto-switch-checkbox {
    @apply w-4 h-4 rounded;
    @apply text-primary focus:ring-primary;
    @apply border-border;
  }

  .auto-switch-text {
    @apply text-sm font-medium text-text;
  }

  .auto-switch-info {
    @apply mt-2 text-xs text-text-secondary;
    @apply leading-relaxed;
  }

  /* Animation utilities */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-in-from-top-2 {
    from {
      transform: translateY(-0.5rem);
    }
    to {
      transform: translateY(0);
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .fade-in {
    animation-name: fade-in;
  }

  .slide-in-from-top-2 {
    animation-name: slide-in-from-top-2;
  }
</style>