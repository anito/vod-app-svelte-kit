<script>
  // @ts-nocheck

  import * as api from '$lib/api';

  import MediaImagePreview from './_MediaImagePreview.svelte';
  import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';
  import { proxyEvent } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  export let image = null;
  export let user;
  export { className as class };

  let className = '';
  let userMenu;
</script>

<Card class="flex content-between {className}" style="width: var(--poster-w);">
  <PrimaryAction>
    <MediaImagePreview media={image} />
  </PrimaryAction>
  <div class="flex flex-col justify-end" style="flex:1 0 auto">
    <Actions>
      <ActionButtons>
        <Button color="primary" on:click={() => userMenu?.setOpen(true)}>
          <Label>Löschen</Label>
          <Icon class="material-icons">delete</Icon>
        </Button>
      </ActionButtons>
      <ActionIcons style="position: relative;">
        <IconButton
          class="material-icons"
          on:click={() => {}}
          toggle
          aria-label="Mehr Optionen"
          title="Mehr Optionen">more_vert</IconButton
        >
        <Menu bind:this={userMenu}>
          <List>
            <Item
              class="text-red-700"
              on:SMUI:action={() => proxyEvent('user:delete', { id: user.id })}
            >
              <Text>{$_('text.delete-user')}</Text>
            </Item>
          </List>
        </Menu>
      </ActionIcons>
    </Actions>
  </div>
</Card>

<style>
</style>
