<script>
  import './_meta.scss';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { infos } from '$lib/stores';
  import { UserGraphic, Dot } from '$lib/components';
  import { Meta, Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { ADMIN, SUPERUSER } from '$lib/utils';

  export /**
   * @type {any}
   */
  let selectionUserId;
  export /**
   * @type {{id: any, role: string}}
   */
  let user;
  export /**
   * @type {any}
   */
  let query;
  export { className as class };

  let className = '';

  const dispatch = createEventDispatcher();

  $: _infos = ($infos?.has(user.id) && $infos.get(user.id).params) || [];
  $: hasPrivileges = user.role === ADMIN || user.role === SUPERUSER;
  $: isSuperuser = user.role === SUPERUSER;

  function itemSelectHandler(e) {
    setTimeout(() => dispatch('itemSelected', { user, target: e.target }), 10);
    goto(`/users/${user.id}${query}`);
  }
</script>

<Item class={className} selected={selectionUserId == user.id} on:SMUI:action={itemSelectHandler}>
  <UserGraphic
    size={40}
    {user}
    badge={hasPrivileges && {
      icon: 'admin_panel_settings',
      color: isSuperuser ? 'rgb(26, 4, 4)' : 'rgb(206, 4, 4)',
      position: 'TOP_RIGHT'
    }}
    borderSize={1}
    borderColor="#c5c5c5"
    title
  />
  <Text>
    <PrimaryText>{user.name}</PrimaryText>
    <SecondaryText>{user.email}</SecondaryText>
  </Text>
  {#if user.protected}
    <Meta class="material-icons locked">lock</Meta>
  {/if}
  <div class="infos">
    {#each _infos as _info}
      <Dot size={5} color={_info.flag} />
    {/each}
  </div>
</Item>

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
</style>
