<script>
  import { page } from '$app/stores';
  import { getSegment } from '$lib/utils';
  import Layout from './layout.svelte';

  $: segment = getSegment($page);
</script>

<Layout {segment}>
  <slot />
  <div slot="ad" />
  <div slot="footer" />
</Layout>
