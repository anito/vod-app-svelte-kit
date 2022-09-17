<script>
  // @ts-nocheck

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let data;

  const { token, result, message } = data;

  onMount(() => {
    setTimeout(async () => {
      const search = token
        ? `?token=${token}&message=${message}&result=${result ? 'success' : 'error'}`
        : '';
      await goto(`/login${search}`);
    }, 500);
  });
</script>
