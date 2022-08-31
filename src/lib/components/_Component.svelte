<script>
  export let extended = false;
  export let variant = '';
  export { className as class };
  export let transparent = false;

  let className = '';
</script>

<div class="component flex flex-1 flex-col {className} {variant}" class:extended class:transparent>
  <div class="header">
    <slot name="header">No Header provided</slot>
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style>
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
  .component .header {
    display: flex;
    position: absolute;
    z-index: 0;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    color: var(--on-prime);
  }
  .component::before {
    content: '';
    display: flex;
    margin-top: 0px;
    background-color: var(--prime, rgb(179, 116, 1));
    position: relative;
    z-index: 0;
  }
  :global(.transparent).component::before {
    color: inherit;
    background-color: transparent;
  }
  .component::before,
  .header {
    --h: 50px;
    height: var(--h);
    min-height: var(--h);
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
    z-index: 1;
    flex-shrink: 1;
    overflow: auto;
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
