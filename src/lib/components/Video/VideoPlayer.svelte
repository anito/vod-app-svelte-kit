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

	export { className as class };

	onMount((_) => {
		let timestamp = now;
		multiplayer &&
			players.add({
				video: videoElement,
				timestamp
			});
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
			if (player.video !== videoElement) {
				if (player.video.promise) {
					player.video.promise.then(() => {
						pauseVideo(player.video);
					});
				} else {
					pauseVideo(player.video);
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
		_players = _players.filter((player) => player.timestamp > now && player.video.paused);
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
