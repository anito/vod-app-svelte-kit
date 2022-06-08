<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { getContext } from 'svelte';

	export let segment = null;
	export let href = null;
	export let external = null;
	export let title = null;

	const current = getContext('nav');

	$: active = $current === segment;
</script>

{#if external}
	<li class="nav-item">
		<a target="_blank" href={external} {title}><slot /></a>
	</li>
{:else}
	<li class:active class="nav-item">
		<a
			aria-current={$page.url.pathname.startsWith(href) ? true : undefined}
			sveltekit:prefetch
			{href}
			{title}><slot /></a
		>
	</li>
{/if}

<style>
	[aria-current='true'] {
		color: var(--prime);
	}
</style>
