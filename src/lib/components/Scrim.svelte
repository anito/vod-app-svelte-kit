<script>
	// @ts-nocheck

	import { onMount, setContext, getContext, createEventDispatcher } from 'svelte';

	export let active = true;
	let component;

	const dispatch = createEventDispatcher();

	function closeComponent() {
		console.log(component);
	}

	function foo(node) {
		dispatch('scrim:active', component);

		return {
			update: (open) => console.log('open updated'),
			destroy: () => console.log('uploader destroyed')
		};
	}

	function fool(e) {
		console.log(e);
	}
</script>

<div
	use:foo
	on:active={fool}
	class:active
	class="mdc-drawer-scrim scrim"
	on:click={closeComponent}
/>

<style>
	.scrim {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
		transition-property: opacity;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global([class*='--open']) .scrim {
		display: block;
	}
	:global([class*='--modal']) .scrim {
		background-color: rgba(0, 0, 0, 0.32);
	}
</style>
