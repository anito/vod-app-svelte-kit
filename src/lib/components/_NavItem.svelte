<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { getContext } from 'svelte';

	export let segment = null;
	export let href = null;
	export let external = null;
	export let title = null;
	export let style = '';
	export { className as class };

	const current = getContext('nav');
	let className = '';

	$: active = $current === segment;
</script>

{#if external}
	<li class="nav-item" class:className>
		<a target="_blank" href={external} {title}><slot /></a>
	</li>
{:else}
	<li class:active class="nav-item {className}">
		<a
			aria-current={$page.url.pathname.startsWith(href) ? true : undefined}
			sveltekit:prefetch
			{style}
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
