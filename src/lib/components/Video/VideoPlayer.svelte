<script lang="ts">
  import { page } from '$app/stores';
  import { Video } from '.';
  import { onMount } from 'svelte';
  import { players, streams } from './utils';
  import { getExt } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { Video as VideoType } from '$lib/classes/repos/types';
  import type { Player } from './utils';

  export let src: string | null = null;
  export let poster: string | undefined = undefined;
  export let video: VideoType;
  export let type = getExt(video.src);
  export let paused = true;
  export let autoplay = false;
  export let playhead: number;
  export let customUI = false;
  export let controls = false;
  export let scrub = false;
  export { className as class };

  const isChrome = $page.data.ua.name === 'Chrome';

  let player: Player;
  let duration: number;
  let loadeddata: boolean = false;
  let element: HTMLVideoElement;
  let className = '';

  $: progress = (playhead * 100) / duration || 0;
  $: if (!paused) {
    pausePlayers();
  }

  onMount(() => {
    paused = true;
    player = { element, promise: new Promise(() => void 0) };
    players.add(player);
    return () => {
      players.delete(player);
    };
  });

  /**
   * Only one player should be playing at a time
   */
  function pausePlayers() {
    players.forEach(async (plr) => {
      if (plr.promise === player?.promise) {
        streams.add(element);
        unloadStream();
      } else if (!plr.element?.paused) {
        await plr.promise;
        plr.element?.pause();
      }
    });
  }

  /**
   * Unload the given element in the stack to free ressources
   *
   * To preserve ressources some user agents (e.g. Chrome) limit the number of media players
   * that can be loaded simultaniously (regardless of "preload" attribute is set to none)
   */
  function unloadStream(element?: HTMLVideoElement) {
    if (!element && streams.size > 5) {
      const it = streams.values();
      element = it.next().value;
    }
    if (element) {
      element.src = '';
      streams.delete(element);
    }
  }

  function unloadStreamHandler({ detail }: CustomEvent) {
    unloadStream(detail);
  }
</script>

{#if !loadeddata && video.duration}
  <div class="duration">
    {video.duration?.toHHMMSS()}
  </div>
{/if}
<Video
  class={className}
  bind:paused
  bind:videoElement={element}
  bind:playhead
  bind:player
  bind:duration
  on:player:fwd
  on:player:rwd
  on:player:unload={unloadStreamHandler}
  on:player:paused
  on:player:canplay
  on:player:emptied={() => (loadeddata = false)}
  on:player:emptied
  on:player:aborted
  on:player:loadstart
  on:player:loadeddata={() => (loadeddata = true)}
  on:player:loadeddata
  on:player:saveplayhead
  {customUI}
  {controls}
  {scrub}
  {autoplay}
  {poster}
  {src}
  {video}
  {type}
>
  <div class="progress-bar" style:--progress="{progress}%">
    <div class="value" />
  </div>
</Video>

<style>
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
  .progress-bar {
    position: absolute;
    left: 0;
    bottom: 1px;
    width: 100%;
    height: 3px;
    z-index: 2;
  }
  .progress-bar > .value {
    background-color: var(--primary);
    position: absolute;
    transition: width 0.08s;
    width: var(--progress);
    height: 100%;
  }
</style>
