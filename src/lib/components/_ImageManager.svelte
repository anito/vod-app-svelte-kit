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

	const { open } = getContext('simple-modal');
	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const { setFab } = getContext('fab');

	let snackbar;
	let openUploader = () => {
		open(
			MediaUploader,
			{
				type: 'image',
				options: {
					uploadMultiple: true,
					parallelUploads: 12,
					maxFiles: 12
				},
				events: { uploadDone }
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

	$: user = $session.user;

	onMount(() => {
		snackbar = getSnackbar();
		setFab('upload-image');
	});

	function uploadDone(e) {
		let detail = e.detail;
		if (detail.success) {
			images.add(detail.data);
		}
		if (detail.message) {
			configSnackbar(e.detail.message);
			snackbar.open();
		}
	}

	async function deletePoster(e) {
		let detail = e.detail;
		let image = detail.image;
		const id = image.id;
		api.del(`images/${image.id}?lang=${$locale}`, user?.token).then((res) => {
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
			<div class="flex flex-wrap flex-row justify-center lg:justify-start">
				{#each $images as image (image.id)}
					<div class="flex m-1">
						<ImageCard on:Image:delete={deletePoster} {image} />
					</div>
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
		{#if $fabs === 'upload-image'}
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
