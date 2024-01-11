<script lang="ts">
  import { GridItem, LayoutGrid } from '$lib/components';
</script>

<LayoutGrid fullscreen>
  <GridItem name="content" let:inner class="has-background">
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
</LayoutGrid>
