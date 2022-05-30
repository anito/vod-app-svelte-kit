<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { page, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { videos, users, videoEmitter } from '$lib/stores';
	import { VideoPlayer } from '$lib/components/Video';
	import { getMediaImage, getMediaVideo } from '$lib/utils';
	import { _, locale } from 'svelte-i18n';

	let paused;
	let poster = '';
	let src = '';
	let joinData;
	let playhead;
	let canPlay = false;
	let timeoutId;
	let currentUser;

	$: video = $videos.find((v) => v.id === $page.params.slug);
	$: loggedInUser = $users.find((user) => user.id == $session.user?.id);
	$: loggedInUser && setCurrentUser(loggedInUser);
	$: token = currentUser?.token.token;
	$: isAdmin = $session.role === 'Administrator';
	$: ((vid) => {
		if (!vid) return;
		/**
		 * get users joinData
		 * this is used for handle assotiated data, like the users playhed, avatar...
		 */
		joinData =
			currentUser && (vid = currentUser.videos.find((v) => video.id == v.id)) && vid._joinData;

		// get encryptet poster url
		getMediaImage(video.image_id, $session.user).then((v) => (poster = v));
		// get encrypted video url
		getMediaVideo(video.id, $session.user).then((v) => (src = v));
	})(video);
	$: ((time) => {
		if (!paused || !canPlay) return;
		let savedTime = time;
		clearTimeout(timeoutId);
		timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, savedTime);
	})(playhead);

	onMount(() => {
		return () => !paused && savePlayhead();
	});

	function setCurrentUser(user) {
		currentUser = user;
	}

	// set playhead to the last saved position when the video is ready to play
	function handleCanPlay(e) {
		if (canPlay) return;
		canPlay = true;
		playhead = isAdmin ? video.playhead : joinData.playhead;
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
		// in Chrome we have to limit streams do to Chromes limitation
		// this is done by emptying src attribute on the video which forgets the playheads position
		// setting canPlay to false will readjust playhead to last saved position when video CanPlay again
		paused = true;
		canPlay = false;
	}

	async function savePlayhead() {
		if (isAdmin) {
			videoEmitter.dispatch({
				method: 'put',
				data: { ...video, playhead }
			});
		} else if (video) {
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

{#if video}
	<div class="single-player flex bg-black">
		<VideoPlayer
			class="video-player flex single-player"
			bind:paused
			bind:playhead
			on:player:canplay={handleCanPlay}
			on:player:emptied={handleEmptied}
			on:player:loadeddata={handleLoadedData}
			on:player:loadstart={handleLoadStart}
			on:player:aborted={handleAborted}
			{video}
			{poster}
			{src}
			curtain
		/>
	</div>
{:else}
	<div class="empty-selection">
		<span style="text-align: center;">{$_('text.empty-video-selection')}</span>
	</div>
{/if}

<style>
	.empty-selection {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 2em;
		font-weight: 600;
		color: #d8d8d8;
	}
	.single-player {
		--player-w: 100vw;
		--curtain-lh-title: 4rem;
		--curtain-lh-descr: 2rem;
		--curtain-fs-title: 4rem;
		--curtain-fs-descr: 2rem;
		--curtain-p: 3rem;
		--curtain-c-title: #555555;
		--curtain-c-descr: #888888;
		--curtain-bg-left: #000000d0;
		--curtain-bg-right: #00000030;
	}
</style>
