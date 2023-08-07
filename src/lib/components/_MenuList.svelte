<script lang="ts">
  import { onMount } from 'svelte';
  import List from '@smui/list';
  import MenuSurface from '@smui/menu-surface';
  import IconButton from '@smui/icon-button';

  export let anchorCorner = 1;

  let menu: MenuSurface;

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
