<script context="module">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  export async function load({ status, error }) {
    return { title: `${status} | ${error.message}` };
  }
</script>

<script>
  // @ts-nocheck
  export let title;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="wrapper">
  <h1 class="pt-2">{title}</h1>

  <div class="message">
    {$page.error.message}
  </div>
  {#if dev && $page.error.stack}
    <pre>{$page.error.stack}</pre>
  {/if}
</div>

<style>
  h1 {
    margin: 0 auto;
  }

  h1 {
    margin: 0 0 0.5em 0;
  }

  .wrapper {
    padding-top: var(--nav-h);
    margin: 0 3rem;
    display: flex;
    flex-direction: column;
  }
  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>
