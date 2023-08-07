<script lang="ts">
  import { T } from '@threlte/core';
  import Filmgrain from '$lib/components/_Filmgrain.svelte';
</script>

<T.PerspectiveCamera
  aspect={window.innerWidth / window.innerHeight}
  fov={75}
/>

<Filmgrain />
