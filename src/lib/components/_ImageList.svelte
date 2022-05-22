<script>
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { images } from '$lib/stores';
	import { post } from '$lib/utils';

	import Fab from '@smui/fab';
	import FormField from '@smui/form-field';
	import Button from '@smui/button';
	import Textfield, { Input, Textarea } from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import { Label } from '@smui/common';

	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Checkbox from '@smui/checkbox';

	let selected = [];
</script>

<DataTable table$aria-label="Products">
	<Head>
		<Row>
			<Cell>
				<Checkbox checkbox />
			</Cell>
			<Cell>ID</Cell>
			<Cell>Title</Cell>
			<Cell>Description</Cell>
			<Cell>Created</Cell>
		</Row>
	</Head>
	<Body>
		{#if $images && $images.length}
			{#each $images as { id, title, description, created }, i (id)}
				<Row>
					<Cell>
						<Checkbox bind:group={selected} value={title} valueKey={id} />
					</Cell>
					<Cell>{id}</Cell>
					<Cell>{title}</Cell>
					<Cell>{description}</Cell>
					<Cell date>{created}</Cell>
				</Row>
			{/each}
		{:else}
			<Row>
				<Cell colspan="5">no images</Cell>
			</Row>
		{/if}
	</Body>
</DataTable>
