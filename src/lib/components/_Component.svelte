<script lang="typescript">
  export let extended = false;
  export let density = '' as 'sm' | 'md' | ' lg' | '';
  export let type = 'one' as 'one' | 'two' | 'three';
  export let variant = 'primary' as 'primary' | 'secondary';
  export { className as class };
  export let transparent = false;
  export let headerHeight = '50px';

  let className = '';
</script>

<div style={`display: contents;}`} style:--height={headerHeight} {type}>
  <div
    class="component flex flex-1 flex-col {density} {variant}"
    class:density
    class:extended
    class:transparent
  >
    <div class="header">
      <slot name="header">You must provide a header</slot>
    </div>
    <div class="content {className}">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .component {
    position: relative;
    height: 100%;
  }
  .component .header > * {
    color: inherit;
  }
  .component .header > * {
    font-size: inherit;
    line-height: 1em;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .component {
    .header {
      display: flex;
      position: absolute;
      z-index: auto;
      justify-content: center;
      flex-direction: column;
      width: 100%;
    }
    &.primary .header {
      background-color: var(--mdc-theme-primary, rgb(179, 116, 1));
      color: var(--mdc-theme-on-primary);
    }
    &.secondary .header {
      background-color: var(--mdc-theme-secondary, rgb(179, 116, 1));
      color: var(--mdc-theme-on-secondary);
    }
  }
  .component::before {
    content: '';
    display: flex;
    margin-top: 0px;
    position: relative;
    z-index: auto;
  }
  :global(.transparent).component::before {
    color: inherit;
    background-color: transparent;
  }
  .component::before,
  .header {
    height: var(--height, 50px);
    min-height: var(--height, 50px);
  }
  :global(.xs).component::before,
  :global(.xs) .header {
    height: var(--xs-h);
    min-height: var(--xs-h);
    font-size: 0.8em;
  }
  :global(.sm).component::before,
  :global(.sm) .header {
    height: var(--sm-h);
    min-height: var(--sm-h);
    padding: 0 25px;
    font-size: 1.3em;
    width: 100%;
  }
  :global(.md).component::before,
  :global(.md) .header {
    height: var(--md-h);
    min-height: var(--md-h);
    padding: 0 25px;
    font-size: 1.6em;
  }
  :global(.lg).component::before,
  :global(.lg) .header {
    height: var(--lg-h);
    min-height: var(--lg-h);
    padding: 0 25px;
    font-size: 2em;
  }
  :global(.xl).component::before,
  :global(.xl) .header {
    height: var(--xl-h);
    min-height: var(--xl-h);
    padding: 0 25px;
    font-size: 3em;
  }
  .component .content {
    height: 100%;
    z-index: auto;
    flex-shrink: 1;
    /* overflow: auto; */
    -webkit-overflow-scrolling: touch;
  }
  .component.extended .content {
    padding: 60px;
  }
  @media (min-width: 640px) {
    .component .header > :global(*) {
      display: inline;
    }
  }
</style>
