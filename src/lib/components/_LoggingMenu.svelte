<script lang="ts">
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List from '@smui/list';
  import { Item, Text } from '@smui/list';
  import Slider from '@smui/slider';
  import SvgIcon from './_SvgIcon.svelte';
  import { _ } from 'svelte-i18n';

  let menu: Menu;
  let menuAnchor;
  let value = 0;

  function handleClick(event: CustomEvent) {
    menu?.setOpen(!menu.isOpen?.());
  }
</script>

<Item class="justify-start relative" on:click$preventDefault={handleClick}>
  <span style="display: flex; align-items: center;" bind:this={menuAnchor} use:Anchor>
    <SvgIcon name="github" class="mr-2" style="max-width: 20%;" />
    <Text style="max-width: 80%;">Log level</Text>
  </span>
</Item>
<Menu bind:this={menu} bind:anchorElement={menuAnchor} anchorCorner="BOTTOM_RIGHT">
  <List class="option-list">
    <Slider bind:value min={0} max={5} step={1} discrete input$aria-label="Log level slider" />
  </List>
</Menu>

<style>
</style>
