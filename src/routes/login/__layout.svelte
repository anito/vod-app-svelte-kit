<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Layout from './layout.svelte';
	import { Legal } from '$lib/components';
	import { windowSize } from '$lib/utils';

	let root;
	let viewportSize;

	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];

	onMount(() => {
		root = document.documentElement;
		root.classList.add('is-login-page');

		viewportSize = windowSize();
		window.addEventListener('resize', setViewportSize);

		return () => {
			window.removeEventListener('resize', setViewportSize);
			root.classList.remove('is-login-page');
		};
	});

	function setViewportSize() {
		viewportSize = windowSize();
	}
</script>

<Layout>
	<slot />
	<div slot="ad"><Legal /></div>
	<div slot="footer" class="flex justify-between">
		<div class="m-auto ml-0" />
		<div class="m-auto mr-0" />
	</div>
</Layout>
