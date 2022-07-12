<script>
	// @ts-nocheck

	import './_button.scss';
	import './_menu-surface.scss';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { images, videoEmitter, currentVideo } from '$lib/stores';
	import { getMedia } from '$lib/utils/media';
	import { ADMIN, SUPERUSER } from '$lib/utils';
	import VideoMedia from './_VideoMedia.svelte';
	import MediaUploader from './_MediaUploader.svelte';
	import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import Menu from '@smui/menu';
	import MenuSurface, { Anchor } from '@smui/menu-surface';
	import ImageList, { Item as ImageListItem, ImageAspectContainer, Image } from '@smui/image-list';
	import List, { Item, Separator, Text } from '@smui/list';
	import { _, locale } from 'svelte-i18n';

	export let video;
	export { className as class };
	export let key = 'default-modal';

	const uploader = getContext(key);

	let className = '';
	let cardMenu;
	let deleteMenu;
	let dispatch = createEventDispatcher();
	let imageList;
	let imageListAnchor;
	let isEditMode = false;
	let title;
	let description;
	let dateOptions = {
		day: '2-digit',
		year: 'numeric',
		month: '2-digit'
	};
	let isImageListOpen = false;

	$: user = $session.user;
	$: hasPrivileges = user.role === ADMIN || user.role === SUPERUSER;
	$: leftButton = isEditMode
		? { label: $_('text.save'), icon: 'save' }
		: { label: $_('text.edit'), icon: 'edit' };
	$: rightButton = isEditMode
		? { label: $_('text.cancel'), icon: 'cancel' }
		: { label: $_('text.delete'), icon: 'delete' };
	$: matchingData = (video?.['_matchingData'] && video['_matchingData']['UsersVideos']) || null;
	$: canSave = description !== video.description || title !== video.title;
	$: image = $images.find((i) => video.image_id === i.id);

	function save() {
		video.title = title;
		video.description = description;
		videoEmitter.dispatch({
			method: 'put',
			data: video,
			show: true
		});
		isEditMode = false;
		return false;
	}

	function edit() {
		title = video.title || '';
		description = video.description || '';
		return true;
	}

	function setDeleteMenuOpen(bol) {
		deleteMenu.setOpen(bol);
		return false;
	}

	function del() {
		videoEmitter.dispatch({
			method: 'del',
			data: video,
			show: true
		});
	}

	function createPoster(type) {
		uploader.open(
			MediaUploader,
			{
				commonProps: { type },
				options: {
					uploadMultiple: false,
					parallelUploads: 1,
					maxFiles: 1,
					maxFilesize: 1024
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
	}

	function getCachedImage(id) {
		let res = getMedia('IMAGE', id, user, {
			width: 100,
			height: 100,
			square: 1
		});
		return res;
	}

	function uploadDoneHandler(e) {
		dispatch('Video:posterCreated', e.detail);
		uploader.close();
	}

	function imageListOpenedHandler(e) {
		isImageListOpen = true;
	}

	function imageListClosedHandler(e) {
		isImageListOpen = false;
	}

	function cardMenuOpenedHandler(e) {
		$currentVideo !== video && currentVideo.set(video);
	}
</script>

<Card class="card {className}">
	<PrimaryAction>
		<VideoMedia {video} bind:title bind:description {isEditMode} curtain />
		<Content class="mdc-typography--body2">
			<div class="wrapper flex flex-row justify-between">
				{#if hasPrivileges}
					<div class="flex flex-col" style="flex-basis: 50%; max-width: 50%">
						<div class="text-xs text-inherit">
							<Icon class="material-icons">cloud_upload</Icon>
							<span class="ellipsed pl-2"
								>{$_('text.uploaded-on', {
									values: {
										date: new Date(video.created).toLocaleDateString($locale, dateOptions)
									}
								})}</span
							>
						</div>
						<div class="opacity-25">
							<div class="flex text-xs text-inherit">
								<Icon class="material-icons">image</Icon>
								<span class="pl-2 pr-2">Poster:</span>
								<span class="ellipsed max-w-1/2"
									>{(image && image.src) || $_('text.no-poster')}</span
								>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col" style="flex-basis: 50%; max-width: 50%">
						<div class="text-xs text-inherit inline-flex">
							<Icon class="material-icons">movie</Icon>
							<span class="ellipsed pl-2">{video.title || $_('text.no-title')}</span>
						</div>
						<div class="flex text-xs text-inherit">
							<Icon class="material-icons">timer</Icon>
							<span class="ellipsed pl-2"
								>{@html $_('text.until-date', {
									values: {
										date:
											matchingData &&
											new Date(matchingData.end).toLocaleDateString($locale, dateOptions)
									}
								})}</span
							>
						</div>
					</div>
				{/if}
				<div class="flex justify-end" style="flex-basis: 50%; max-width: 50%">
					<IconButton
						on:click={() => goto(`/videos/${video.id}`)}
						variant="outlined"
						class="button-shaped-round unelevated"
					>
						<i class="material-icons">smart_display</i>
					</IconButton>
				</div>
			</div>
		</Content>
	</PrimaryAction>
	{#if hasPrivileges}
		<Actions class="card-actions">
			<ActionButtons class="action-buttons">
				<Button
					color="primary"
					class="action-button"
					disabled={isEditMode && !canSave}
					on:click={() => (isEditMode = !isEditMode && edit()) || save()}
				>
					<Label>{leftButton.label}</Label>
					<Icon class="material-icons">{leftButton.icon}</Icon>
				</Button>
				<Button
					color="primary"
					class="action-button"
					on:click={() => (isEditMode = !isEditMode && setDeleteMenuOpen(true))}
				>
					<Label>{rightButton.label}</Label>
					<Icon class="material-icons">{rightButton.icon}</Icon>
				</Button>
				<ActionIcons style="position: relative;">
					<IconButton
						class="material-icons"
						on:click={() => cardMenu.setOpen(true)}
						toggle
						aria-label={$_('text.more-options')}
						title={$_('text.more-options')}>more_vert</IconButton
					>
					<Menu bind:this={cardMenu} on:MDCMenuSurface:opened={cardMenuOpenedHandler}>
						<List class="menu-list">
							<Item on:click={() => createPoster('image')}>
								<Text>{$_('text.new-poster')}</Text>
							</Item>
							<Item disabled={!$images.length} on:click={() => imageList.setOpen(true)}>
								<Text>{$_('text.select-poster')}</Text>
							</Item>
							<Separator />
							<Item
								disabled={!video.image_id}
								on:SMUI:action={() => dispatch('Video:removePoster', video.image_id)}
							>
								<Text>{$_('text.remove-poster')}</Text>
							</Item>
							<Item class="text-red-700" on:SMUI:action={() => del()}>
								<Text>{$_('text.delete-video')}</Text>
							</Item>
						</List>
					</Menu>
					<Menu bind:this={deleteMenu}>
						<List>
							<Item class="text-red-700" on:SMUI:action={() => del()}>
								<Text>{$_('text.delete-video')}</Text>
							</Item>
						</List>
					</Menu>
				</ActionIcons>
			</ActionButtons>
			<div use:Anchor bind:this={imageListAnchor} style="top: -320px; right: 250px;">
				<MenuSurface
					bind:this={imageList}
					bind:anchorElement={imageListAnchor}
					anchor={false}
					anchorCorner="TOP_RIGHT"
					on:MDCMenuSurface:opened={imageListOpenedHandler}
					on:MDCMenuSurface:closed={imageListClosedHandler}
				>
					<ImageList class="menu-surface-image-list">
						{#if isImageListOpen}
							{#each $images as image, i (image.id)}
								{#await getCachedImage(image.id)}
									<div />
								{:then src}
									<ImageListItem>
										<ImageAspectContainer>
											<Image
												class="preview-image"
												on:click={() => dispatch('Video:selectedPoster', image.id)}
												{src}
											/>
										</ImageAspectContainer>
									</ImageListItem>
								{/await}
							{/each}
						{/if}
					</ImageList>
				</MenuSurface>
			</div>
		</Actions>
	{/if}
</Card>

<style>
	:global(.preview-image) {
		cursor: pointer;
	}
	.ellipsed {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
