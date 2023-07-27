<script>
  import { T } from '@threlte/core';
  import Terrain from '$lib/components/_Terrain.svelte';
    import { DEG2RAD } from 'three/src/math/MathUtils';
</script>

<T.OrthographicCamera
  near={0.001}
  far={1000}
  position={[100, -100, -Math.sqrt(200)]}
  rotation={[180*DEG2RAD, 0*DEG2RAD, 190*DEG2RAD]}
  makeDefault
/>

<Terrain />
