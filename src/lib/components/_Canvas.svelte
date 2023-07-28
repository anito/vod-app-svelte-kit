<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { addClass } from '$lib/utils';

  export { className as class };

  let className = '';
</script>

<div use:addClass={className} class="canvas">
  <Canvas>
    <slot />
  </Canvas>
</div>

<style>
  .canvas {
    height: 100vh;
    inset: 0;
    position: fixed;
    width: 100vw;
  }
</style>
