<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Text } from '@smui/list';
  import { LOCALESTORE, post } from '$lib/utils';
  import { _, locale, locales } from 'svelte-i18n';

  let localeMenuAnchor;
  let localeMenu: Menu;

  $: currentLocale = $locale;

  const dispatch = createEventDispatcher();

  async function setLocale(value: string) {
    localeMenu?.setOpen(false);
    if (value === currentLocale) return;

    $locale = value;
    await post('/session', { locale: $locale }).then(async (res) => {
      await invalidate('app:session');
      dispatch('changed:locale', { locale: LOCALESTORE.get(value)?.localized });
    });
  }
</script>

<span class="relative">
  <a href="." on:click|preventDefault={() => localeMenu?.setOpen(true)}>
    <div class="menu-anchor switcher lg:-mr-8" bind:this={localeMenuAnchor} use:Anchor>
      <div class="current-locale">{currentLocale?.toUpperCase().slice(0, 2)}</div>
    </div>
  </a>
  <Menu
    bind:this={localeMenu}
    bind:anchorElement={localeMenuAnchor}
    anchor={true}
    anchorCorner="BOTTOM_LEFT"
  >
    <List>
      <SelectionGroup>
        {#each $locales as _locale}
          <Item on:SMUI:action={() => setLocale(_locale)} selected={_locale === currentLocale}>
            <Text class="label {_locale === currentLocale && 'font-bold'}"
              >{_locale.toUpperCase().slice(0, 2)}</Text
            >
            {#if _locale === currentLocale}
              <SelectionGroupIcon>
                <i class="material-icons">check</i>
              </SelectionGroupIcon>
            {/if}
          </Item>
        {/each}
      </SelectionGroup>
    </List>
  </Menu>
</span>

<style>
  .switcher {
    display: inline-block;
  }
</style>
