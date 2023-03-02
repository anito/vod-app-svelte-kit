<script lang="ts">
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import type { Readable } from 'svelte/store';

  export let segment: string = '';
  export let external: string | null = null;
  export let href = '';
  export let title = '';
  export let style = '';
  export { className as class };

  const current: Readable<any> = getContext('nav');
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
      <a data-sveltekit-preload-data aria-current={$page.url.pathname === href} {style} {href} {title}
        ><slot /></a
      >
    {:else}
      <slot />
    {/if}
  </li>
{/if}

<style>
  [aria-current='true'] {
    color: var(--primary);
  }
</style>
