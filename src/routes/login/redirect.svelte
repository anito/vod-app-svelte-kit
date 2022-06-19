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
	}
</script>

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	export let token = '';

	onMount(() => {
		setTimeout(() => goto(`/login/?token=${token}`), 300);
	});
</script>
