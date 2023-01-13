<script lang="ts">
  import { onMount, tick } from 'svelte/internal';
  import { fade } from 'svelte/transition';

  export let blob: any;
  export let title: string = 'Viewer';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function setSource(node: HTMLIFrameElement) {
    node.src = blob;
    URL.revokeObjectURL(blob);
  }
</script>

{#if mounted}
  <div in:fade={{ duration: 500 }} class="object-container">
    <iframe use:setSource {title} frameborder="0" />
  </div>
{/if}

<style>
  .object-container {
    object-fit: contain;
    width: 100%;
  }
  iframe {
    width: 100%;
    height: 100%;
  }
</style>
