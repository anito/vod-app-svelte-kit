<script>
  export { className as class };

  let className = '';
  /**
   * @type {HTMLSpanElement | undefined}
   */
  export let element = void 0;
  export let cancelEditable = () => {};

  export function getElement() {
    return element;
  }

  export function cancel() {
    cancelEditable();
  }
</script>

<span bind:this={element} class={className}>
  <slot />
</span>
