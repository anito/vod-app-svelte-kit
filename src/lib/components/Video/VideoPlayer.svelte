<script lang="ts">
  import { page } from '$app/stores';
  import { Video } from '.';
  import { onMount } from 'svelte';
  import { getExt, players, stack } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { Video as VideoType } from '$lib/classes/repos/types';
  import type { Player } from '$lib/utils/module-vars';

  export let src: string | undefined;
  export let poster = '';
  export let video: VideoType;
  export let type = getExt(video.src);
  export let paused = true;
  export let autoplay = false;
  export let playhead: any;
  export let customUI = false;
  export let curtain = false;
  export let scrub = false;
  
  const isChrome = $page.data.ua.name === 'Chrome';
  
  let player: Player;
  let canplay = false;
  let element: HTMLVideoElement;
  let className = '';

  export { className as class };

  onMount(() => {
    player = { element, promise: new Promise(() => void 0) };
    players.add(player);
    return () => {
      players.delete(player);
    };
  });

  $: if (!paused) {
    pausePlayers();
    unloadStreams(5);
  }

  /**
   * Only one player should be playing at a time
   */
  function pausePlayers() {
    players.forEach(async (plr) => {
      if(plr.promise === player.promise) {
        stack.add(element);
      } else if (!plr.element?.paused) {
          await plr.promise;
          plr.element?.pause();
      }
    })
  }

  /**
   * Unload the first loaded player in the stack to free ressources
   * 
   * To preserve ressources some user agents (e.g. Chrome) limit the number of media players 
   * that can be loaded simultaniously. Even if "preload" set to none.
   */
  function unloadStreams(limit: number) {
    stack.forEach((item, key, set) => {
      if (set.size > limit) {
        item.src = '';
        set.delete(item);
      }
    });
  }
</script>

{#if curtain}
  <div class="curtain" class:paused>
    <div class="curtain-left bg-black opacity-90">
      <h2
        class="mdc-typography--headline6 curtain-title opacity-25"
        class:opacity-25={!video.title}
      >
        {video.title || video.src}
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
{#if !canplay && video.duration}
  <div class="duration">
    {video.duration?.toHHMMSS()}
  </div>
{/if}
<Video
  class={className}
  bind:paused
  bind:videoElement={element}
  bind:playhead
  bind:player={player}
  on:player:paused
  on:player:canplay={() => (canplay = true)}
  on:player:canplay
  on:player:emptied
  on:player:aborted
  on:player:loadeddata
  on:player:loadstart
  on:player:fwd
  on:player:rwd
  {customUI}
  {scrub}
  {autoplay}
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
    min-width: 50%;
    max-width: 50%;
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
    word-wrap: break-word;
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
    word-wrap: break-word;
  }
  .curtain .curtain-desc {
    font-size: var(--curtain-fs-descr);
    line-height: var(--curtain-lh-descr, 1rem);
    color: var(--curtain-c-descr, #444444);
  }
  .duration {
    display: inline-block;
    font-family: -apple-system, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
      'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji';
    font-size: 11px;
    position: absolute;
    z-index: 1;
    bottom: 15px;
    right: 15px;
    padding: 1px 5px;
    border-radius: 3px;
    color: #fff;
    background: #000;
  }
</style>
