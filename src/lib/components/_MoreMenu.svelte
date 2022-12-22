<script>
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let labelSize = '1em';
  export let iconSize = '20px';

  /** @type {Menu} */
  let menu;
  let menuAnchor;
  let className = '';

  /**
   *
   * @param {Event} event
   */
  function handleClick(event) {
    event.preventDefault();
    menu?.setOpen(!menu.isOpen?.());
  }
</script>

<span
  class="more-menu menu-anchor lg:-mr-8 {className}"
  bind:this={menuAnchor}
  use:Anchor
  style="--label-size: {labelSize}; --icon-size: {iconSize}"
>
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
  .more-menu :global(li [class*='label']) {
    font-size: var(--label-size, 1em);
  }
  .more-menu :global(li [class*='icon']) {
    font-size: var(--icon-size, 20px);
  }
  :global(svg) {
    width: var(--icon-size);
    height: var(--icon-size);
  }
</style>
