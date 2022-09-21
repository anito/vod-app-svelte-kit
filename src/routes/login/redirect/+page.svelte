<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let data;

  const { token } = data;

  onMount(() => {
    setTimeout(async () => {
      const search = token ? `?token=${token}` : '';
      await goto(`/login${search}`);
    }, 500);
  });
</script>
