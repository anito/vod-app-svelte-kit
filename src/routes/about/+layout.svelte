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
  <div slot="footer" />
</Layout>
