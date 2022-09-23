<script>
  import { GridItem, LayoutGrid } from '$lib/components';
</script>

<LayoutGrid fullscreen>
  <GridItem name="content" let:inner class="has-background" style="--background: #ffffff">
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
</LayoutGrid>
