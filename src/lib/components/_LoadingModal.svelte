<script>
	// @ts-nocheck

	import { navigating } from '$app/stores';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { convert } from '$lib/utils';

	export let wait = 250;
	export let backgroundColor = '#222222';
	export let opacity = 0.5;

	const SUPRESS_SEARCHES_KEY = 'searches';
	const SUPPRESS_PATH_KEY = 'paths';

	// configure url pathnames and/or searchParams to supress the LoadinSpinner here
	const supressSearches = ['active'];
	const supressPaths = [];

	let root;
	let disabled = false;
	let suppress = new Map([
		[
			SUPRESS_SEARCHES_KEY,
			(searches, to) => {
				searches.forEach((slug) => {
					if (to.searchParams.has(slug)) {
						disabled = true;
						return;
					}
				});
			}
		],
		[
			SUPPRESS_PATH_KEY,
			(paths, to) => {
				paths.forEach((slug) => {
					if (to.pathname.indexOf(slug) != -1) {
						disabled = true;
						return;
					}
				});
			}
		]
	]);

	beforeNavigate(({ to }) => {
		disabled = false;
		suppress.forEach((fn, key) => {
			key === SUPRESS_SEARCHES_KEY && fn(supressSearches, to);
			key === SUPPRESS_PATH_KEY && fn(supressPaths, to);
		});
	});

	afterNavigate(() => (disabled = false));

	onMount(() => {
		root = document.documentElement;
	});

	$: !disabled && setTimeout(() => root?.classList.toggle('navigating', $navigating), wait);
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
