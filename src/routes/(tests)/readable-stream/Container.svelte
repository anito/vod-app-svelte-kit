<script lang="ts">
  import { addClass } from '$lib/utils';

  export { className as class };

  let className = '';
</script>

<div use:addClass={className} class="outer">
  <slot />
</div>

<style>
  .outer {
    --height: 50px;
    position: relative;
  }
</style>
