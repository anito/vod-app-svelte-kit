<script>
  import './_button.scss';
  import { createEventDispatcher } from 'svelte';
  import MediaImagePreview from './_MediaImagePreview.svelte';
  import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';
  import { _ } from 'svelte-i18n';

  /**
   * @type {import('$lib/types').Image}
   */
  export let image;
  export { className as class };

  const dispatch = createEventDispatcher();

  let className = '';
  /**
   * @type {Menu}
   */
  let posterMenu;
</script>

<Card class="card {className}">
  <PrimaryAction>
    <MediaImagePreview media={image} />
  </PrimaryAction>
  <Actions class="card-actions">
    <ActionButtons class="justify-between">
      <Button color="primary" on:click={() => posterMenu?.setOpen(true)}>
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
            <Item class="text-red-700" on:SMUI:action={() => dispatch('Image:delete', { image })}>
              <Text>{$_('text.delete-poster')}</Text>
            </Item>
          </List>
        </Menu>
      </ActionIcons>
    </ActionButtons>
  </Actions>
</Card>

<style>
</style>
