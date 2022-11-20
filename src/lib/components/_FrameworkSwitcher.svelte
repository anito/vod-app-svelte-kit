<script>
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { frameworks, session } from '$lib/stores';
  import { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
  import { Item, Text } from '@smui/list';
  import SvgIcon from './_SvgIcon.svelte';
  import { _ } from 'svelte-i18n';
  import { createRedirectSlug } from '$lib/utils';

  const defaultFrameworkIndex = 1;
  /**
   * @type {import('$lib/types').Framework[]}
   */
  const db = [
    {
      name: 'Sapper',
      icon: 'sapper-icon',
      icontype: 'svg',
      href: 'https://github.com/anito/vod-app',
      host: dev ? 'http://localhost:3001' : 'https://doojoo.de',
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

  let selected;

  frameworks.update(db[defaultFrameworkIndex]);

  $: token = $session.user?.jwt;
  $: url = () => {
    if (token) {
      return `${$frameworks.host}/login?token=${token}&${createRedirectSlug($page.url)}`;
    } else {
      return `${$frameworks.host}${$page.url.pathname}${$page.url.search}`;
    }
  };

  /**
   *
   * @param {import('$lib/types').Framework} value
   */
  async function update(value) {
    frameworks.update(value);
    await tick();
    await goto(url());
  }
</script>

<SelectionGroup>
  {#each db as framework}
    <Item
      on:SMUI:action={() => update(framework)}
      selected={$frameworks.name === framework.name}
      disabled={framework.disabled || $frameworks.name === framework.name}
    >
      {#if framework.icontype === 'svg'}
        <SvgIcon name={framework.icon} class="mr-2" />
      {/if}
      {#if framework.icontype === 'material'}
        <SelectionGroupIcon>
          <i class="material-icons">{framework.icon}</i>
        </SelectionGroupIcon>
      {/if}

      <Text>{framework.name}</Text>
      {#if $frameworks.name === framework.name}
        <SelectionGroupIcon>
          <i class="material-icons">check</i>
        </SelectionGroupIcon>
      {/if}
    </Item>
  {/each}
</SelectionGroup>

<style>
</style>
