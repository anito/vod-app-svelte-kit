<script lang="ts">
  export let size = 'medium';
  export let before = false;
  export let after = false;
  export let above = false;
  export let below = false;
  export let right = false;
  export { className as class };

  let className = '';
</script>

<span class="badge {className} {size}" class:before class:right class:after class:below class:above>
  <div class="badge-content">
    <slot />
  </div>
</span>

<style>
  .badge {
    position: absolute;
    border-radius: 99px;
  }
  .badge-content {
    text-align: center;
    transition: transform 0.2s ease-in-out;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
    padding: 0 5px;
  }
  .medium {
    min-width: 22px;
    height: 22px;
    line-height: 22px;
  }
  .above {
    top: -11px;
  }
  .after {
    right: -11px;
  }
  .right {
    right: 11px;
  }
  .flash {
    background: var(--flash);
    color: var(--back-white);
  }
</style>
