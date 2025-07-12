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
        ></div>
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
                    ></div>
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
    position: relative;
  }

  .theme-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    color: var(--color-text);
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .theme-button:hover {
    background-color: rgba(var(--color-surface), 0.8);
  }

  .theme-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .theme-selector.compact .theme-button {
    padding: 0.25rem 0.5rem;
  }

  .theme-preview {
    display: flex;
    gap: 0.25rem;
  }

  .preview-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .theme-selector.compact .preview-dot {
    width: 0.75rem;
    height: 0.75rem;
  }

  .theme-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .dropdown-icon {
    transition: transform 0.2s ease;
  }

  .rotate-180 {
    transform: rotate(180deg);
  }

  .theme-dropdown {
    position: absolute;
    top: 100%;
    margin-top: 0.5rem;
    right: 0;
    width: 18rem;
    border-radius: 0.5rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
    z-index: 50;
  }

  .theme-list {
    padding: 0.5rem;
  }

  .theme-option {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.375rem;
    text-align: left;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: none;
  }

  .theme-option:hover {
    background-color: var(--color-surface);
  }

  .theme-option:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .theme-option.active {
    background-color: rgba(var(--color-primary), 0.1);
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .option-name {
    font-weight: 500;
    color: var(--color-text);
  }

  .check-icon {
    color: var(--color-primary);
  }

  .option-preview {
    display: flex;
    gap: 0.25rem;
    height: 1.5rem;
  }

  .preview-bar {
    flex: 1;
    border-radius: 0.25rem;
  }

  .option-description {
    font-size: 0.75rem;
    color: var(--color-textSecondary);
  }

  .auto-switch-section {
    padding: 1rem;
    border-top: 1px solid var(--color-border);
    background-color: rgba(var(--color-surface), 0.5);
  }

  .auto-switch-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .auto-switch-checkbox {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    color: var(--color-primary);
    border: 1px solid var(--color-border);
  }

  .auto-switch-checkbox:focus {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .auto-switch-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .auto-switch-info {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-textSecondary);
    line-height: 1.6;
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