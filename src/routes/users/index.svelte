<script>
  // @ts-nocheck

  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { sitename, users, settings } from '$lib/stores';
  import { _ } from 'svelte-i18n';
  import { page, session } from '$app/stores';
  import { createRedirectSlug, INBOX, TABS } from '$lib/utils';

  /**
   * @type {bool}
   */
  let waitForSettings = false;
  /**
   * @type {never[]}
   */
  let _users = [];

  export { _users as users };

  $: waitForSettings &&
    ((tab) => {
      if (!isNaN(parseInt(tab))) {
        const search =
          tab === 0
            ? `?tab=${TABS[tab]}`
            : tab === 1
            ? `?tab=${TABS[tab]}`
            : tab === 2
            ? `?tab=${TABS[tab]}&active=${INBOX}`
            : '';
        redirect(search);
      }
    })($settings.Site?.defaultUserTab);

  $: users.update(_users);

  onMount(() => {
    if ($page.url.searchParams.has('tab')) {
      redirect($page.url.search);
    } else {
      waitForSettings = true;
    }
  });

  function redirect(search) {
    let slug = $session.user?.id;
    if (slug) {
      setTimeout(() => goto(`${$page.url.pathname}/${slug}${search}`), 100);
    } else {
      setTimeout(() => goto(`/login${createRedirectSlug($page.url)}`), 100);
    }
  }
</script>

<svelte:head>
  <title>{$sitename} | Users</title>
</svelte:head>

<div class="flex justify-center items-center flex-1">
  <div class="empty-selection">
    <span style="text-align: center;">{$_('text.empty-user-selection')}</span>
  </div>
</div>

<style>
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
</style>
