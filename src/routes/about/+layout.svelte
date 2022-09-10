<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import Layout from './layout.svelte';

	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
</script>

<Layout {segment}>
	<slot />
	<div slot="ad" />
	<div slot="footer" />
</Layout>
