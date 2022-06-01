<script context="module">
	import { goto } from '$app/navigation';

	export function load({ url }) {
		const token = url.searchParams.get('token');
		if (token) {
			return {
				props: {
					token
				}
			};
		}
	}
</script>

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	export let token = '';

	onMount(() => {
		goto(`/login/?token=${token}`);
	});
</script>
