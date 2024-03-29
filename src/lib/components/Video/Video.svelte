<script lang="ts">
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { createEventDispatcher, onMount } from 'svelte';
  import { Ui } from '.';
  import { mute } from '.';
  import { _ } from 'svelte-i18n';
  import type { Video } from '$lib/classes/repos/types';
  import type { Player } from './utils';
  import type { SvelteMediaTimeRange } from 'svelte/elements';

  export let src: string | null;
  export let type: string | undefined;
  export let poster: string | undefined;
  export let videoElement: HTMLVideoElement;
  export let scrub = false;
  export let wheel = false;
  export let player: Player;
  export let video: Video;
  export let autoplay: boolean;
  export let customUI = false;
  export let controls = false;
  export let paused = true;
  export let preload = 'none';
  export let playhead = 0;
  export let duration: number;
  export { className as class };

  const dispatch = createEventDispatcher();
  const scrubStart = { x: 0, y: 0, playhead: 0 };

  let className = '';
  let keyListenerDiv: HTMLDivElement;
  let loadeddata = false;
  let waiting = false;
  let buffered: TimeRanges;
  let buffer: SvelteMediaTimeRange[];
  let scrubbing: boolean;
  let timeoutId: ReturnType<typeof setTimeout>;
  let ui: HTMLDivElement;

  $: watchForWait(playhead);
  $: paused && savePlayhead(playhead);
  $: poster = poster || emptyPoster;
  $: buffer && (buffered = videoElement?.buffered);

  onMount(() => {
    keyListenerDiv.focus();
    window.addEventListener('video:poster:changed', videoPosterChangedHandler);
  });

  function savePlayhead(time: number) {
    // Unload and rewind playhead to start if video has ended
    const ended = time === duration;
    playhead = ended ? 0 : time;
    dispatch('player:saveplayhead', {
      id: video.id,
      playhead,
      callback: ended && {
        onsuccess: () => dispatch('player:unload', videoElement),
      },
    });
  }

  /**
   * The build in 'waiting' event doesn't seem reliable enough
   * (for use with a waiting spinner)
   */
  function watchForWait(time: number) {
    waiting = false;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(
      (previously: number) => {
        waiting = paused ? false : previously === time;
      },
      1000,
      time
    );
  }

  async function playPauseHandler() {
    if (!player) return;
    prepare();
    if (paused) {
      player.promise = videoElement.play();
      player.promise
        .then(() => {
          keyListenerDiv.focus();
          console.log('[MEDIA] Now playing', video.title || video.src);
        })
        .catch((reason) => console.error('[MEDIA ERROR]', reason));
    } else {
      await player.promise;
      videoElement?.pause();
    }
  }

  async function videoPosterChangedHandler({ detail }: CustomEvent) {
    if (detail.video_id === video.id) {
      videoElement && dispatch('player:unload', videoElement);
    }
  }

  async function prepare() {
    if (!videoElement.getAttribute('src') && src) {
      videoElement.setAttribute('src', src);
    }
  }

  function keydownHandler(e: KeyboardEvent) {
    const target = e.target as Element;
    let intervalId: ReturnType<typeof setTimeout>;

    keyListenerDiv.removeEventListener('keydown', keydownHandler);
    function keyupHandler() {
      clearInterval(intervalId);
      target.removeEventListener('keyup', keyupHandler);
      keyListenerDiv.addEventListener('keydown', keydownHandler);
    }

    target?.addEventListener('keyup', keyupHandler);

    const code = e.code;
    const getCallback = (speed: number) => {
      if (code === 'ArrowLeft')
        return () =>
          ui?.dispatchEvent(new CustomEvent('ui:show')) && (playhead -= speed);
      if (code === 'ArrowRight')
        return () =>
          ui?.dispatchEvent(new CustomEvent('ui:show')) && (playhead += speed);
      return () => void 0;
    };

    if (code === 'Space') {
      playPauseHandler();
      ui?.dispatchEvent(new CustomEvent('ui:show', { cancelable: true }));
    } else {
      let callback = getCallback(e.shiftKey ? 10 : 1);
      intervalId = setInterval(callback, 100);
      callback();
    }
  }

  function mousemoveHandler(event: Event) {
    scrub && doScrub(event as MouseEvent);
  }

  function doScrub(event: MouseEvent) {
    if (!(event.buttons & 1)) return; // mouse not down
    if (!loadeddata) return;

    const { left, right } =
      videoElement && videoElement.getBoundingClientRect();
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

  function pausedHandler() {
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
    wheel && (playhead += detail.deltaY * 0.2);
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

  function canplayHandler(e: Event) {
    const target = e.target as HTMLVideoElement;
    dispatch('player:canplay', { target, video });
  }

  function loadstartHandler(e: Event) {
    const target = e.target as HTMLVideoElement;
    dispatch('player:loadstart', { target, video });
  }

  function loadeddataHandler(e: Event) {
    const target = e.target as HTMLVideoElement;
    loadeddata = true;
    src = target.getAttribute('src');
    dispatch('player:loadeddata', { target, video });
  }

  function emptiedHandler(e: Event) {
    const target = e.target as HTMLVideoElement;
    loadeddata = false;
    dispatch('player:emptied', { target, video });
  }

  function abortedHandler(e: Event) {
    const target = e.target as HTMLVideoElement;
    dispatch('player:aborted', { target, video });
  }

  function pictureInPictureHandler() {
    if (document.pictureInPictureElement)
      document.exitPictureInPicture().catch(() => {});
    else videoElement?.requestPictureInPicture().catch(() => {});
  }

  function fullscreenHandler() {
    if (document.fullscreenElement) document.exitFullscreen().catch((e) => {});
    else if (videoElement?.requestFullscreen) videoElement.requestFullscreen();
  }
</script>

<slot />
<div
  role="button"
  bind:this={keyListenerDiv}
  class="player {className}"
  class:loadeddata
  tabindex="-1"
  on:keydown={keydownHandler}
>
  <video
    class="flex-1"
    muted={$mute}
    bind:this={videoElement}
    bind:currentTime={playhead}
    bind:duration
    bind:paused
    bind:buffered={buffer}
    on:loadstart={loadstartHandler}
    on:canplay={canplayHandler}
    on:loadeddata={loadeddataHandler}
    on:emptied={emptiedHandler}
    on:abort={abortedHandler}
    on:pause={pausedHandler}
    {controls}
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
      on:fullscreen={fullscreenHandler}
      on:play-pause={playPauseHandler}
      on:rwd={rewindHandler}
      on:fwd={forewardHandler}
      bind:time={playhead}
      bind:ui
      {duration}
      {paused}
      {buffered}
      {loadeddata}
      {waiting}
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
    object-fit: contain;
  }
  .loaded video {
    object-fit: contain;
  }
</style>
