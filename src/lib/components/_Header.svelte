<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	let container;
	let match;
	let className = '';

	const regex = /[1-6]/g;
	const DEFAULT_LEVEL = '1';

	export let h = DEFAULT_LEVEL;
	export { className as class };
	export let mdc = false;
	export let style = '';

	onMount(() => {
		h = h.toString();
		h = (match = h.match(regex)) && match.length && match[0];

		if (!h) h = LEVEL;

		const header = document.createElement(`h${h}`);
		mdc && (className = className.concat(` mdc-typography--headline${h}`));
		className
			.trim()
			.split(/\s+/g)
			.map((cls) => cls && header.classList.add(cls));
		for (const node of container.childNodes) header.append(node);
		style && header.setAttribute('style', style);
		container.prepend(header);
	});
</script>

<div bind:this={container} class="svelte-header">
	<slot />
</div>

<style>
	:global([class*='mdc-typography--headline']) {
		color: inherit;
	}
	.svelte-header {
		margin: auto 0;
	}
	.svelte-header > :global(:first-child) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		line-height: initial;
	}
</style>
