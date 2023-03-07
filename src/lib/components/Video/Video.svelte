<script lang="ts">
  import type { Video } from '$lib/classes/repos/types';
  import { tick, createEventDispatcher } from 'svelte';
  import { Ui, mute } from '.';
  import { _ } from 'svelte-i18n';

  const dispatch = createEventDispatcher();
  const scrubStart = { x: 0, y: 0, playhead: 0 };

  let duration: number;
  let controlsTimeout: number | undefined;
  let className = '';
  let hydrated = false;
  let hydrating = false;
  let currentPoster: any;
  let buffered;
  let scrubbing: boolean;
  let target: Element;
  let isMouseAction: boolean;
  let customControls: boolean;
  let _src: string | null;

  export let allowScrubbing = false;
  export let videoElement: HTMLVideoElement;
  export let src: string | undefined;
  export let video: Video;
  export let autoplay: boolean;
  export let poster: string | undefined;
  export let type: string | undefined;
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

  function handleMousemove({ detail }: CustomEvent) {
    delayHideControls();
    allowScrubbing && handleScrubbing(detail);
  }

  function handleScrubbing(event: MouseEvent) {
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
        .catch((reason: any) => {
          console.error('[VIDEO PLAYER]', reason);
        });
    }
  }

  function handlePause() {
    dispatch('player:paused');
  }

  function handleRewind({ detail }: CustomEvent) {
    let step = detail || 15;
    let s;
    playhead -= (s = playhead - step) < 0 ? step + s : step;
    dispatch('player:rwd');
  }

  function handleForeward(event: CustomEvent) {
    let step = event.detail || 15;
    playhead += playhead + step > duration ? duration - playhead : step;
    dispatch('player:fwd');
  }

  function handleWheel({ detail }: CustomEvent) {
    playhead += detail.deltaY * 0.2;
  }

  function handleMousedown(event: CustomEvent) {
    const detail = event.detail as unknown as MouseEvent;
    const target = event.detail.target as Element;
    const isMediaControl = target.classList.contains('play-pause-controllable');
    isMouseAction = true;

    scrubStart.x = detail.clientX;
    scrubStart.y = detail.clientY;
    scrubStart.playhead = playhead;

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
    muted={$mute}
    bind:this={videoElement}
    bind:currentTime={playhead}
    bind:duration
    bind:paused
    bind:buffered
    {poster}
    {preload}
    {controls}
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
      on:ui:touchstart={handleMousedown}
      on:ui:mousedown={handleMousedown}
      on:ui:pip={handlePictureInPicture}
      on:mouseenter={handleMouseenter}
      on:mouseleave={handleMouseleave}
      on:fullscreen={handleFullscreen}
      on:play-pause={handlePlayPause}
      on:rwd={handleRewind}
      on:fwd={handleForeward}
      bind:time={playhead}
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
