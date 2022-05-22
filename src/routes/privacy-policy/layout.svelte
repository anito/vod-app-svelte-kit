<script>
	// @ts-nocheck

	import { GridItem, LayoutGrid } from '$lib/components';

	export let stretch = false;

	export let segment;
</script>

<LayoutGrid fullscreen {segment} {stretch}>
	<GridItem name="content" let:inner>
		<div class={inner}>
			<slot />
		</div>
	</GridItem>
	<GridItem vcenter name="footer" let:inner>
		<div class={inner}>
			<slot name="footer" />
		</div>
	</GridItem>
	<GridItem vcenter name="ad" let:inner>
		<div class={inner}>
			<slot name="ad" />
		</div>
	</GridItem>
</LayoutGrid>

<style>
</style>
