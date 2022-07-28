<script>
  // @ts-nocheck

  import { GridItem, LayoutGrid } from '$lib/components';
</script>

<LayoutGrid fullscreen>
  <GridItem name="content" let:inner>
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
</LayoutGrid>
