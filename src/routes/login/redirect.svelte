<script context="module">
  import { goto } from '$app/navigation';

  export function load({ url, params }) {
    const token = url.searchParams.get('token');
    if (token) {
      return {
        props: {
          token
        }
      };
    }
    return {};
  }
</script>

<script>
  // @ts-nocheck

  import { onMount } from 'svelte';

  export let token = '';

  onMount(() => {
    setTimeout(async () => {
      const search = token ? `?token=${token}` : '';
      await goto(`/login${search}`);
    }, 500);
  });
</script>
