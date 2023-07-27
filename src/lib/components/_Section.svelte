<script type="ts">
  export { className as class };

  let className = '';
</script>

<section class={className}>
  <slot />
</section>

<style>
  section {
    position: relative;
    margin: 6.25rem auto;
    padding: 0 var(--side-nav);
    max-width: 75rem;
  }

  section :global(h3) {
    color: var(--text);
  }
</style>
