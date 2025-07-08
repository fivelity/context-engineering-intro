<script lang="ts">
    import { getContext } from 'svelte';
    export let cols = 12;
    export let cellSize = 32;
  
    // Optionally consume context:
    // const { cols, cellSize } = getContext('dashboardGrid');
  </script>
  
  <div
    class="dashboard-grid"
    style="display: grid; grid-template-columns: repeat({cols}, {cellSize}px); grid-auto-rows: {cellSize}px; gap: 8px;"
  >
    <slot />
  </div>
  