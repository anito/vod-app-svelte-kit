<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import { Group } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import { proxyEvent } from '$lib/utils';

	export let selection;
	export let type;
	export let sort;

	const dispatch = createEventDispatcher();
</script>

<div class="toolbar flex justify-between">
	<Group variant="outlined">
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:reload', { selection })}
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
			{sort === 'DESC' ? 'sort' : sort === 'ASC' ? 'sort' : 'sort'}
		</IconButton>
	</Group>
	<Group variant="outlined">
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:toggleRead', { selection })}
			variant="outlined"
			color="primary"
			disabled={!selection || type === 'sents'}
			>{type === 'sents'
				? 'mail'
				: type === 'inboxes'
				? selection && selection._read
					? 'mark_email_unread'
					: 'mark_email_read'
				: ''}
		</IconButton>
		<IconButton
			class="material-icons"
			on:click={() => dispatch('mail:delete', { selection })}
			variant="outlined"
			color="primary"
			disabled={!selection}
			>delete
		</IconButton>
	</Group>
</div>

<style></style>
