<script context="module">
  // @ts-nocheck

  const MAXSTREAMS = 5;

  let players = new Set();
  let now = new Date().getTime();
</script>

<script>
  import { page } from '$app/stores';
  import Video from './Video.svelte';
  import { onMount } from 'svelte';
  import { getExt } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  export let poster = '';
  /**
   * @type {import('$lib/types').Video}
   */
  export let video;
  /**
   * @type {any}
   */
  export let src;
  export let type = getExt(src);
  export let paused = true;
  export let autoplay = false;
  /**
   * @type {any}
   */
  export let playhead;
  export let controls = false;
  export let multiplayer = false;
  export let curtain = false;

  const browserName = $page.data.browser.name;

  /**
   * @type {any}
   */
  let videoElement;
  let className = '';

  export { className as class };

  onMount(() => {
    let timestamp = now;
    multiplayer &&
      players.add({
        videoElement,
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
      if (player.videoElement !== videoElement) {
        if (player.videoElement.promise !== void 0) {
          player.videoElement.promise.then(() => player.videoElement.pause());
        }
      } else {
        player.timestamp = new Date().getTime();
      }
    });
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
      _player.videoElement.src = '';
      _player.videoElement.promise = void 0;
    }
  }
</script>

{#if curtain}
  <div class="curtain" class:paused>
    <div class="curtain-left bg-black opacity-90">
      <h2
        class="mdc-typography--headline6 curtain-title opacity-25"
        class:opacity-25={!video.title}
      >
        {video.title || $_('text.empty-title')}
      </h2>
      <h3
        class="mdc-typography--subtitle2 curtain-desc opacity-25"
        class:opacity-25={!video.description}
      >
        {video.description || $_('text.empty-description')}
      </h3>
    </div>
    <div class="curtain-right bg-black opacity-30" />
  </div>
{/if}
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
  allowScrubbing
  {autoplay}
  {controls}
  {poster}
  {src}
  {video}
  {type}
/>

<style>
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
