<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import { addClass } from '$lib/utils';

  import type { Writable } from 'svelte/store';

  export { className as class };
  export let store: Writable<any>;

  let storeData: any;
  let className = '';

  const dispatch = createEventDispatcher();
  const unsubscribe = store.subscribe((data: any) => {
    storeData = data;
  });

  $: storeData?.status && dispatch('stream:status', { ...storeData });
  $: progress = storeData.percent;

  onMount(() => {
    return () => unsubscribe();
  });
</script>

<div use:addClass={className} class="loader">
  <slot {progress} />
</div>

<style>
  .loader {
    display: flex;
    justify-content: center;
    flex: 1 0 auto;
    height: 100%;
    font-size: 7em;
    text-shadow: 3px 10px 35px rgba(0, 0, 0, 0.5);
  }
</style>
