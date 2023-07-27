<script>
  import { T } from '@threlte/core';
  import Terrain from '$lib/components/_Terrain.svelte';
</script>

<T.OrthographicCamera
  near={0.001}
  far={1000}
  position={[-Math.sqrt(2), Math.sqrt(2), -Math.sqrt(200)]}
  makeDefault
/>

<Terrain />
