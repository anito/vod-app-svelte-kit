<script>
  import { GridItem, LayoutGrid } from '$lib/components';
</script>

<LayoutGrid fullscreen>
  <GridItem name="content" let:inner class="has-background" style="--background: #fff9fc">
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
</LayoutGrid>
