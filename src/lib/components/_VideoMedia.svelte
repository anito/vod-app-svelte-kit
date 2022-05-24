<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { onMount } from 'svelte';
	import { Media, MediaContent } from '@smui/card';
	import Textfield, { Textarea } from '@smui/textfield';
	import { VideoPlayer } from '$lib/components/Video';
	import { getMediaImage, getMediaVideo } from '$lib/utils';
	import { users, videoEmitter } from '$lib/stores';
	import { _, locale } from 'svelte-i18n';

	export let video;
	export let title = '';
	export let description = '';
	export let isEditMode = false;

	let paused = true;
	let poster = '';
	let src = '';
	let joinData;
	let vid;
	let playhead;
	let canPlay = false;
	let timeoutId;

	$: currentUser = $users.find((user) => user.id == $session.user?.id);
	$: isAdmin = $session.role === 'Administrator';
	$: token = currentUser?.token.token;
	$: joinData =
		currentUser && (vid = currentUser.videos.find((v) => v.id == video.id)) && vid._joinData;
	$: ((id) => getMediaImage(id, $session.user).then((v) => (poster = v)))(video.image_id);
	$: ((id) => getMediaVideo(id, $session.user).then((v) => (src = v)))(video.id);
	$: ((time) => {
		if (!paused || !canPlay) return;
		let savedTime = time;
		clearTimeout(timeoutId);
		timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, savedTime);
	})(playhead);

	onMount(() => {
		return () => !paused && savePlayhead();
	});

	// set playhead to the last saved position when the video is ready to play
	function handleCanPlay(e) {
		if (canPlay) return;
		canPlay = true;
		playhead = isAdmin ? video.playhead : joinData.playhead;
	}

	function handleEmptied(e) {
		// console.log("Video emptied", e.detail.title);
	}

	function handleLoadStart(e) {
		// console.log("Video load start", e.detail.title);
	}

	function handleLoadedData(e) {
		// console.log("Video loaded data", e.detail.title);
	}

	function handleAborted(e) {
		// in Chrome we have to limit streams do to Chromes limitation
		// this is done by emptying src attribute on the video which forgets the playheads position
		// setting canPlay to false will reset the playhead when video can play again
		canPlay = false;
	}

	async function savePlayhead() {
		if (isAdmin) {
			videoEmitter.dispatch({
				method: 'put',
				data: { ...video, playhead }
			});
		} else {
			let joinData,
				data,
				id = video.id,
				vid,
				associated = currentUser.videos.filter((v) => v.id != video.id).map((v) => ({ id: v.id }));
			vid = currentUser.videos.find((v) => v.id == video.id);
			if (vid) {
				joinData = vid._joinData;
				data = {
					videos: [
						{
							id,
							_joinData: { ...joinData, playhead }
						},
						...associated
					]
				};
				saveUser(data);
			}
		}
	}

	async function saveUser(data) {
		await api.put(`users/${currentUser.id}?lang=${$locale}`, data, token);
	}
</script>

<Media aspectRatio="16x9">
	<MediaContent class="flex" style="display: flex; z-index: 0;">
		{#if isAdmin}
			<div class="editor-wrapper" class:is-edit-mode={isEditMode}>
				<div class="editor">
					<Textfield
						class="mb-4"
						variant="outlined"
						dense
						bind:value={title}
						label="Title"
						input$aria-controls="helper-text-title"
						input$aria-describedby="helper-text-title"
					/>
					<Textfield
						textarea
						variant="outlined"
						bind:value={description}
						label="Description"
						input$aria-controls="helper-text-description"
						input$aria-describedby="helper-text-description"
					/>
				</div>
			</div>
		{/if}
		<div class="media-player player-container flex flex-1 bg-black">
			<VideoPlayer
				class="video-player flex"
				bind:paused
				bind:playhead
				on:player:canplay={handleCanPlay}
				on:player:emptied={handleEmptied}
				on:player:loadeddata={handleLoadedData}
				on:player:loadstart={handleLoadStart}
				on:player:aborted={handleAborted}
				curtain
				multiplayer
				{poster}
				{src}
				{video}
			/>
		</div>
	</MediaContent>
</Media>

<style>
	.editor-wrapper {
		display: none;
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 3;
		background: rgba(255, 255, 255, 0.9);
	}
	.editor {
		display: flex;
		flex-direction: column;
		margin: 5px;
	}
	.editor-wrapper.is-edit-mode {
		display: inline-block;
	}
	.player-container {
		position: relative;
	}
	.media-player {
		--player-w: 19rem;
		--curtain-fs-title: 1.3rem;
		--curtain-fs-descr: 0.7rem;
		--curtain-lh-title: 1.3rem;
		--curtain-lh-descr: 0.7rem;
		--curtain-p: 1rem;
		--curtain-c-title: #555555;
		--curtain-c-descr: #888888;
		--curtain-bg-left: #000000f0;
		--curtain-bg-right: #00000030;
	}
</style>
