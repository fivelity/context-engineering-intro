<!--
SenseCanvas Loading Spinner Component
Animated loading indicator with size options and theme support
-->

<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    thickness?: number;
    speed?: number;
    label?: string;
    class?: string;
  }

  let {
    size = 'md',
    color = 'currentColor',
    thickness = 2,
    speed = 1,
    label = 'Loading...',
    class: customClass = ''
  }: Props = $props();

  // Size mappings
  const sizeConfig = {
    sm: { dimension: 16, strokeWidth: 2 },
    md: { dimension: 24, strokeWidth: 2 },
    lg: { dimension: 32, strokeWidth: 3 },
    xl: { dimension: 48, strokeWidth: 4 }
  };

  // ✅ Using Svelte 5 runes for derived values
  let config = $derived(() => sizeConfig[size]);
  let strokeWidth = $derived(() => thickness || config().strokeWidth);
  let animationDuration = $derived(() => `${1 / speed}s`);
</script>

<div class="spinner-container {customClass}" role="status" aria-label={label}>
  <svg
    class="spinner-svg"
    width={config().dimension}
    height={config().dimension}
    viewBox="0 0 24 24"
    fill="none"
    style="animation-duration: {animationDuration}"
  >
    <circle
      class="spinner-track"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width={strokeWidth}
      opacity="0.2"
    />
    <circle
      class="spinner-circle"
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray="32"
      stroke-dashoffset="32"
      style="animation-duration: {animationDuration}"
    />
  </svg>
  {#if label && size !== 'sm'}
    <span class="spinner-label">{label}</span>
  {/if}
</div>

<style>
  .spinner-container {
    @apply inline-flex items-center gap-2;
  }

  .spinner-svg {
    @apply animate-spin;
  }

  .spinner-circle {
    transform-origin: center;
    animation: spinner-dash 1.5s ease-in-out infinite;
  }

  .spinner-label {
    @apply text-sm text-text-secondary;
  }

  @keyframes spinner-dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  /* Tailwind animation utility */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>