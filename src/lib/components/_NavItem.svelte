<script>
  // @ts-nocheck

  import { page } from '$app/stores';
  import { getContext } from 'svelte';

  export let segment = '';
  export let external = null;
  export let href = '';
  export let title = '';
  export let style = '';
  export { className as class };

  const current = getContext('nav');
  let className = '';

  $: active = segment && $current === segment;
</script>

{#if external}
  <li class:active class="nav-item" class:className>
    <a target="_blank" rel="noreferrer" href={external} {title} {style}><slot /></a>
  </li>
{:else}
  <li class:active class="nav-item {className}">
    {#if href}
      <a data-sveltekit-prefetch aria-current={$page.url.pathname === href} {style} {href} {title}
        ><slot /></a
      >
    {:else}
      <span>
        <slot />
      </span>
    {/if}
  </li>
{/if}

<style>
  [aria-current='true'] {
    color: var(--primary);
  }
</style>
