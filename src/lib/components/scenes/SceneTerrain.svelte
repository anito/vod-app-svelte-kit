<script>
  import { T } from '@threlte/core';
  import Terrain from '$lib/components/_Terrain.svelte';
</script>

<T.OrthographicCamera
  near={0.01}
  far={1000}
  zoom={500}
  makeDefault
/>

<Terrain />
