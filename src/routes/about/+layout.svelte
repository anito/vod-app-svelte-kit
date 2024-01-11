<script lang="ts">
  import { getContext } from 'svelte';
  import Layout from './_layout.svelte';

  const { getSegment }: any = getContext('segment');
  const segment = getSegment();
</script>

<Layout segment={$segment}>
  <slot />
  <div slot="ad" />
  <div slot="footer" />
</Layout>
