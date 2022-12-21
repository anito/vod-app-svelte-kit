<script>
  const regex = /[1-6]/g;
  const DEFAULT_LEVEL = '1';

  export let h = DEFAULT_LEVEL;
  export let mdc = false;
  export { className as class };
  export let style = '';

  let className = '';

  $: h = (regex.test(h) && h.match(regex)?.[0]) || DEFAULT_LEVEL;
  $: tag = `h${h}`;
  $: mdcClassName = (mdc && `mdc-typography--headline${h}`) || '';
</script>

<div class="svelte-header">
  <svelte:element this={tag} class="{mdcClassName} {className}" {style}>
    <slot />
  </svelte:element>
</div>

<style lang="scss">
  :global([class*='mdc-typography--headline']) {
    color: inherit;
  }
  .svelte-header {
    margin: auto 0;
    :global {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        line-height: initial;
      }
    }
  }
</style>
