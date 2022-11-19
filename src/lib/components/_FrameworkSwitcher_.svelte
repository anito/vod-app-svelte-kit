<script>
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { frameworks, session, settings } from '$lib/stores';
  import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import SvgIcon from './_SvgIcon.svelte';
  import IconButton from '@smui/icon-button';
  import Icon from '@smui/select/icon';
  import { _ } from 'svelte-i18n';
  import { proxyEvent } from '$lib/utils';

  const defaultFrameworkIndex = 1;
  const db = [
    {
      name: 'Sapper',
      icon: 'sapper-icon',
      icontype: 'svg',
      href: 'https://github.com/anito/vod-app',
      host: dev ? 'https://localhost:3001' : 'https://doojoo.de',
      target: '_blank',
      disabled: true
    },
    {
      name: 'SvelteKit',
      icon: 'svelte-kit-icon',
      icontype: 'svg',
      href: 'https://github.com/anito/vod-app-svelte-kit',
      host: dev ? 'https://localhost:3000' : 'https://vod-app.doojoo.de',
      target: '_blank'
    }
  ];
  frameworks.update(db[defaultFrameworkIndex]);

  let menu;
  let menuAnchor;

  $: token = $session.user?.jwt;
  $: withToken = (token && `/login?token=${token}&redirect=`) || '';
  $: redirect = `${$frameworks.host}${withToken}${$page.url.pathname}${$page.url.search}`;

  async function update(value) {
    frameworks.update(value);
    await tick();
    await goto(redirect);
  }

  function handleClick(e) {
    e.preventDefault();
    !menu.isOpen() && menu.setOpen(true);
  }
</script>

<span class="menu-anchor lg:-mr-8" bind:this={menuAnchor} use:Anchor>
  <IconButton
    class="material-icons on-surface items-stretch"
    on:click={handleClick}
    aria-label={$_('text.more-options')}
    title={$_('text.more-options')}>more_vert</IconButton
  >
  <Menu bind:this={menu} bind:anchorElement={menuAnchor} anchor={false} anchorCorner="BOTTOM_LEFT">
    <List class="option-list">
      <SelectionGroup>
        {#each db as settings}
          {#if !settings.disabled}
            <Item
              on:SMUI:action={() => update(settings)}
              selected={$frameworks.name === settings.name}
              disabled={$frameworks.name === settings.name}
            >
              {#if settings.icontype === 'svg'}
                <SvgIcon name={settings.icon} class="mr-2" />
              {/if}
              {#if settings.icontype === 'material'}
                <SelectionGroupIcon>
                  <i class="material-icons">{settings.icon}</i>
                </SelectionGroupIcon>
              {/if}

              <Text>{settings.name}</Text>
              <SelectionGroupIcon>
                <i class="material-icons">check</i>
              </SelectionGroupIcon>
            </Item>
          {/if}
        {/each}
      </SelectionGroup>
      <Separator />
      <Item class="justify-center">
        <a
          on:click|preventDefault={() => proxyEvent('session:extend', { force: 'config' })}
          class="github"
          href="."
          target={$frameworks.target}
          title={$_('text.goto-github')}
        >
          <span>
            <SvgIcon name="sync" class="mr-2" fillColor="#000" />
            <Text styyle="max-width: 60%;">Rel.Config</Text>
          </span>
        </a>
      </Item>
      <Separator />
      <Item class="justify-center">
        <a
          class="github"
          href={$frameworks.href}
          target={$frameworks.target}
          title={$_('text.goto-github')}
        >
          <span>
            <SvgIcon name="github" class="mr-2" />
            <Text>GitHub</Text>
          </span>
        </a>
      </Item>
    </List>
  </Menu>
</span>

<style>
  :global(ul.primary ul.option-list > li:not(.nav-item)) a.github,
  :global(ul.primary ul.option-list > li:not(.nav-item)) a.github:hover {
    font-size: inherit;
    font-weight: 400;
  }
</style>
