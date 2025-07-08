<script lang="ts">
    import { onMount } from 'svelte';
    import { draggable, position, grid, events, Compartment } from '@neodrag/svelte';
    import { layoutStore } from './layoutStore';
  
    export let id: string;
    export let gridSize: [number, number] = [32, 32];
  
    let pos = { x: 0, y: 0 };
    const unsub = layoutStore.subscribe(layout => {
      if (layout[id]) pos = layout[id];
    });
  
    const posComp = Compartment.of(() => position({ current: pos }));
    const gridComp = Compartment.of(() => grid({ x: gridSize[0], y: gridSize[1] }));
    const evtComp = Compartment.of(() =>
      events({
        onDragEnd: d => layoutStore.setWidget(id, { x: d.offset.x, y: d.offset.y })
      })
    );
  
    onMount(() => unsub());
  </script>
  
  <div use:draggable={() => [posComp, gridComp, evtComp]} class="widget">
    <slot />
  </div>
  