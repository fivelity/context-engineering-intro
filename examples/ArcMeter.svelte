<script lang="ts">
    import { Chart, Layer, Arc, Text } from 'layerchart';
    import { SpringValue } from 'layerchart/animate';
    import { cls } from '../utils/classnames';
  
    export let value = 50;
    export let segments = 60;
    export let successThreshold = 75;
  </script>
  
  <Chart>
    <Layer center>
      <SpringValue {value} let:value>
        {#each Array(segments) as _, i}
          {@const angle = (2 * Math.PI) / segments}
          <Arc
            startAngle={i * angle}
            endAngle={(i + 1) * angle}
            innerRadius={-20}
            padAngle={0.01}
            class={cls(
              (i / segments) * 100 < value
                ? value > successThreshold ? 'fill-success-400' : 'fill-warning-300'
                : 'fill-surface-content/20'
            )}
          />
        {/each}
        <Text
          value={`${Math.round(value)}%`}
          textAnchor="middle"
          verticalAnchor="middle"
          class="text-3xl font-mono"
        />
      </SpringValue>
    </Layer>
  </Chart>
  