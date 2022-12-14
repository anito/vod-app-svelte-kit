<script>
  import { onMount } from 'svelte';
  import List, {
    Item,
    Graphic,
    Meta,
    Separator,
    Subheader,
    Text,
    PrimaryText,
    SecondaryText
  } from '@smui/list';
  import Menu from '@smui/menu';
  import IconButton, { Icon } from '@smui/icon-button';

  export let lines = false;
  export let anchorCorner = 'BOTTOM_RIGHT';

  /**
   * @type {import("@smui/menu").MenuComponentDev}
   */
  let menu;

  onMount(() => {});
</script>

<dev style="position: relative;">
  <IconButton
    class="material-icons"
    on:click={() => menu?.setOpen(true)}
    toggle
    aria-label="Mehr Optionen"
    title="Mehr Optionen"
  >
    more_vert
  </IconButton>
  <Menu bind:this={menu} {lines} {anchorCorner}>
    <List>
      <slot />
    </List>
  </Menu>
</dev>
