<script lang="ts">
  import { GridItem, LayoutGrid } from '$lib/components';
  import { session } from '$lib/stores';
  import { USER } from '$lib/utils';

  export let segment = '';
  export let stretch = false;
  export let sidebar = false;
</script>

<LayoutGrid {segment} {stretch} sidebar={$session.role !== USER}>
  <GridItem name="pagebar" let:inner>
    <div class={inner}>
      <slot name="pagebar" />
    </div>
  </GridItem>
  <GridItem name="content" let:inner>
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
  {#if $session.role !== USER}
    <GridItem name="side" let:inner>
      <div class={inner}>
        <slot name="side">Sidebar</slot>
      </div>
    </GridItem>
  {/if}
  <GridItem vcenter name="footer" let:inner>
    <div class="{inner} ml-1">
      <slot name="footer">Footer</slot>
    </div>
  </GridItem>
  <GridItem vcenter hcenter name="ad" let:inner>
    <div class={inner}>
      <slot name="ad">Advertisement</slot>
    </div>
  </GridItem>
</LayoutGrid>

<style></style>
