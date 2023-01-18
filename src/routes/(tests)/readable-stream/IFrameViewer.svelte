<script lang="ts">
  import { onMount, tick } from 'svelte/internal';
  import { fade } from 'svelte/transition';

  export let blob: Blob | MediaSource;
  export let title: string = 'Viewer';

  let mounted = false;
  let src = URL.createObjectURL(blob);

  onMount(async () => {
    mounted = true;
    await tick();
    URL.revokeObjectURL(src);
  });
</script>

{#if mounted}
  <div in:fade={{ duration: 500 }} class="object-container">
    <iframe {src} {title} frameborder="0" />
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
