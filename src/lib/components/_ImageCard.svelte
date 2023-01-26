<script lang="ts">
  import './_button.scss';
  import { createEventDispatcher } from 'svelte';
  import MediaImagePreview from './_MediaImagePreview.svelte';
  import { selection } from '$lib/stores';
  import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Menu from '@smui/menu';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import List, { Item, Separator, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';
  import { _ } from 'svelte-i18n';
  import type { Image } from '$lib/types';
  import { SvgIcon } from '.';

  export let image: Image;
  export { className as class };
  export let locked = false;

  const dispatch = createEventDispatcher();
  const videos = image.videos || [];

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

<Card class="card image {className}" {selected}>
  <PrimaryAction class="primary-action">
    <MediaImagePreview media={image} />
    <div class="hidden" class:locked>
      <Wrapper>
        <SvgIcon name="image" fillColor="#000" />
        <Tooltip>
          {#each videos as video}
            {video.title}<br />
          {/each}
        </Tooltip>
      </Wrapper>
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
                dispatch('media:delete', { type: 'images', data: { id: image.id } })}
            >
              <Text>{$_('text.delete-poster')}</Text>
            </Item>
          </List>
        </Menu>
      </ActionIcons>
    </ActionButtons>
  </Actions>
</Card>
<div class="card-outer" on:click={cardClick} on:mousedown on:keydown />

<style>
  .locked {
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
