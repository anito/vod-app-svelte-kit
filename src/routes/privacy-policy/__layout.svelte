<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import Layout from './layout.svelte';

	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
</script>

<Layout {segment}>
	<slot />
	<div slot="ad" />
	<div slot="footer" class="flex justify-between">
		<div class="m-auto ml-0" />
		<div class="m-auto mr-0" />
	</div>
</Layout>
