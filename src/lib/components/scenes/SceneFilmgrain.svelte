<script>
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import Filmgrain from '$lib/components/_Filmgrain.svelte';

</script>

<T.PerspectiveCamera aspect={window.innerWidth/window.innerHeight} near={0.1} far={1000} fov={75}>
  <OrbitControls enabled={false} />
</T.PerspectiveCamera>

<Filmgrain />
