<script>
	// @ts-nocheck

	import { getContext, onMount } from 'svelte';
	import { videos } from '../stores';
	import Component from './_Component.svelte';
	import Header from './_Header.svelte';
	import Modal from './_Modal.svelte';
	import VideoCard from './_VideoCard.svelte';
	import Button, { Group, Icon, Label } from '@smui/button';
	import { _ } from 'svelte-i18n';

	const toVoid = () => {};
	const key = 'editor-uploader-modal';
	const { close } = getContext('editor-modal');

	export let data = [];
	export let posterCreatedHandler = toVoid;
	export let posterSelectHandler = toVoid;
	export let posterRemoveHandler = toVoid;

	$: storeData = $videos.filter(
		(video) => video.id === data.find((item) => item.id === video.id)?.id
	);

	onMount(() => {});
</script>

<Modal {key}>
	<Component variant="sm">
		<div slot="header">
			<Header mdc h="5">
				{$_('text.editor')}
			</Header>
		</div>
		<div class="mt-2">
			{#each storeData as video}
				<VideoCard
					on:Video:posterCreated={posterCreatedHandler}
					on:Video:selectPoster={posterSelectHandler}
					on:Video:removePoster={posterRemoveHandler}
					{video}
					{key}
				/>
			{/each}
		</div>
		<Group variant="unelevated" class="flex justify-end mt-3">
			<Button
				class="focus:outline-none focus:shadow-outline"
				on:click={() => close()}
				variant="unelevated"
			>
				<Icon class="material-icons">close</Icon>
				<Label>{$_('text.close')}</Label>
			</Button>
		</Group>
	</Component>
</Modal>
