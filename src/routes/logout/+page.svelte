<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { Heading } from '$lib/components';
  import { _ } from 'svelte-i18n';

  export let data;

  $: redirectPath = data.success
    ? $page.url.searchParams.get('hotswap') || $page.data.config.Session?.logoutredirect
    : '/';

  onMount(async () => {
    redirect();
  });

  function redirect() {
    setTimeout(async () => await goto(redirectPath), 1000);
  }
</script>

<div class="flex flex-1 justify-center outer">
  <div class="wrapper">
    <Heading mdc h="5" inkColor={'on-surface'}>
      <div in:fly={{ y: -40, duration: 300 }}>
        {$_('text.closing-current-session')}
      </div>
    </Heading>
  </div>
</div>

<style>
  .outer {
    width: 100vw;
    height: 100vh;
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
  }
</style>
