<script>
  import { log } from '$lib/utils';
  import { tick, createEventDispatcher, onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import Ui from './Ui.svelte';

  const dispatch = createEventDispatcher();
  const scrubStart = { x: 0, y: 0, playhead: 0 };

  /**
   * @type {number}
   */
  let duration;
  /**
   * @type {ReturnType<typeof setTimeout>}
   */
  let controlsTimeout;
  let className = '';
  let hydrated = false;
  let hydrating = false;
  /**
   * @type {string | undefined}
   */
  let currentPoster;
  let buffered;
  /**
   * @type {boolean}
   */
  let scrubbing;
  /**
   * @type {Element}
   */
  let target;
  /**
   * @type {boolean}
   */
  let isMouseAction;
  /**
   * @type {boolean}
   */
  let customControls;
  /**
   * @type {string | null}
   */
  let _src;

  export let allowScrubbing = false;
  /**
   * @type {HTMLVideoElement}
   */
  export let videoElement;
  /**
   * @type {string | undefined}
   */
  export let src;
  /**
   * @type {import('$lib/types').Video}
   */
  export let video;
  /**
   * @type {boolean}
   */
  export let autoplay;
  /**
   * @type {string | undefined}
   */
  export let poster;
  /**
   * @type {string | undefined}
   */
  export let type;
  export let muted = true;
  export let controls = false; // use native controls if true
  export let paused = false;
  export let preload = 'none';
  export let playhead = 0;
  export { className as class };

  $: customControls = !controls;
  $: showControls = paused || isMouseAction;
  $: isMouseAction && clearTimeout(controlsTimeout);
  $: !isMouseAction && delayHideControls();
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
    isMouseAction = true;
  }

  function handleMouseleave() {
    isMouseAction = false;
  }

  function delayHideControls() {
    if (!duration) return; // nothing loaded
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => (showControls = false), 4000);
    showControls = true;
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function handleMousemove({ detail }) {
    delayHideControls();
    allowScrubbing && handleScrubbing(detail);
  }

  /**
   *
   * @param {MouseEvent} event
   */
  function handleScrubbing(event) {
    if (!(event.buttons & 1)) return; // mouse not down
    if (!duration) return; // videoElement not loaded yet

    const { left, right } = videoElement && videoElement.getBoundingClientRect();
    if (left === undefined || right === undefined) return;

    let x = scrubStart.x;
    let ph = scrubStart.playhead;
    let width = right - left;
    let ratio = duration / width;
    let dist = left - x - (left - event.clientX);
    let delta = ph + dist * ratio;

    // playhead = (duration * (e.clientX - left)) / (right - left); // entry point relative to videos bounding rect - causes playhed to jump in most cases
    playhead = delta >= duration ? duration : delta < 0 ? 0 : delta; // entry point equals current playhead - no playhead jump
    scrubbing = true;
  }

  function handlePlayPause() {
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

  function handlePause() {
    dispatch('player:paused');
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function handleRewind({ detail }) {
    let step = detail || 15;
    let s;
    playhead -= (s = playhead - step) < 0 ? step + s : step;
    dispatch('player:rwd');
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function handleForeward(event) {
    let step = event.detail || 15;
    playhead += playhead + step > duration ? duration - playhead : step;
    dispatch('player:fwd');
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function handleWheel({ detail }) {
    playhead += detail.deltaY * 0.2;
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function handleMousedown({ detail }) {
    isMouseAction = true;
    const isMediaControl = detail.target.classList.contains('play-pause-controllable');

    scrubStart.x = detail.clientX;
    scrubStart.y = detail.clientY;
    scrubStart.playhead = playhead;

    target = detail.currentTarget;

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

  function handleCanPlay() {
    dispatch('player:canplay', { ...video });
  }

  function handleLoadstart() {
    !_src && (_src = videoElement.getAttribute('src'));
    hydrating = true;
    hydrated = false;
    dispatch('player:loadstart', { ...video });
  }

  function handleLoadedData() {
    hydrating = false;
    hydrated = true;
    dispatch('player:loadeddata', { ...video });
  }

  function handleEmptied() {
    hydrated = false;
    dispatch('player:emptied', { ...video });
  }

  function handleAborted() {
    hydrated = false;
    dispatch('player:aborted', { ...video });
  }

  function handlePictureInPicture() {
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch((e) => {});
    else videoElement && videoElement.requestPictureInPicture().catch((e) => {});
  }

  function handleMute() {
    muted = !muted;
  }

  function handleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch((e) => {});
    else if (videoElement?.requestFullscreen) videoElement.requestFullscreen();
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
