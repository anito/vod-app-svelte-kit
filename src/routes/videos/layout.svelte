<script>
  // @ts-nocheck

  import { fly } from 'svelte/transition';
  import { GridItem, LayoutGrid } from '$lib/components';
  import { page } from '$app/stores';

  export let stretch = false;
  export let sidebar = false;

  $: sidebar = !!$page.params.slug;
</script>

<LayoutGrid {stretch} {sidebar}>
  <GridItem name="pagebar" let:inner>
    <div class={inner}>
      <slot name="pagebar" />
    </div>
  </GridItem>
  <GridItem name="content" let:inner hcenter>
    <div class={inner}>
      <slot />
    </div>
  </GridItem>
  {#if sidebar}
    <GridItem name="side" let:inner>
      <div class={inner}>
        <slot name="side">Sidebar</slot>
      </div>
    </GridItem>
  {/if}
  <GridItem vcenter name="footer" let:inner>
    <div class={inner}>
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
