<script lang="ts">
  import { addClass } from "$lib/utils";

  export let extended = false;
  export let density = "" as "sm" | "md" | " lg" | "";
  export let variant = "primary" as "primary" | "secondary";
  export { className as class };
  export { headerClassName as headerClass };
  export let transparent = false;
  export let headerHeight = "80px";
  export let contentBackgroundColor = "inherit";
  export let borderShape = "none" as "none" | "small" | "medium" | "large";

  let className = "";
  let headerClassName = "";
</script>

<div
  style="display: contents; flex-grow: 1; position: relative; z-index: 0"
  style:--height={headerHeight}
  style:--border-shape={`var(--mdc-shape-${borderShape})`}
>
  <div
    class="wrapper flex flex-1 flex-col {density} {variant}"
    class:density
    class:extended
    class:transparent
  >
    <div use:addClass={"container-header"} class={headerClassName}>
      <slot name="header">You must provide a header</slot>
    </div>
    <div class="container-content {className}" style:--content-background-color={contentBackgroundColor}>
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    height: 100%;
    .inner {
      --content-background-color: #ddd;
    }
  }
  .wrapper .container-header > * {
    color: inherit;
  }
  .wrapper .container-header > * {
    font-size: inherit;
    line-height: 1em;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .wrapper {
    .container-header {
      display: flex;
      position: absolute;
      z-index: 0;
      justify-content: center;
      flex-direction: column;
      width: 100%;
    }
    &.primary .container-header {
      background-color: var(--mdc-theme-primary, rgb(179, 116, 1));
      color: var(--mdc-theme-on-primary);
    }
    &.secondary .container-header {
      background-color: var(--mdc-theme-secondary, rgb(179, 116, 1));
      color: var(--mdc-theme-on-secondary);
    }
  }
  .wrapper::before {
    content: "";
    display: flex;
    margin-top: 0px;
    position: relative;
  }
  :global(.transparent).wrapper::before {
    color: inherit;
    background-color: transparent;
  }
  .wrapper::before,
  .container-header {
    height: var(--height, 50px);
    min-height: var(--height, 50px);
  }
  .container-header {
    border-top-left-radius: var(--border-shape, 4px);
    border-top-right-radius: var(--border-shape, 4px);
  }
  :global(.xs).wrapper::before,
  :global(.xs) .container-header {
    height: var(--xs-h);
    min-height: var(--xs-h);
    font-size: 0.8em;
  }
  :global(.sm).wrapper::before,
  :global(.sm) .container-header {
    height: var(--sm-h);
    min-height: var(--sm-h);
    padding: 0 25px;
    font-size: 1.3em;
    width: 100%;
  }
  :global(.md).wrapper::before,
  :global(.md) .container-header {
    height: var(--md-h);
    min-height: var(--md-h);
    padding: 0 25px;
    font-size: 1.6em;
  }
  :global(.lg).wrapper::before,
  :global(.lg) .container-header {
    height: var(--lg-h);
    min-height: var(--lg-h);
    padding: 0 25px;
    font-size: 2em;
  }
  :global(.xl).wrapper::before,
  :global(.xl) .container-header {
    height: var(--xl-h);
    min-height: var(--xl-h);
    padding: 0 25px;
    font-size: 3em;
  }
  .wrapper .container-content {
    background-color: var(--content-background-color);
    height: 100%;
    flex-shrink: 1;
    -webkit-overflow-scrolling: touch;
    border-bottom-right-radius: var(--border-shape, 4px);
    border-bottom-left-radius: var(--border-shape, 4px);
  }
  .wrapper.extended .container-content {
    padding: 70px;
  }
  @media (min-width: 640px) {
    .wrapper .container-header > :global(*) {
      display: inline;
    }
  }
</style>
