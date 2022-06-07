<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { page, session, navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import { sitename, videos, users, videoEmitter } from '$lib/stores';
	import { VideoPlayer } from '$lib/components/Video';
	import { getMediaImage, getMediaVideo } from '$lib/utils';
	import { _, locale } from 'svelte-i18n';

	let paused;
	let poster = '';
	let src = '';
	let playhead;
	let timeoutId;
	let canPlay;

	$: video = $videos.find((v) => v.id === $page.params.slug);
	$: loggedInUser = $users.find((user) => user.id == $session.user?.id);
	$: currentUser = loggedInUser || currentUser;
	$: joinData = currentUser?.videos.find((v) => video?.id == v.id)?._joinData;
	$: token = currentUser?.token.token;
	$: isAdmin = currentUser?.group.name === 'Administrator';
	$: ((time) => {
		if (!paused || !canPlay) return;
		let pauseTime = time;
		clearTimeout(timeoutId);
		timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, pauseTime);
	})(playhead);
	$: video && getMediaImage(video.image_id, $session.user).then((v) => (poster = v));
	$: video && getMediaVideo(video.id, $session.user).then((v) => (src = v));
	$: $navigating && ((paused = true), (src = ''), savePlayhead());

	onMount(() => {});

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
		// in Chrome we have to limit streams due to Chromes limitation
		// this is done by emptying src attribute on the video which forgets the playheads position
		// to set the videos canPlay flag to false will re-adjust playhead to last saved position when video canPlay again
		paused = true;
		canPlay = false;
	}

	async function savePlayhead() {
		if (!canPlay) return;
		if (isAdmin) {
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
		await api.put(`users/${currentUser.id}?lang=${$locale}`, data, token).then((res) => {
			res.success && users.put(res.data);
		});
	}
</script>

<svelte:head>
	<title>{$sitename} | {video?.title || $_('text.no-title')}</title>
</svelte:head>

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
