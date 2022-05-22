<script>
	// @ts-nocheck

	import { GridItem, LayoutGrid } from '$lib/components';

	export let segment;
</script>

<LayoutGrid fullscreen {segment}>
	<GridItem name="content" let:inner>
		<div class={inner}>
			<slot />
		</div>
	</GridItem>
</LayoutGrid>
