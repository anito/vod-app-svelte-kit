<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import { Group } from '@smui/button';
	import IconButton from '@smui/icon-button';

	export let selected = false;
	export let type;

	const dispatch = createEventDispatcher();
</script>

<div class="toolbar flex justify-between">
	<Group variant="outlined">
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:reload', { selected })}
			variant="outlined"
			color="primary"
		>
			sync
		</IconButton>
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:sort')}
			variant="outlined"
			color="primary"
			disabled={!type}
		>
			sort
		</IconButton>
	</Group>
	<Group variant="outlined">
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:toggleRead', { selected })}
			variant="outlined"
			color="primary"
			disabled={!selected || type === 'sents'}
			>{type === 'sents'
				? 'mail'
				: type === 'inboxes'
				? selected && selected.read
					? 'mark_email_unread'
					: 'mark_email_read'
				: ''}
		</IconButton>
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:delete', { selected })}
			variant="outlined"
			color="primary"
			disabled={!selected}
			>delete
		</IconButton>
	</Group>
</div>

<style></style>
