<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { dispatch } from '$lib/utils';
  import { session } from '$lib/stores';
  import { Heading } from '$lib/components';
  import { _ } from 'svelte-i18n';

  let mounted = false;
  let name = $_('text.user');

  $: hotswap = $page.url.searchParams.get('hotswap') || '/login';
  $: name = $session.user?.name || name
  $: !$session.user && mounted && redirect();

  onMount(async () => {
    mounted = true;
    dispatch('session:stop');
  });

  function redirect(delay = 1000) {
    setTimeout(async () => await goto(hotswap), delay);
  }
</script>

<div class="flex flex-1 justify-center outer">
  <div class="wrapper">
    {#if $session.user}
      <div in:fly={{ x: -30, duration: 300 }}>
        <Heading mdc h="6" inkColor={'on-surface'}>
          {$_('text.one-moment')}
        </Heading>
      </div>
    {:else}
      <div in:fly={{ x: -30, duration: 300 }}>
        <Heading mdc h="6" inkColor={'on-surface'}>
          {$_('text.logged-out', { values: { name } })}
        </Heading>
      </div>

    {/if}
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
    max-width: 32rem;
    margin: 0 1rem;
  }
</style>
