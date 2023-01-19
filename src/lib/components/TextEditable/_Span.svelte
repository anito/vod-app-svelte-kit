<script lang="ts">
  export { className as class };
  export let cancelEditable = () => {};
  export function getElement() {
    return element;
  }
  export function cancel() {
    cancelEditable();
  }

  let className = '';
  let element: Element;
</script>

<span bind:this={element} class={className}>
  <slot />
</span>
