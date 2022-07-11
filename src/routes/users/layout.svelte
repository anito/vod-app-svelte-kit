<script>
	// @ts-nocheck

	import { GridItem, LayoutGrid } from '$lib/components';
	import Modal from '$lib/components/_Modal.svelte';

	export let segment;
	export let stretch = false;
	export let sidebar = false;
</script>

<Modal key="editor-modal" closeButton={false}>
	<LayoutGrid {segment} {stretch} {sidebar}>
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
		<GridItem name="side" let:inner>
			<div class={inner}>
				<slot name="side">Sidebar</slot>
			</div>
		</GridItem>
		<GridItem vcenter name="footer" let:inner>
			<div class="{inner} ml-1">
				<slot name="footer">Footer</slot>
			</div>
		</GridItem>
		<GridItem vcenter hcenter name="ad" let:inner>
			<div class={inner}>
				<slot name="ad">Advertisement</slot>
			</div>
		</GridItem>
	</LayoutGrid>
</Modal>

<style></style>
