<script lang="ts">
  import './_button.scss';
  import MediaImagePreview from './_MediaImagePreview.svelte';
  import { selection } from '$lib/stores';
  import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Menu from '@smui/menu';
  import Checkbox from '@smui/checkbox';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import List, { Item, Text } from '@smui/list';
  import { SvgIcon } from '.';
  import { emit } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { Image } from '$lib/classes/repos/types';

  export let image: Image;
  export { className as class };

  $: posterVideos = image.videos || [];
  $: activeposter = posterVideos.length;

  let selected: boolean;

  let className = '';
  let posterMenu: Menu;

  $: selected = !!$selection.find((id: string) => id === image.id) || false;

  function cardClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    selected = !selected;
    selected ? selection.add(image.id) : selection.remove(image.id);
  }
</script>

<Card aria-selected={selected} variant="raised" class="card image primary {className}">
  <PrimaryAction class="primary-action" on:click={() => console.log('clicked')}>
    <div class="absolute z-10 checkbox-container">
      <Checkbox bind:checked={selected} />
    </div>
    <MediaImagePreview media={image} />
    <div class="hidden" class:activeposter>
      {#if posterVideos.length}
        <Wrapper>
          <SvgIcon name="image" fillColor="#000" />
          <Tooltip>
            {#each posterVideos as video}
              {video.title}<br />
            {/each}
          </Tooltip>
        </Wrapper>
      {/if}
    </div>
  </PrimaryAction>
  <Actions class="card-actions">
    <ActionButtons class="action-buttons" style="flex: 1 0 auto;">
      <Button class="action-button" variant="unelevated" on:click={() => posterMenu?.setOpen(true)}>
        <Label>{$_('text.delete')}</Label>
        <Icon class="material-icons">delete</Icon>
      </Button>
      <ActionIcons style="position: relative;">
        <IconButton
          class="material-icons"
          on:click={() => posterMenu?.setOpen(true)}
          toggle
          aria-label={$_('text.more-options')}
          title={$_('text.more-options')}
        >
          more_vert
        </IconButton>
        <Menu bind:this={posterMenu}>
          <List>
            <Item
              ripple={false}
              class="error-on-background"
              on:SMUI:action={() =>
                emit('media:delete', { type: 'images', id: image.id, show: true })}
            >
              <Text>{$_('text.delete-poster')}</Text>
            </Item>
          </List>
        </Menu>
      </ActionIcons>
    </ActionButtons>
  </Actions>
</Card>
<div tabindex="0" role="button" class="card-outer" on:click={cardClick} on:mousedown on:keydown />

<style>
  .activeposter {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    margin: 3px;
    font-size: 0.7em;
    border-radius: 50%;
    padding: 4px;
    background-color: #fff;
  }
</style>
