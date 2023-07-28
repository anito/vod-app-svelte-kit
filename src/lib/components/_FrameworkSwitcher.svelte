<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { framework, session } from '$lib/stores';
  import { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
  import { Item, Label } from '@smui/list';
  import SvgIcon from './_SvgIcon.svelte';
  import { _ } from 'svelte-i18n';
  import { createRedirectSlug } from '$lib/utils';
  import type { Framework } from '$lib/types';

  export let db: Framework[] = [];
  export let defaultIndex = 1;

  framework.update(db[defaultIndex]);

  $: token = $session.user?.jwt;
  $: url = () => {
    if (token) {
      return `${$framework.host}/login?token=${token}&${createRedirectSlug($page.url)}`;
    } else {
      return `${$framework.host}${$page.url.pathname}${$page.url.search}`;
    }
  };

  async function update(value: Framework) {
    framework.update(value);
    await tick();
    await goto(url());
  }
</script>

<SelectionGroup>
  {#each db as fw}
    <Item
      on:SMUI:action={() => update(fw)}
      selected={$framework.name === fw.name}
      disabled={fw.disabled || $framework.name === fw.name}
    >
      {#if fw.icontype === 'svg'}
        <SvgIcon name={fw.icon} class="mr-2" />
      {/if}
      {#if fw.icontype === 'material'}
        <SelectionGroupIcon>
          <i class="material-icons">{fw.icon}</i>
        </SelectionGroupIcon>
      {/if}

      <Label class="label">{fw.name}</Label>
      {#if $framework.name === fw.name}
        <SelectionGroupIcon>
          <i class="material-icons">check</i>
        </SelectionGroupIcon>
      {/if}
    </Item>
  {/each}
</SelectionGroup>

<style>
</style>
