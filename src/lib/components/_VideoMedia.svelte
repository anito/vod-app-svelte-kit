<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { Media, MediaContent } from '@smui/card';
	import Textfield, { Textarea } from '@smui/textfield';
	import { VideoPlayer } from '$lib/components/Video';
	import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo } from '$lib/utils';
	import { users, videoEmitter } from '$lib/stores';
	import { _ } from 'svelte-i18n';

	export let video;
	export let title = '';
	export let description = '';
	export let isEditMode = false;

	let paused = true;
	let poster = '';
	let src = '';
	let playhead;
	let canPlay = false;
	let timeoutId;

	$: currentUser = $users.find((user) => user.id == $session.user?.id);
	$: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
	$: token = currentUser?.jwt;
	$: joinData = currentUser && currentUser.videos.find((v) => v.id == video.id)?._joinData;
	$: video.image_id && getMediaImage(video.image_id, $session.user).then((v) => (poster = v));
	$: video.id && getMediaVideo(video.id, $session.user).then((v) => (src = v));
	$: ((time) => {
		if (!paused || !canPlay) return;
		let pauseTime = time;
		clearTimeout(timeoutId);
		timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, pauseTime);
	})(playhead);

	onMount(() => {});

	onDestroy(() => {
		paused = true;
		src = '';
		savePlayhead();
	});

	// set playhead to the last saved position when the video is ready to play
	function handleCanPlay(e) {
		if (canPlay) return;
		canPlay = true;
		playhead = hasPrivileges ? video.playhead : joinData.playhead;
	}

	function handleEmptied(e) {
		console.log(
			'%c EMPTIED   %c %s',
			'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
			'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
			e.detail.title
		);
	}

	function handleLoadStart(e) {
		console.log(
			'%c LOADSTART %c %s',
			'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
			'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
			e.detail.title
		);
	}

	function handleLoadedData(e) {
		console.log(
			'%c LOADEDDATA%c %s',
			'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
			'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
			e.detail.title
		);
	}

	function handleAborted(e) {
		console.log(
			'%c ABORTED   %c %s',
			'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
			'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
			e.detail.title
		);
		// in Chrome we have to limit streams due to Chromes limitation
		// this is done by emptying src attribute on the video which forgets the playheads position
		// to set the videos canPlay flag to false will re-adjust playhead to last saved position when video canPlay again
		paused = true;
		canPlay = false;
	}

	async function savePlayhead() {
		if (!canPlay) return;
		if (hasPrivileges) {
			if (Math.round(video.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
			videoEmitter.dispatch({
				method: 'put',
				data: { ...video, playhead }
			});
		} else if (video) {
			if (Math.round(joinData.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
			let associated = currentUser.videos
				.filter((v) => v.id != video.id)
				.map((v) => ({ id: v.id }));
			let data = {
				videos: [
					{
						id: video.id,
						_joinData: { ...joinData, playhead }
					},
					...associated
				]
			};

			saveUser(data);
		}
	}

	async function saveUser(data) {
		await api.put(`users/${currentUser.id}`, { data, token }).then((res) => {
			res.success && users.put(res.data);
		});
	}
</script>

<Media aspectRatio="16x9">
	<MediaContent class="flex z-10">
		{#if hasPrivileges}
			<div class="editor-wrapper" class:is-edit-mode={isEditMode}>
				<div class="editor p-2">
					<Textfield
						class="mb-3"
						variant="outlined"
						dense
						bind:value={title}
						label="Title"
						input$aria-controls="helper-text-title"
						input$aria-describedby="helper-text-title"
					/>
					<Textfield
						class="flex-1"
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
		<div class="media-player player-container flex flex-1 justify-center bg-black">
			<VideoPlayer
				class="video-player flex flex-1"
				bind:paused
				bind:playhead
				on:player:canplay={handleCanPlay}
				on:player:emptied={handleEmptied}
				on:player:loadeddata={handleLoadedData}
				on:player:loadstart={handleLoadStart}
				on:player:aborted={handleAborted}
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
		height: 100%;
	}
	.editor-wrapper.is-edit-mode {
		display: inline-block;
	}
	.player-container {
		position: relative;
	}
	.media-player {
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
