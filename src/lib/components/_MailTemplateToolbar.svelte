<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Group } from '@smui/button';
	import IconButton from '@smui/icon-button';

	export let canSave: boolean;

	const dispatch = createEventDispatcher();
</script>

<div class="toolbar flex justify-end">
	<Group variant="outlined">
		<IconButton
			class="material-icons"
			on:click={() => dispatch('template:save')}
			color="primary"
			disabled={!canSave}
		>
			save
		</IconButton>
		<IconButton
			class="material-icons"
			on:click={() => dispatch('template:reset')}
			color="primary"
			disabled={!canSave}
		>
			settings_backup_restore
		</IconButton>
	</Group>
</div>

<style></style>
