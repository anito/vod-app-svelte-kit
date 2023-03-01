<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { dispatch } from '$lib/utils';
  import { session } from '$lib/stores';
  import { Heading } from '$lib/components';
  import { _ } from 'svelte-i18n';

  let name = '';

  $: hotswap = $page.url.searchParams.get('hotswap') || '/login';
  $: name = ($session.user && $session.user.name) || name;

  onMount(async () => {
    dispatch('session:stop');
    setTimeout(async () => await goto(hotswap), 2000);
  });
</script>

<div class="flex flex-1 justify-center outer">
  <div class="wrapper">
    <div class="message">
      {#if !$session.user}
        <div in:fly={{ y: -30, duration: 300, opacity: 0 }}>
          <Heading mdc h="5">
            {$_('text.logged-out', { values: { name } })}
          </Heading>
        </div>
          
      {/if}
    </div>
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
    color: var(--ink-color);
  }

  .message {
    border-left: 1px solid var(--ink-color);
    padding: 0;
    margin: 0;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
  }
</style>
