<script lang="ts">
  const regex = /[1-6]/g;
  const DEFAULT_LEVEL = '1';

  export let h = DEFAULT_LEVEL;
  export let mdc = false;
  export let icon: string | boolean = false;
  export { className as class };
  export { wrapperClassName as wrapperClass };
  export let style = '';
  export let wrapperStyle = '';
  export let inkColor = '' as 'on-primary' | 'on-secondary' | '';

  let className = '';
  let wrapperClassName = '';

  $: h = (regex.test(h) && h.match(regex)?.[0]) || DEFAULT_LEVEL;
  $: tag = `h${h}`;
  $: mdcClassName = (mdc && `mdc-typography--headline${h}`) || '';
</script>

<div
  class="svelte-header"
  class:wrapperClassName
  style={wrapperStyle}
  style:--inkColor={`var(--${inkColor})`}
>
  <svelte:element this={tag} class="{mdcClassName} {className}" {style}>
    <slot />
  </svelte:element>
</div>

<style lang="scss">
  .svelte-header {
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
    color: var(--inkColor);
  }
</style>
