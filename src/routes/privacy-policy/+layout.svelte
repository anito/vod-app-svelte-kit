<script>
  import { getContext } from 'svelte';
  import Layout from './layout.svelte';

  const { getSegment } = getContext('segment');
  /** @type {SvelteStore<string>} */
  const segment = getSegment();
</script>

<Layout segment={$segment}>
  <slot />
  <div slot="ad" />
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0" />
    <div class="m-auto mr-0" />
  </div>
</Layout>
