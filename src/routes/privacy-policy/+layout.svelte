<script lang="ts">
  import { getContext } from 'svelte';
  import Layout from './_layout.svelte';

  const { getSegment }: any = getContext('segment');
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
