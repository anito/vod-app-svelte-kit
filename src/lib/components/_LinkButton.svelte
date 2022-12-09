<script>
  import '$lib/components/_button.scss';
  import Button from '@smui/button';

  /**
   * @type {any}
   */
  export let href;
</script>

{#if href}
  <Button {href} ripple={false} class="link-button">
    <slot />
  </Button>
{:else}
  <Button ripple={false} class="link-button">
    <slot />
  </Button>
{/if}

<style>
</style>
