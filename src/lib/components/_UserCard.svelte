<script>
	// @ts-nocheck

	import * as api from '$lib/api';

	import MediaImagePreview from './_MediaImagePreview.svelte';
	import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import Menu from '@smui/menu';
	import List, { Item, Separator, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';

	export let image = null;
	export let user;
	export { className as class };

	let className = '';
	let menuUser;

	async function deleteUser() {
		const id = user.id;
		const res = await api.del(`users/${id}`, { token: user?.jwt });

		if (res?.success) {
			// at this point associated videos are not updated yet
			// however we fetch a fresh set on load when changing to video page
			users.del(id);
		}
	}
</script>

<Card class="flex content-between {className}" style="width: var(--poster-w);">
	<PrimaryAction>
		<MediaImagePreview media={image} />
	</PrimaryAction>
	<div class="flex flex-col justify-end" style="flex:1 0 auto">
		<Actions>
			<ActionButtons>
				<Button color="primary" on:click={() => menuUser.setOpen(true)}>
					<Label>Löschen</Label>
					<Icon class="material-icons">delete</Icon>
				</Button>
			</ActionButtons>
			<ActionIcons style="position: relative;">
				<IconButton
					class="material-icons"
					on:click={() => {}}
					toggle
					aria-label="Mehr Optionen"
					title="Mehr Optionen">more_vert</IconButton
				>
				<Menu bind:this={menuUser}>
					<List>
						<Item class="text-red-700" on:SMUI:action={() => deleteUser()}>
							<Text>Klient löschen</Text>
						</Item>
					</List>
				</Menu>
			</ActionIcons>
		</Actions>
	</div>
</Card>

<style>
</style>
