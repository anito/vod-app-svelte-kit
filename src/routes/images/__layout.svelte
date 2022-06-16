<script context="module">
	import * as api from '$lib/api';

	export async function load({ session }) {
		const res = await api.get('images', session.user?.jwt);

		if (!res?.success) {
			this.error((res.data && res.data.code) || res.status, res.message || res.responseText);
		}
	}
</script>

<script>
	// @ts-nocheck

	import Layout from './layout.svelte';
	import { Info, Legal } from '$lib/components';
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';

	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
</script>

<Layout {segment}>
	{#if $session.role === 'Administrator'}
		<slot />
	{:else}
		<div class="paper-container">
			<div class="vcentered">
				<Info title="Unauthorized" let:href>
					<a {href} on:click|preventDefault={() => goto(href)}>Login</a>
				</Info>
			</div>
		</div>
	{/if}
	<div slot="ad">
		<div class="m-auto ml-0"><Legal /></div>
	</div>
	<div slot="footer" />
</Layout>

<style>
	.paper-container {
		display: flex;
		flex: 1;
		justify-content: center;
	}
	.vcentered {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
