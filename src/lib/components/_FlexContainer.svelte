<script lang="ts">
  import { max } from 'date-fns';

  export let maxHeight: string = '100%';
  export let style = '';
</script>

<div class="wrapper" style:--max-height={maxHeight}>
  <div class="container" {style}>
    <span style="text-align: center;"><slot /></span>
  </div>
</div>

<style>
  .wrapper {
    height: 100%;
    max-height: var(--max-height);
    display: flex;
    justify-content: center;
    flex-grow: 1;
  }
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.5em;
    font-weight: 600;
    opacity: 0.5;
  }
</style>
