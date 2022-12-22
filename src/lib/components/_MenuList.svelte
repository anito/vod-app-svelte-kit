<script>
  import { onMount } from 'svelte';
  import List from '@smui/list';
  import MenuSurface, { Corner } from '@smui/menu-surface';
  import IconButton, { Icon } from '@smui/icon-button';

  /**
   * @type {Corner}
   */
  export let anchorCorner = 1;

  /**
   * @type {MenuSurface}
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
  <MenuSurface bind:this={menu} {anchorCorner}>
    <List>
      <slot />
    </List>
  </MenuSurface>
</dev>
