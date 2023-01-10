<script lang="typescript">
  import './_meta.scss';
  import { page } from '$app/stores';
  import { infos } from '$lib/stores';
  import { UserGraphic, Dot } from '$lib/components';
  import { Meta, Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { ADMIN, dynamicUrl, SUPERUSER } from '$lib/utils';
  import type { User } from '$lib/types';

  export let selectionUserId: string;
  export let user: User | undefined;
  export let id: string;
  export { className as class };

  let className = '';

  $: _infos = ($infos?.has(user?.id) && $infos.get(user?.id).params) || [];
  $: hasPrivileges = user?.role === ADMIN || user?.role === SUPERUSER;
  $: isSuperuser = user?.role === SUPERUSER;
  $: badge = {
    icon: (hasPrivileges && 'admin_panel_settings') || '',
    color: isSuperuser ? 'rgb(26, 4, 4)' : 'rgb(206, 4, 4)',
    position: 'TOP_RIGHT',
    size: 'small'
  };
  $: href = user && dynamicUrl(user.id, $page.url);

  function focusHandler() {}
</script>

{#if user}
  <Item {id} class={className} selected={selectionUserId == user?.id}
    ><a on:focus={() => focusHandler()} {href} class="flex flex-1 item-inner">
      <UserGraphic size="40" {user} {badge} borderSize="1" borderColor="#c5c5c5" />
      <Text>
        <PrimaryText>{user.name}</PrimaryText>
        <SecondaryText>{user.email}</SecondaryText>
      </Text>
      {#if user?.protected}
        <Meta class="material-icons locked">lock</Meta>
      {/if}
      <div class="infos">
        {#each _infos as _info}
          <Dot size={5} color={_info.flag} />
        {/each}
      </div>
    </a>
    <slot />
  </Item>
{/if}

<style>
  .infos {
    margin-left: auto;
    margin-right: 0;
  }
  :global(.locked) {
    position: absolute;
    top: 0;
    right: 0;
    margin: 3px;
    font-size: 0.7em;
  }
  .item-inner {
    border-bottom: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: 100%;
    align-items: center;
  }
</style>
