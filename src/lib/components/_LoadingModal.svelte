<script>
	// @ts-nocheck

	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import { convert } from '$lib/utils';

	export let delay = 250;
	export let backgroundColor = '#222222';
	export let opacity = 0.5;

	let root;

	onMount(() => {
		root = document.documentElement;
	});

	$: root && setTimeout(() => root.classList.toggle('navigating', $navigating), delay);
	$: _step1 = backgroundColor.slice(0, 7);
	$: bgColor = `${_step1}${(_step1.length === 7 && opacityToHex) || ''}`;
	$: opacityToHex = convert.dec2Hex(parseFloat(opacity), true);
</script>

<div class="modal-outer" style="background-color: {bgColor}">
	<div class="modal-inner">
		<slot />
	</div>
</div>

<style>
	.modal-outer {
		position: fixed;
		z-index: -9999999;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		opacity: 0;
		transition: opacity 0.3s ease-out;
	}
	:global(.navigating) .modal-outer {
		opacity: 1;
		transition: opacity 0.3s;
		transition-timing-function: ease-in;
		z-index: 9999999;
	}
	.modal-inner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
