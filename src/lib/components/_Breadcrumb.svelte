<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button, { Icon, Label } from '@smui/button';

  let className = '';

  export { className as class };
  export let simple = false;
  export let detailed = false;

  $: path = $page.url.pathname.match(/\/([a-z0-9-]+)/gi) || [];
  $: bits = path.map((val) => val.replace('/', ''));
  $: slug = bits.splice(-1);
  $: simple_bit = (bits.length > 0 && bits[bits.length - 1]) || '';
</script>

<div class="breadcrumb text-xs {className}" class:simple>
  {#if simple}
    <span class="flex simple-breadcrumb">
      <Button on:click={() => goto(`/${simple_bit}`)} class="unelevated">
        <Icon class="material-icons">navigate_before</Icon>
        <Label class="label">{simple_bit || 'home'}</Label>
      </Button>
      {#if detailed}<span class="label pl-4">{slug}</span>{/if}
    </span>
  {:else}
    <a href="/">home</a>
    {#each bits as bit}
      <span class="separator">/</span>
      <a data-sveltekit-prefetch href={`/${bit}`}>{bit}</a>
    {/each}
    <span class="separator">/</span>
    <span class="label">{slug}</span>
  {/if}
</div>

<style>
  .breadcrumb {
    margin-left: 20px;
    padding: 3px;
    color: var(--text-grey);
    text-transform: uppercase;
    display: inline-flex;
  }
  .breadcrumb:not(.simple) > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 65px;
    line-height: 0.8rem;
    display: inline-block;
  }
  .separator {
    margin: 0 5px;
  }
  .label {
    align-self: center;
  }
</style>
