<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { GridItem, LayoutGrid } from '$lib/components';
	import { Legal } from '$lib/components';

	export let segment;
</script>

<LayoutGrid {segment}>
	<GridItem name="pagebar" let:inner>
		<div class={inner}>
			<slot name="pagebar" />
		</div>
	</GridItem>
	<GridItem name="content" let:inner>
		<div class={inner}>
			<slot />
		</div>
	</GridItem>
	<GridItem vcenter name="footer" let:inner>
		<div class={inner}>
			<slot name="footer">Footer</slot>
		</div>
	</GridItem>
	<GridItem vcenter name="ad" let:inner>
		<div class={inner}>
			<slot name="ad"><Legal /></slot>
		</div>
	</GridItem>
</LayoutGrid>
