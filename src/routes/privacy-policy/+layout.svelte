<script>
  import { page } from '$app/stores';
  import { getSegment } from '$lib/utils';
  import Layout from './layout.svelte';

  $: segment = getSegment($page);
</script>

<Layout {segment}>
  <slot />
  <div slot="ad" />
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0" />
    <div class="m-auto mr-0" />
  </div>
</Layout>
