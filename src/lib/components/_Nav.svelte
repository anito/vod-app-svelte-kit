<script>
	// @ts-nocheck

	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let segment;
	export let page;
	export let logo;
	export let home = 'Home';
	export let home_title = 'Homepage';

	const showHome = true;
	const current = writable(null);
	setContext('nav', current);

	let open = false;
	let visible = true;

	// hide nav whenever we navigate
	page.subscribe(() => {
		open = false;
	});

	function intercept_touchstart(event) {
		if (!open) {
			event.preventDefault();
			event.stopPropagation();
			open = true;
		}
	}

	// Prevents navbar to show/hide when clicking in docs sidebar
	let hash_changed = false;
	function handle_hashchange() {
		hash_changed = true;
	}

	let last_scroll = 0;
	function handle_scroll() {
		const scroll = window.pageYOffset;
		if (!hash_changed) {
			visible = scroll < 50 || scroll < last_scroll;
		}

		last_scroll = scroll;
		hash_changed = false;
	}

	$: $current = segment;
</script>

<svelte:window on:hashchange={handle_hashchange} on:scroll={handle_scroll} />

<header class:visible={visible || open}>
	<nav>
		<a
			sveltekit:prefetch
			href="/"
			class="home"
			title={home_title}
			style="background-image: url('{logo}')">{home}</a
		>

		{#if open}
			<div class="modal-background hide-if-desktop" on:click={() => (open = false)} />
		{/if}

		<ul
			class="primary"
			class:open
			on:touchstart|capture={intercept_touchstart}
			on:mouseenter={() => (open = true)}
			on:mouseleave={() => (open = false)}
		>
			<li class:hide-if-desktop={!showHome} class:active={!segment} class="nav-item">
				<a sveltekit:prefetch href="/">{home}</a>
			</li>
			<slot />
		</ul>
	</nav>
</header>

<style>
	header {
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100vw;
		height: var(--nav-h);
		padding: 0 var(--side-nav);
		margin: 0 auto;
		background-color: white;
		box-shadow: 0 -0.4rem 0.9rem 0.2rem rgba(0, 0, 0, 0.5);
		font-family: var(--font);
		z-index: 100;
		user-select: none;
		transform: translate(0, calc(-100% - 1rem));
		transition: transform 0.2s;
		color: inherit;
	}

	header.visible {
		transform: none;
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: var(--nav-h);
		padding: 0 var(--side-nav) 0 var(--side-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: transparent;
		transform: none;
		transition: none;
		box-shadow: none;
	}

	.primary {
		list-style: none;
		font-family: var(--font);
		margin: 0;
		line-height: 1;
	}

	.primary :global(li.nav-item) {
		display: block;
		display: none;
	}

	.primary :global(li.nav-item.active) {
		display: block;
	}

	.primary {
		position: relative;
		padding: 0 3rem 0 0;
		background: url(/icons/chevron.svg) calc(100% - 1em) 0.05em no-repeat;
		background-size: 1em 1em;
	}

	.primary::after {
		/* prevent clicks from registering if nav is closed */
		position: absolute;
		content: '';
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	.primary.open {
		padding: 0 0 1em 0;
		background: white;
		border-left: 1px solid #eee;
		border-right: 1px solid #eee;
		border-bottom: 1px solid #eee;
		border-radius: 0 0 var(--border-r) var(--border-r);
		align-self: start;
	}

	.primary.open > :global(li.nav-item) {
		display: block;
		text-align: right;
	}

	.primary.open::after {
		display: none;
	}

	.primary > :global(li.nav-item a) {
		font-size: var(--h4);
		font-weight: 600;
		padding: 0 0.5rem;
		border: none;
		color: inherit;
		display: inline-block !important;
		min-width: 40px;
	}

	.primary.open > :global(li.nav-item a) {
		padding: 0.9375rem 2.3125rem 0.9375rem 2.5rem;
		display: block;
	}

	.primary.open > :global(li.nav-item):first-child :global(a) {
		padding-top: 1.4375rem;
	}

	.primary :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}

	.home {
		position: relative;
		top: -0.1rem;
		width: 2.6rem;
		height: 2.925rem;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		background: 0 50% no-repeat;
		background-size: auto 100%;
		text-indent: -9999px;
		/* z-index: 11; */
	}

	.primary > :global(li.nav-item.active a) {
		color: var(--prime);
	}

	.modal-background {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: rgba(255, 255, 255, 0.9);
	}

	a {
		color: inherit;
		border-bottom: none;
		transition: none;
	}

	.primary > :global(li.nav-item):not(.active) :global(a):hover {
		color: var(--flash);
	}

	@media (min-width: 991px) {
		.primary {
			padding: 0;
			background: none;
		}

		.primary.open {
			padding: 0;
			background: transparent;
			border: none;
			align-self: initial;
		}

		.primary.open > :global(li.nav-item) {
			display: inline;
			text-align: left;
		}

		.primary.open > :global(li.nav-item a) {
			font-size: var(--h4);
			padding: 0 0.5rem;
		}

		.primary::after {
			display: none;
		}

		.primary :global(li.nav-item) {
			display: inline !important;
			padding-left: 5px;
		}

		.hide-if-desktop {
			display: none !important;
		}
	}
</style>
