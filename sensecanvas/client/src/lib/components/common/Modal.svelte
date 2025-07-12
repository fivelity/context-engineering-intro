<!--
SenseCanvas Modal Component
Reusable modal dialog with backdrop, animations, and keyboard support
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  interface Props {
    isOpen: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    class?: string;
  }

  let { 
    isOpen,
    title = '',
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    class: customClass = ''
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    close: void;
    backdropClick: MouseEvent;
  }>();

  // ✅ Using Svelte 5 runes for modal state
  let modalElement = $state<HTMLElement>();
  let isAnimating = $state(false);
  let previouslyFocusedElement = $state<HTMLElement | null>(null);

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  // ✅ Using $effect for keyboard event handling
  $effect(() => {
    if (!isOpen || !closeOnEscape) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // ✅ Using $effect for focus management
  $effect(() => {
    if (isOpen) {
      // Store currently focused element
      previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Focus modal after animation
      setTimeout(() => {
        modalElement?.focus();
      }, 100);
    } else if (previouslyFocusedElement) {
      // Restore focus when closing
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  });

  // ✅ Using $effect for body scroll lock
  $effect(() => {
    if (typeof document === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  });

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    dispatch('backdropClick', event);
    
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleTransitionStart() {
    isAnimating = true;
  }

  function handleTransitionEnd() {
    isAnimating = false;
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="modal-backdrop"
    on:click={handleBackdropClick}
    on:transitionstart={handleTransitionStart}
    on:transitionend={handleTransitionEnd}
  >
    <div 
      bind:this={modalElement}
      class="modal-container {sizeClasses[size]} {customClass}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabindex="-1"
    >
      {#if title || showCloseButton}
        <div class="modal-header">
          {#if title}
            <h2 id="modal-title" class="modal-title">{title}</h2>
          {/if}
          
          {#if showCloseButton}
            <button
              type="button"
              class="modal-close"
              on:click={handleClose}
              aria-label="Close modal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="modal-content">
        <slot />
      </div>

      {#if $$slots.footer}
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    @apply fixed inset-0 z-50 overflow-y-auto;
    @apply bg-black bg-opacity-50 backdrop-blur-sm;
    @apply flex items-center justify-center p-4;
    @apply animate-in fade-in duration-200;
  }

  .modal-container {
    @apply relative w-full mx-auto;
    @apply bg-background rounded-lg shadow-2xl;
    @apply border border-border;
    @apply animate-in zoom-in-95 duration-200;
    @apply max-h-[90vh] overflow-hidden flex flex-col;
  }

  .modal-header {
    @apply flex items-center justify-between p-6 pb-4;
    @apply border-b border-border;
  }

  .modal-title {
    @apply text-xl font-semibold text-text;
    @apply font-display;
  }

  .modal-close {
    @apply p-2 -m-2 rounded-lg;
    @apply text-text-secondary hover:text-text;
    @apply hover:bg-surface transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .modal-content {
    @apply p-6 overflow-y-auto flex-1;
  }

  .modal-footer {
    @apply p-6 pt-4;
    @apply border-t border-border;
    @apply bg-surface;
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

  @keyframes zoom-in-95 {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .fade-in {
    animation-name: fade-in;
  }

  .zoom-in-95 {
    animation-name: zoom-in-95;
  }

  /* Theme-aware colors using CSS custom properties */
  .modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-container {
    background-color: var(--color-background);
    border-color: var(--color-border);
  }

  .modal-header {
    border-color: var(--color-border);
  }

  .modal-title {
    color: var(--color-text);
  }

  .modal-close {
    color: var(--color-text-secondary);
  }

  .modal-close:hover {
    color: var(--color-text);
    background-color: var(--color-surface);
  }

  .modal-footer {
    background-color: var(--color-surface);
    border-color: var(--color-border);
  }
</style>