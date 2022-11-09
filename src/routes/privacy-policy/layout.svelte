<script>
  import { GridItem, LayoutGrid } from '$lib/components';

  /**  @type {string} */
  export let segment;
  export let stretch = false;
</script>

<LayoutGrid fullscreen {segment} {stretch}>
  <GridItem name="content" let:inner>
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
  <GridItem vcenter name="footer" let:inner>
    <div class={inner}>
      <slot name="footer" />
    </div>
  </GridItem>
  <GridItem vcenter name="ad" let:inner>
    <div class={inner}>
      <slot name="ad" />
    </div>
  </GridItem>
</LayoutGrid>

<style>
</style>
