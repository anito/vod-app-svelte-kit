<script>
  // @ts-nocheck

  import { onMount } from 'svelte';

  const regex = /[1-6]/g;
  const DEFAULT_LEVEL = '1';

  export let h = DEFAULT_LEVEL;
  export let mdc = false;
  export { className as class };
  export let style = '';

  let className = '';
  let container;

  $: level = (regex.test(h) && h.match(regex)[0]) || DEFAULT_LEVEL;

  onMount(() => {});

  function createHeader(el) {
    const children = el.childNodes;
    const header = document.createElement(`h${h}`);

    className
      .trim()
      .split(/\s+/g)
      .map((cls) => cls && header.classList.add(cls));

    mdc && (className = header.classList.add(`mdc-typography--headline${level}`));
    style && header.setAttribute('style', style);

    for (const node of children) header.append(node);
    el.prepend(header);
  }
</script>

<div use:createHeader bind:this={container} class="svelte-header">
  <slot />
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
