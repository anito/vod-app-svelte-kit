<script lang="ts">
	import { GridItem, LayoutGrid } from '$lib/components';

	export let segment: string;
</script>

<LayoutGrid {segment}>
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
			<slot name="ad">Advertisement</slot>
		</div>
	</GridItem>
</LayoutGrid>
