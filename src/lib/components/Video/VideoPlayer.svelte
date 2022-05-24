<script context="module">
	import UAParser from 'ua-parser-js';

	const browserName = new UAParser().getBrowser().name;
	const MAXSTREAMS = 5;

	let players = new Set();
	let now = new Date().getTime();
</script>

<script>
	// @ts-nocheck

	import Video from './Video.svelte';
	import { onMount } from 'svelte';
	import { getExt } from '$lib/utils';

	export let poster = '';
	export let video;
	export let src;
	export let type = getExt(src);
	export let paused = true;
	export let playhead;
	export let controls;
	export let multiplayer = false;

	let videoElement;
	let className = '';
	let item;

	export { className as class };

	onMount(() => {
		let timestamp = now;
		item = {
			videoElement,
			video,
			timestamp
		};
		!players.has(item) && players.add(item);
	});

	$: multiplayer &&
		((playing) => {
			if (playing) {
				pausePlayers();
				limitStreamsOnChrome();
			}
		})(!paused);

	function pausePlayers() {
		players.forEach((player) => {
			if (player.videoElement !== videoElement) {
				if (player.videoElement.promise) {
					player.videoElement.promise.then(() => {
						pauseVideo(player.videoElement);
					});
				} else {
					pauseVideo(player.videoElement);
				}
			} else {
				player.timestamp = new Date().getTime();
			}
		});
	}

	function pauseVideo(v) {
		!v.paused && v.pause();
	}

	/**
	 * only one player active at a time
	 */
	function limitStreamsOnChrome() {
		if (browserName !== 'Chrome') return;
		var _player, _players;
		_players = Array.from(players);
		_players = _players.filter((player) => player.timestamp > now && player.videoElement.paused);
		_player = _players
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(MAXSTREAMS - 1)
			.shift();
		if (_player) {
			_player.video.src = '';
			_player.promise = null;
		}
	}
</script>

<Video
	class={className}
	bind:paused
	bind:videoElement
	bind:playhead
	on:player:paused
	on:player:canplay
	on:player:emptied
	on:player:aborted
	on:player:loadeddata
	on:player:loadstart
	on:player:fwd
	on:player:rwd
	muted
	curtain
	allowScrubbing
	{controls}
	{poster}
	{src}
	{video}
	{type}
/>

<style>
</style>
