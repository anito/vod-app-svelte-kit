<script>
	export let extended = false;
	export let variant = 'sm';
	export { className as class };

	let className = '';
</script>

<div class="component {className} {variant}" class:extended>
	<div class="header">
		<slot name="header">No Header provided</slot>
	</div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.component {
		position: relative;
		display: flex;
		flex: 1;
		flex-direction: column;
		height: 100%;
	}
	.component .header :global(*) {
		color: inherit;
	}
	.component .header > :global(*) {
		color: var(--back);
		font-size: inherit;
		line-height: 1em;
		display: block;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.component .header {
		display: flex;
		padding: 0 25px;
		position: absolute;
		justify-content: center;
		flex-direction: column;
		width: 90%;
	}
	.component::before {
		content: '';
		display: flex;
		margin-top: 0px;
		background-color: rgb(179, 116, 1);
		background-color: var(--prime);
		position: relative;
	}
	:global(.xs.component::before),
	:global(.xs) .header {
		height: var(--xs-h);
		min-height: var(--xs-h);
		font-size: 0.8em;
	}
	:global(.sm.component::before),
	:global(.sm) .header {
		height: var(--sm-h);
		min-height: var(--sm-h);
		font-size: 1.3em;
		width: 100%;
	}
	:global(.md.component::before),
	:global(.md) .header {
		height: var(--md-h);
		min-height: var(--md-h);
		font-size: 1.6em;
	}
	:global(.lg.component::before),
	:global(.lg) .header {
		height: var(--lg-h);
		min-height: var(--lg-h);
		font-size: 2em;
	}
	:global(.xl.component::before),
	:global(.xl) .header {
		height: var(--xl-h);
		min-height: var(--xl-h);
		font-size: 3em;
	}
	.component .content {
		flex-shrink: 1;
	}
	.component.extended .content {
		padding: 60px;
	}
	@media (min-width: 640px) {
		.component .header > :global(*) {
			display: inline;
		}
	}
</style>
