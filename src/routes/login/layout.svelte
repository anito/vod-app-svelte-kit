<script>
  // @ts-nocheck

  import { GridItem, LayoutGrid } from '$lib/components';

  export let stretch = false;
</script>

<LayoutGrid {stretch} class="no-pagebar">
  <GridItem name="content" let:inner class="has-background" style="--background: #ffffff">
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
  <GridItem vcenter name="footer" let:inner class="has-background" style="--background: #ffffff">
    <div class={inner}>
      <slot name="footer">Footer</slot>
    </div>
  </GridItem>
  <GridItem
    vcenter
    hcenter
    name="ad"
    let:inner
    class="has-background"
    style="--background: #ffffff"
  >
    <div class={inner}>
      <slot name="ad">Advertisement</slot>
    </div>
  </GridItem>
</LayoutGrid>
