<script>
  // @ts-nocheck

  import { log } from '$lib/utils';
  import { tick, createEventDispatcher, onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import Ui from './Ui.svelte';

  const dispatch = createEventDispatcher();
  const scrubStart = {};

  let duration;
  let controlsTimeout;
  let className = '';
  let hydrated = false;
  let hydrating = false;
  let currentPoster;
  let buffered;
  let scrubbing;
  let target;
  let mouseAction;
  let customControls;
  let _src;

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
  export { className as class };

  $: customControls = !controls;
  $: showControls = paused || mouseAction;
  $: mouseAction && clearTimeout(controlsTimeout);
  $: !mouseAction && delayHideControls();
  $: paused && delayHideControls();
  $: ((p) => {
    if (currentPoster !== p) {
      currentPoster = p;
      // reload video to bring up new poster
      reload();
    }
  })(poster);

  onMount(() => {});

  function setSourceAndLoad() {
    const curSrc = videoElement.getAttribute('src');
    if (!curSrc && _src) {
      videoElement.setAttribute('src', _src);
    }
    videoElement.load();
  }

  function handleMouseenter() {
    mouseAction = true;
  }

  function handleMouseleave() {
    mouseAction = false;
  }

  function delayHideControls() {
    if (!duration) return; // nothing loaded
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => (showControls = false), 4000);
    showControls = true;
  }

  function handleMousemove(e) {
    e = e.detail;
    delayHideControls();
    allowScrubbing && handleScrubbing(e);
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

    // playhead = (duration * (e.clientX - left)) / (right - left); // entry point relative to videos bounding rect - causes playhed to jump in most cases
    playhead = delta >= duration ? duration : delta < 0 ? 0 : delta; // entry point equals current playhead - no playhead jump
    scrubbing = true;
  }

  function handlePlayPause(e) {
    // if we have switched off preload, load first
    if (!duration || !videoElement.getAttribute('src')) {
      setSourceAndLoad();
    }
    if (paused) {
      playhead && (videoElement.currentTime = playhead);
      videoElement.promise = videoElement.play();
    } else {
      videoElement.promise
        .then(() => {
          // playback started so we can safely pause
          videoElement.pause();
        })
        .catch(() => {
          log('Auto-play was prevented');
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
    let step = e.detail || 15;
    playhead += playhead + step > duration ? duration - playhead : step;
    dispatch('player:fwd');
  }

  function handleWheel(e) {
    e = e.detail;
    playhead += e.deltaY * 0.2;
  }

  function handleMousedown(e) {
    e = e.detail;
    mouseAction = true;
    const isMediaControl = e.target.classList.contains('play-pause-controllable');

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
    !_src && (_src = videoElement.getAttribute('src'));
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
    hydrated = false;
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
    src = '';
    await tick();
    setTimeout(() => setSourceAndLoad(), 100);
  }
</script>

<div class="player {className}" class:hydrated>
  <video
    class="flex-1"
    bind:this={videoElement}
    bind:currentTime={playhead}
    bind:duration
    bind:paused
    bind:buffered
    bind:muted
    {poster}
    {preload}
    {controls}
    {type}
    {autoplay}
    {src}
    on:loadstart={handleLoadstart}
    on:canplay={handleCanPlay}
    on:loadeddata={handleLoadedData}
    on:emptied={handleEmptied}
    on:abort={handleAborted}
    on:pause={handlePause}
    x-webkit-airplay="allow"
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
      on:touchstart={handleMousedown}
      on:mousedown={handleMousedown}
      on:mousemove={handleMousemove}
      on:mouseenter={handleMouseenter}
      on:mouseleave={handleMouseleave}
      on:fullscreen={handleFullscreen}
      on:play-pause={handlePlayPause}
      on:rwd={handleRewind}
      on:fwd={handleForeward}
      on:pip={handlePictureInPicture}
      on:mute={handleMute}
      bind:time={playhead}
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
    object-position: center;
    object-fit: cover;
  }
  .hydrated video {
    object-fit: contain;
  }
</style>
