<script lang="ts">
  const regex = /[1-6]/g;
  const DEFAULT_LEVEL = "2";

  export let h: "1" | "2" | "3" | "4" | "5" | "6" = DEFAULT_LEVEL;
  export let mdc = false;
  export { className as class };
  export { wrapperClassName as wrapperClass };
  export let style = "";
  export let wrapperStyle = "";
  export let inkColor = "" as "on-primary" | "on-secondary" | "on-surface";

  let className = "";
  let wrapperClassName = "";

  $: level = (regex.test(h) && h.match(regex)?.[0]) || DEFAULT_LEVEL;
  $: tag = `h${level}`;
  $: mdcClassName = (mdc && `mdc-typography--headline${h}`) || "";
</script>

<div
  class="svelte-header"
  class:wrapperClassName
  style={wrapperStyle}
  style:--inkColor={`var(--${inkColor})`}
>
  <svelte:element
    this={tag}
    class="{mdcClassName} {className}"
    {style}
    title=""
  >
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
