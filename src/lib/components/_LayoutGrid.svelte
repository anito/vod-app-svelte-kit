<script>
	export let segment = '';
	export let fullscreen = false;
	export let sidebar = false;
	export let stretch = false;
	export { className as class };

	let className = '';
</script>

<main>
	<div
		class:fullscreen
		class:sidebar
		class:stretch
		class="
        {segment}
        layout-grid
        {className}"
	>
		<slot />
	</div>
</main>

<style>
	main {
		position: relative;
		margin: 0 auto;
		overflow-x: hidden;
		padding: var(--nav-h) 0 0 0;
	}
	:global(.grid-item.has-background.content) {
		background: var(--prime);
	}
	:global(.grid-item.has-background.side) {
		background: var(--second);
	}
	:global(.grid-item.has-background.footer) {
		background: var(--flash);
	}
	:global(.grid-item.has-background.ad) {
		background: var(--alt);
	}
	:global(.ismobile) .grid {
		height: -webkit-fill-available;
	}
	.layout-grid {
		display: grid;
		grid-gap: var(--grid-gap);
		grid-template-rows: var(--pagebar-h) repeat(2, auto) repeat(2, var(--footer-h));
		grid-template-columns: 1fr;
		grid-template-areas:
			'pagebar'
			'content'
			'content'
			'ad'
			'footer';
		height: var(--main-h);
	}
	.layout-grid.sidebar {
		grid-template-rows: var(--pagebar-h) repeat(2, auto) repeat(2, var(--footer-h));
		grid-template-areas:
			'pagebar'
			'side'
			'content'
			'ad'
			'footer';
	}
	.layout-grid.fullscreen {
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 'content';
	}
	.layout-grid :global(.pagebar) {
		grid-area: pagebar;
		overflow: auto;
	}
	.layout-grid :global(.content) {
		grid-area: content;
		overflow: auto;
	}
	.layout-grid :global(.side) {
		grid-area: side;
		overflow: auto;
	}
	.layout-grid :global(.side .sidebar ul) {
		max-width: var(--sidebar-w);
	}
	.layout-grid :global(.footer) {
		grid-area: footer;
	}
	.layout-grid :global(.ad) {
		grid-area: ad;
	}
	.layout-grid :global(.inner-grid) {
		background-color: var(--back);
	}

	@media (min-width: 900px) {
		.layout-grid {
			grid-template-rows: var(--pagebar-h) auto var(--footer-h);
			grid-template-columns: minmax(auto, var(--ad-w)) auto;
			grid-template-areas:
				'pagebar pagebar'
				'content content'
				'ad footer';
		}
		.layout-grid.no-pagebar {
			grid-template-rows: var(--pagebar-h) auto var(--footer-h);
			grid-template-columns: minmax(auto, var(--ad-w)) auto;
			grid-template-areas:
				'content content'
				'content content'
				'ad footer';
		}
		.layout-grid.sidebar {
			grid-template-rows: var(--pagebar-h) auto var(--footer-h);
			grid-template-columns: minmax(auto, var(--sidebar-w)) auto;
			grid-template-areas:
				'pagebar pagebar'
				'side content'
				'ad footer';
		}
	}
</style>
