<script>
	export let name = '';
	export let hcenter = false;
	export let vcenter = false;
	export { className as class };

	let className = '';

	$: inner = `grid-inner slot-${name}`;
</script>

<div class="grid-item {name} {className}" class:is-item={name}>
	<div class="inner flex flex-1 {className}" class:vcenter class:hcenter>
		<slot {inner} />
	</div>
</div>

<style>
	.grid-item {
		display: flex;
		background: var(--back-grid-item);
		position: relative;
		align-self: normal;
	}
	:global(.home) .grid-item {
		background: var(--back-white);
	}
	:global(.home .grid-inner) {
		display: inline-block;
	}
	:global(.grid-inner) {
		display: flex;
		flex: 1 1 auto;
	}
	.vcenter {
		display: flex;
		align-items: center;
	}
	:global(.hcenter .grid-inner) {
		display: flex;
		justify-content: center;
	}

	@media (min-width: 1024px) {
		.side :global(.grid-inner) {
			display: flex;
			flex: 1;
		}
		.side .inner.vcenter {
			justify-content: initial;
			margin: 0;
		}
		.inner.vcenter {
			justify-content: center;
		}
		.inner.hcenter {
			justify-content: center;
		}
	}
</style>
