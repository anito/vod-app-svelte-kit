<script>
	import { page } from '$app/stores';

	let className = '';

	export { className as class };

	$: path = $page.url.pathname.match(/\/([a-z0-9-]+)/gi) || [];
	$: bits = path.map((val) => val.replace('/', ''));
	$: slug = bits.splice(-1);
</script>

<div class="breadcrumb text-xs {className}">
	<a href="/">home</a>
	{#each bits as bit}
		<span class="separator">/</span>
		<a sveltekit:prefetch href={`/${bit}`}>{bit}</a>
	{/each}
	<span class="separator">/</span>
	<span class="slug">{slug}</span>
</div>

<style>
	.breadcrumb {
		padding: 10px;
		color: var(--text-grey);
		text-transform: uppercase;
		display: inline-flex;
	}
	.breadcrumb > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 65px;
		line-height: 0.8rem;
		display: inline-block;
	}
	.separator {
		margin: 0 5px;
	}
</style>
