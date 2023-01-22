<script lang="ts">
  import './_meta.scss';
  import { page } from '$app/stores';
  import { infos } from '$lib/stores';
  import { UserGraphic, Dot } from '$lib/components';
  import { Meta, Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { ADMIN, dynamicUrl, SUPERUSER } from '$lib/utils';
  import type { Issue, User } from '$lib/types';

  export let selectionUserId: string;
  export let user: User | undefined;
  export let id: string;

  $: _infos = $infos as Map<string, { issues: Issue[] }>;
  $: userInfos =
    ((user) => {
      const id = user?.id;
      if (id) return _infos.get(id)?.issues;
    })(user) || [];
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
  <Item {id} class="usercard-item" selected={selectionUserId == user?.id}>
    <a on:focus={() => focusHandler()} {href} class="flex flex-1 item-inner">
      <span class="grafic-box usercard-box">
        <UserGraphic size="40" {user} {badge} borderSize="1" borderColor="#c5c5c5" />
      </span>
      <span class="content-box usercard-box">
        <Text>
          <PrimaryText>{user.name}</PrimaryText>
          <SecondaryText>{user.email}</SecondaryText>
        </Text>
        {#if user?.protected}
          <Meta class="material-icons locked">lock</Meta>
        {/if}
        <div class="infos">
          {#each userInfos as info}
            <Dot size={5} color={info.flag} />
          {/each}
        </div>
      </span>
    </a>
    <slot />
  </Item>
{/if}

<style>
  :global(.users-list .usercard-item) {
    background: var(--background);
    background: linear-gradient(
      90deg,
      var(--background) 0%,
      var(--background) 25%,
      var(--background-intense) 25%,
      var(--background-intense) 100%
    );
  }
  .usercard-box {
    display: flex;
    align-self: center;
    height: 100%;
  }
  .grafic-box.usercard-box {
    align-items: center;
    margin-right: 20px;
  }
  .content-box.usercard-box {
    width: 100%;
  }
  .infos {
    margin-left: auto;
    margin-right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
