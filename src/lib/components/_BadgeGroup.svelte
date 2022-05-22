<script>
  export { className as class };
  export let right = false;
  export let left = false;

  let className = '';
</script>

<div class="badge-group {className}" class:right class:left>
  <slot />
</div>

<style>
  .badge-group {
    position: absolute;
    display: inline-flex;
    margin-right: 5px;
    margin-left: 5px;
  }
  .badge-group :global(.badge) {
    position: relative;
    align-self: center;
  }
  .right {
    right: 11px;
  }
  .left {
    left: 11px;
  }
</style>
