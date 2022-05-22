<script>
  import { onMount } from 'svelte';
  import List, { Item, Graphic, Meta, Separator, Subheader, Text, PrimaryText, SecondaryText } from '@smui/list';
  import Menu from '@smui/menu';
  import IconButton, { Icon } from '@smui/icon-button';

  export let lines = false;
  export let anchorCorner = 'BOTTOM_RIGHT';

  let menu;

  onMount(() => {});

  function openMenu(e) {
    // e.stopPropagation();
    menu.setOpen(true);
  }
</script>

<dev style="position: relative;">
  <IconButton
    class="material-icons"
    on:click={(e) => openMenu(e)}
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
