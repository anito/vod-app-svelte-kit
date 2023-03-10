<script lang="ts">
  import { tick, createEventDispatcher } from 'svelte';
  import { Ui } from '.';
  import { mute } from '.';
  import { _ } from 'svelte-i18n';
  import type { Video } from '$lib/classes/repos/types';

  const dispatch = createEventDispatcher();
  const scrubStart = { x: 0, y: 0, playhead: 0 };

  let duration: number;
  let className = '';
  let loaded = false;
  let currentPoster: any;
  let buffered;
  let scrubbing: boolean;
  let srcAttr: string | null;

  export let src: string | undefined;
  export let videoElement: HTMLVideoElement;
  export let scrub = false;
  export let promise: Promise<void> = new Promise(() => {});
  export let video: Video;
  export let autoplay: boolean;
  export let poster: string | undefined;
  export let type: string | undefined;
  export let customUI = false;
  export let paused = false;
  export let preload = 'none';
  export let playhead = 0;
  export { className as class };

  $: ((p) => {
    if (currentPoster && currentPoster !== p) {
      reload();
      currentPoster = p;
    }
  })(poster);

  function setSourceAndLoad() {
    if (!videoElement.getAttribute('src') && srcAttr) {
      videoElement.setAttribute('src', srcAttr);
    }
    !promise && videoElement.load();
  }

  function mousemoveHandler(event: Event) {
    scrub && doScrub(event as MouseEvent);
  }

  function doScrub(event: MouseEvent) {
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

    playhead = delta >= duration ? duration : delta < 0 ? 0 : delta; // entry point equals current playhead - no playhead jump
    scrubbing = true;
  }

  async function playPauseHandler() {
    /**
     * For "preload" disabled, load first
     * (Duration will be available only after videos "loadstart" event)
     */ 
    if (!duration || !videoElement.getAttribute('src')) {
      setSourceAndLoad();
    }
    if (paused) {
      playhead && (videoElement.currentTime = playhead);
      promise = videoElement.play();
    } else {
      await promise;
      videoElement.pause();
    }
  }

  function pauseHandler() {
    dispatch('player:paused');
  }

  function rewindHandler({ detail }: CustomEvent) {
    let step = detail || 15;
    let s;
    playhead -= (s = playhead - step) < 0 ? step + s : step;
    dispatch('player:rwd');
  }

  function forewardHandler(event: CustomEvent) {
    let step = event.detail || 15;
    playhead += playhead + step > duration ? duration - playhead : step;
    dispatch('player:fwd');
  }

  function wheelHandler({ detail }: CustomEvent) {
    scrub && (playhead += detail.deltaY * 0.2);
  }

  function mousedownHandler({ detail }: CustomEvent) {
    const mouseevent = detail as unknown as MouseEvent;
    const target = mouseevent.target as Element;
    const isMediaControl = target.classList.contains('play-pause-controllable');

    scrubStart.x = detail.clientX;
    scrubStart.y = detail.clientY;
    scrubStart.playhead = playhead;

    // we can't rely on the built-in click event, because it fires
    // after a drag — we have to listen for clicks ourselves

    function mouseupHandler() {
      !scrubbing && isMediaControl && playPauseHandler();
      cancel();
    }

    function mouseupAfterDragHandler() {
      scrubbing = false;
      cancelAfterDrag();
    }

    function cancel() {
      target.removeEventListener('mouseup', mouseupHandler);
      target.addEventListener('mouseup', mouseupAfterDragHandler);
      target.addEventListener('mouseleave', mouseupAfterDragHandler);
    }

    function cancelAfterDrag() {
      target.removeEventListener('mousemove', mousemoveHandler);
      target.removeEventListener('mouseup', mouseupAfterDragHandler);
      target.removeEventListener('mouseleave', mouseupAfterDragHandler);
    }

    target.addEventListener('mouseup', mouseupHandler);
    target.addEventListener('mousemove', mousemoveHandler);

    setTimeout(cancel, 500); // prevent start/stop after scrubbing
  }

  function canPlayHandler() {
    dispatch('player:canplay', { ...video });
  }

  function loadstartHandler() {
    dispatch('player:loadstart', { ...video });
  }
  
  function loadedDataHandler() {
    loaded = true
    srcAttr = videoElement.getAttribute('src');
    dispatch('player:loadeddata', { ...video });
  }

  function emptiedHandler() {
    loaded = false
    dispatch('player:emptied', { ...video });
  }

  function abortedHandler() {
    dispatch('player:aborted', { ...video });
  }

  function pictureInPictureHandler() {
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch((e) => {});
    else videoElement && videoElement.requestPictureInPicture().catch((e) => {});
  }

  function handleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch((e) => {});
    else if (videoElement?.requestFullscreen) videoElement.requestFullscreen();
  }

  async function reload() {
    videoElement.pause();
    src = '';
    await tick();
    setTimeout(() => setSourceAndLoad(), 100);
  }
</script>

<div class="player {className}" class:loaded>
  <video
    class="flex-1"
    muted={$mute}
    bind:this={videoElement}
    bind:currentTime={playhead}
    bind:duration
    bind:paused
    bind:buffered
    on:loadstart={loadstartHandler}
    on:canplay={canPlayHandler}
    on:loadeddata={loadedDataHandler}
    on:emptied={emptiedHandler}
    on:abort={abortedHandler}
    on:pause={pauseHandler}
    controls={!customUI}
    {src}
    {poster}
    {preload}
    {autoplay}
  >
    <source type="video/{type}" />
    <track kind="captions" />
    Your browser does not support the
    <code>video</code>
    element.
  </video>
  {#if customUI}
    <Ui
      on:ui:wheel={wheelHandler}
      on:ui:touchstart={mousedownHandler}
      on:ui:mousedown={mousedownHandler}
      on:ui:pip={pictureInPictureHandler}
      on:fullscreen={handleFullscreen}
      on:play-pause={playPauseHandler}
      on:rwd={rewindHandler}
      on:fwd={forewardHandler}
      bind:time={playhead}
      {duration}
      {paused}
      {buffered}
      id={video.id}
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
  .loaded video {
    object-fit: contain;
  }
</style>
