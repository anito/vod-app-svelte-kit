<script>
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { _ } from 'svelte-i18n';

  /** @type {import("@smui/menu").MenuComponentDev} */
  let menu;
  let menuAnchor;

  /**
   *
   * @param {Event} event
   */
  function handleClick(event) {
    event.preventDefault();
    menu.setOpen?.(!menu.isOpen?.());
  }
</script>

<span class="menu-anchor lg:-mr-8" bind:this={menuAnchor} use:Anchor>
  <IconButton
    class="material-icons on-surface items-stretch"
    on:click={handleClick}
    aria-label={$_('text.more-options')}
    title={$_('text.more-options')}>more_vert</IconButton
  >
  <Menu
    bind:this={menu}
    bind:anchorElement={menuAnchor}
    anchorCorner="BOTTOM_LEFT"
    style="overflow: visible;"
  >
    <List class="option-list">
      <slot />
    </List>
  </Menu>
</span>

<style>
</style>
