<script>
	// @ts-nocheck

	import { tick, createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Ui from './Ui.svelte';

	const dispatch = createEventDispatcher();
	const scrubStart = {};

	let duration;
	let showControlsTimeout;
	let className = '';
	let hydrated = false;
	let hydrating = false;
	let currentPoster;
	let buffered;
	let scrubbing;
	let target;
	let hideControlsOnPause = true;
	let customControls;
	let playPromise;
	let loadPromise;

	export let allowScrubbing = false;
	export let videoElement = null;
	export let src;
	export let video;
	export let autoplay;
	export let poster;
	export let type;
	export let muted = true;
	export let controls = false; // use native controls if true
	export let paused = false;
	export let preload = 'none';
	export let playhead = 0;
	export let curtain = false;
	export { className as class };

	$: customControls = !controls;
	$: showControls = paused;
	$: paused && !hideControlsOnPause && clearTimeout(showControlsTimeout);
	$: ((p) => {
		if (currentPoster !== p) {
			currentPoster = p;
			// reload video to bring up new poster
			reload();
		}
	})(poster);
	$: src && setSource(src);

	onMount(() => {});

	function setSource(src) {
		if (!videoElement) return;

		let oldSrc = videoElement.getAttribute('src');
		if (oldSrc !== src) {
			videoElement.setAttribute('src', src);
		}
	}

	function handleMouseenter(e) {
		e = e.detail;
		showControls = true;
	}

	function handleMouseleave(e) {
		e = e.detail;
		showMediaControls();
	}

	function showMediaControls() {
		if (!duration) return; // nothing loaded
		clearTimeout(showControlsTimeout);
		showControlsTimeout = setTimeout(() => (showControls = false), 4000);
		showControls = true;
	}

	function handleMousemove(e) {
		e = e.detail;
		showMediaControls();
		allowScrubbing && handleScrubbing(e);
	}

	function handleClearTimeout(e) {
		clearTimeout(showControlsTimeout);
	}

	function handleScrubbing(e) {
		if (!(e.buttons & 1)) return; // mouse not down
		if (!duration) return; // videoElement not loaded yet

		const { left, right } = videoElement && videoElement.getBoundingClientRect();
		if (left === undefined || right === undefined) return;

		let x = scrubStart.x;
		let ph = scrubStart.playhead;
		let width = right - left;
		let ratio = duration / width;
		let dist = left - x - (left - e.clientX);
		let delta = ph + dist * ratio;

		// playhead = (duration * (e.clientX - left)) / (right - left); // absolute
		playhead = delta >= duration ? duration : delta < 0 ? 0 : delta; // relative
		scrubbing = true;
	}

	function handlePlayPause(e) {
		// if we have switched off preload, load first
		if (preload === 'none' && !duration) {
			videoElement.load();
		}

		if (!videoElement.promise || paused) {
			playhead && (videoElement.currentTime = playhead);
			videoElement.promise = videoElement.play();
		} else {
			videoElement.promise
				.then((_) => videoElement.pause()) // playback started so we can safely pause
				.catch((_) => {
					console.log('Auto-play was prevented');
				});
		}
	}

	function handlePause(e) {
		dispatch('player:paused');
	}

	function handleRewind(e) {
		let step = e.detail || 15;
		let s;
		playhead -= (s = playhead - step) < 0 ? step + s : step;
		dispatch('player:rwd');
	}

	function handleForeward(e) {
		e.stopPropagation();
		let step = e.detail || 15;
		playhead += playhead + step > duration ? duration - playhead : step;
		dispatch('player:fwd');
		return false;
	}

	function handleWheel(e) {
		e = e.detail;
		playhead += e.deltaY * 0.2;
	}

	function handleMousedown(e) {
		e = e.detail;
		const isMediaControl = e.target.classList.contains('media-controls');

		scrubStart.x = e.clientX;
		scrubStart.y = e.clientY;
		scrubStart.playhead = playhead;

		target = e.currentTarget;

		// we can't rely on the built-in click event, because it fires
		// after a drag — we have to listen for clicks ourselves

		function handleMouseup() {
			!scrubbing && isMediaControl && handlePlayPause();
			cancel();
		}

		function handleMouseupAfterDrag() {
			scrubbing = false;
			cancelAfterDrag();
		}

		function cancel() {
			target.removeEventListener('mouseup', handleMouseup);
			target.addEventListener('mouseup', handleMouseupAfterDrag);
			target.addEventListener('mouseleave', handleMouseupAfterDrag);
		}

		function cancelAfterDrag() {
			target.removeEventListener('mouseup', handleMouseupAfterDrag);
			target.removeEventListener('mouseleave', handleMouseupAfterDrag);
		}

		target.addEventListener('mouseup', handleMouseup);

		setTimeout(cancel, 100); // prevent start/stop after scrubbing
	}

	function handleCanPlay(e) {
		dispatch('player:canplay', { ...video });
	}

	function handleLoadstart(e) {
		hydrating = true;
		hydrated = false;
		dispatch('player:loadstart', { ...video });
	}

	function handleLoadedData(e) {
		hydrating = false;
		hydrated = true;
		dispatch('player:loadeddata', { ...video });
	}

	function handleEmptied(e) {
		hydrated = false;
		dispatch('player:emptied', { ...video });
	}

	function handleAborted(e) {
		setSource(src);
		dispatch('player:aborted', { ...video });
	}

	function handlePictureInPicture(e) {
		if (document.pictureInPictureElement) document.exitPictureInPicture().catch((e) => {});
		else videoElement && videoElement.requestPictureInPicture().catch((e) => {});
	}

	function handleMute(e) {
		muted = !muted;
	}

	function handleFullscreen(e) {
		if (document.fullscreenElement) document.exitFullscreen().catch((e) => {});
		else if (videoElement && videoElement.requestFullscreen) videoElement.requestFullscreen();
		else if (videoElement && videoElement.webkitRequestFullScreen)
			videoElement.webkitRequestFullScreen();
	}

	async function reload() {
		if (!duration) return;
		videoElement.pause();
		await tick();
		setTimeout(() => videoElement.load(), 100);
	}
</script>

<div class="player {className}" class:hydrated>
	{#if curtain}
		<div class="curtain" class:paused>
			<div class="curtain-left bg-black opacity-90">
				<h2
					class="mdc-typography--headline6 curtain-title opacity-25"
					class:opacity-25={!video.title}
				>
					{video.title || $_('text.empty_title')}
				</h2>
				<h3
					class="mdc-typography--subtitle2 curtain-desc opacity-25"
					class:opacity-25={!video.description}
				>
					{video.description || $_('text.empty_description')}
				</h3>
			</div>
			<div class="curtain-right bg-black opacity-30" />
		</div>
	{/if}
	<video
		bind:this={videoElement}
		bind:currentTime={playhead}
		bind:duration
		bind:paused
		bind:buffered
		{poster}
		{preload}
		{controls}
		{muted}
		{type}
		{autoplay}
		on:loadstart={handleLoadstart}
		on:canplay={handleCanPlay}
		on:loadeddata={handleLoadedData}
		on:emptied={handleEmptied}
		on:abort={handleAborted}
		on:pause={handlePause}
		x-webkit-airplay="allow"
		data-src={src}
	>
		<source type="video/{type}" />
		<track kind="captions" />
		Your browser does not support the
		<code>video</code>
		element.
	</video>
	{#if customControls}
		<Ui
			on:wheel={handleWheel}
			on:mousedown={handleMousedown}
			on:mousemove={handleMousemove}
			on:mouseenter={handleMouseenter}
			on:mouseleave={handleMouseleave}
			on:clearTimeout={handleClearTimeout}
			on:fullscreen={handleFullscreen}
			on:play-pause={handlePlayPause}
			on:rwd={handleRewind}
			on:fwd={handleForeward}
			on:pip={handlePictureInPicture}
			on:mute={handleMute}
			bind:time={playhead}
			on:click={(e) => e.stopPropagation()}
			{muted}
			{duration}
			{showControls}
			{paused}
			{buffered}
			{scrubbing}
		/>
	{/if}
</div>

<style>
	.player {
		position: relative;
		user-select: none;
	}
	video {
		width: 100%;
		width: var(--player-w);
		object-position: center;
		object-fit: cover;
	}
	.hydrated video {
		object-fit: contain;
	}
	.curtain {
		pointer-events: none;
		width: 100%;
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}
	.curtain.paused [class^='curtain-'] {
		transform: translateX(0);
	}
	.curtain-left {
		position: absolute;
		top: 0;
		left: 0;
		width: 50%;
		height: 100%;
		z-index: 1;
		padding: 15px;
		overflow: hidden;
		transform: translateX(-100%);
		transform-origin: 0 center;
		transition-property: transform;
		transition-duration: 0.3s;
		transition-timing-function: ease-in-out;
		background-color: var(--curtain-bg-left);
		padding: var(--curtain-p);
	}
	.curtain-right {
		position: absolute;
		top: 0;
		right: 0;
		width: 50%;
		height: 100%;
		z-index: 1;
		padding: 15px;
		overflow: hidden;
		transform: translateX(100%);
		transform-origin: 0 center;
		transition-property: transform;
		transition-duration: 0.3s;
		transition-timing-function: ease-in-out;
		background-color: var(--curtain-bg-right);
		padding: var(--curtain-p);
	}
	.curtain .curtain-title {
		font-size: var(--curtain-fs-title);
		line-height: var(--curtain-lh-title, 1rem);
		color: var(--curtain-c-title, #444444);
	}
	.curtain .curtain-desc {
		font-size: var(--curtain-fs-descr);
		line-height: var(--curtain-lh-descr, 1rem);
		color: var(--curtain-c-descr, #444444);
	}
</style>
