<script lang="ts">
  import { page } from '$app/stores';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { session } from '$lib/stores';
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import { fly } from 'svelte/transition';
  import { dispatch } from '$lib/utils';

  export let data: PageData;
  let name = '';

  $: hotswap = $page.url.searchParams.get('hotswap') || '/login';
  $: name = ($session.user && $session.user.name) || name;

  onMount(async () => {
    dispatch('session:stop');
    setTimeout(async () => await goto(hotswap), 2000);
  });
</script>

<div class="flex flex-1 justify-center error-container">
  <div class="error">
    <span class="status" />
    <div class="message">
      {#if $session.user}
        <h1>{$_('text.logging-out', { values: { name } })}</h1>
      {:else}
        <h1 in:fly={{ x: 200, duration: 800 }}>{$_('text.logged-out', { values: { name } })}</h1>
      {/if}
    </div>
  </div>
</div>

<style>
  .error-container {
    --ink-color: #202020;
    width: 100vw;
    height: 100vh;
  }

  .error {
    display: flex;
    align-items: center;
    max-width: 32rem;
    margin: 0 1rem;
    color: var(--ink-color);
  }

  .status {
    font-weight: 200;
    font-size: 3rem;
    line-height: 1;
    position: relative;
    top: -0.05rem;
  }

  .message {
    border-left: 1px solid var(--ink-color);
    padding: 0 0 0 1rem;
    margin: 0 0 0 1rem;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
  }

  .message h1 {
    font-weight: 400;
    font-size: 1em;
    margin: 0;
  }
</style>
