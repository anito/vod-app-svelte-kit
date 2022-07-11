<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import { fly } from 'svelte/transition';
	import Fab, { Icon } from '@smui/fab';
	import { Label } from '@smui/common';
	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import ImageCard from './_ImageCard.svelte';
	import MediaUploader from './_MediaUploader.svelte';
	import Info from './_Info.svelte';
	import { _, locale } from 'svelte-i18n';
	import { fabs, urls, sitename, images } from '$lib/stores';

	const { open } = getContext('default-modal');
	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const { setFab } = getContext('fab');

	let snackbar;
	let openUploader = () => {
		open(
			MediaUploader,
			{
				commonProps: { type: 'image' },
				options: {
					uploadMultiple: true,
					parallelUploads: 12,
					maxFiles: 12
				},
				events: { 'upload:done': uploadDoneHandler }
			},
			{
				transitionWindow: fly,
				transitionWindowProps: {
					y: -200,
					duration: 500
				}
			}
		);
	};

	onMount(() => {
		snackbar = getSnackbar();
		setFab('add-image');
	});

	function uploadDoneHandler(e) {
		const { data, message, success } = { ...e.detail };
		if (success) {
			images.add(data);
		}
		if (message) {
			configSnackbar(message);
			snackbar.open();
		}
	}

	async function deletePoster(e) {
		const { image } = { ...e.detail };
		const id = image.id;
		await api.del(`images/${image.id}`, { token: $session.user?.jwt }).then((res) => {
			let message = res.message || res.data.message || res.statusText;
			if (res.success) {
				urls.del(id);
				images.del(id);
			}
			configSnackbar(message);
			snackbar.open();
		});
	}
</script>

<svelte:head>
	<title>{$sitename} | Video Posters</title>
</svelte:head>

<div class="lg:p-8">
	{#if $session.user}
		{#if $images.length}
			<div class="grid grid-cols-3 grid-flow-row gap-4">
				{#each $images as image (image.id)}
					<ImageCard on:Image:delete={deletePoster} {image} />
				{/each}
			</div>
		{:else}
			<div class="paper-container flex justify-center">
				<Paper color="primary">
					<Title style="color: var(--text-light)">No Images available</Title>
					<Content>
						<a href="/images" on:click|preventDefault={() => openUploader()}>Upload</a>
						some images to your content
					</Content>
				</Paper>
			</div>
		{/if}
		{#if $fabs === 'add-image'}
			<Fab class="floating-fab" color="primary" on:click={() => openUploader()} extended>
				<Label>{$_('text.new-poster')}</Label>
				<Icon class="material-icons">add</Icon>
			</Fab>
		{/if}
	{:else}
		<div class="paper-container flex justify-center m-8">
			<Info title="Unauthorized" let:href>
				<a {href} on:click|preventDefault={() => goto(href)}>Login</a>
			</Info>
		</div>
	{/if}
</div>

<style>
</style>
