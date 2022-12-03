<script>
  import { page, navigating } from '$app/stores';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { session, sitename, videos, users } from '$lib/stores';
  import { VideoPlayer } from '$lib/components/Video';
  import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo, info, proxyEvent } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  /** @type {boolean} */
  let paused;
  /** @type {boolean} */
  let canplay;
  /** @type {number} */
  let playhead;
  /** @type {ReturnType <typeof setTimeout>} */
  let timeoutId;
  /** @type {string | undefined} */
  let poster;
  /** @type {string | undefined} */
  let src;

  $: user = $users.find((user) => user.id === $session.user?.id);
  $: user && (canplay = false);
  $: video = $videos.find((v) => v.id === $page.params.slug);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((/** @type {import('$lib/types').User} v */ u) => u.id === user?.id)
    ?.videos.find((/** @type {import('$lib/types').Video} v */ v) => v.id === video?.id)?._joinData;
  $: ((time) => {
    if (!paused || !canplay) return;
    let pauseTime = time;
    clearTimeout(timeoutId);
    timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, pauseTime);
  })(playhead);
  $: video?.image_id && getMediaImage(video.image_id, $session.user?.jwt).then((v) => (poster = v));
  $: video?.id && getMediaVideo(video.id, $session.user?.jwt).then((v) => (src = v));
  $: $navigating && savePlayhead();

  onMount(() => {});

  // set playhead to the last saved position when the video is ready to play
  function handleCanPlay() {
    if (canplay) return;
    canplay = true;
    playhead = hasPrivileges ? video?.playhead : joinData?.playhead;
  }

  /** @param {CustomEvent} event */
  function handleEmptied(event) {
    info(
      4,
      '%c EMPTIED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /** @param {CustomEvent} event */
  function handleLoadStart(event) {
    info(
      4,
      '%c LOADSTART %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /** @param {CustomEvent} event */
  function handleLoadedData(event) {
    info(
      4,
      '%c LOADEDDATA%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /** @param {CustomEvent} event */
  function handleAborted(event) {
    info(
      4,
      '%c ABORTED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
    // in Chrome we have to limit streams due to Chromes limitation
    // this is done by emptying src attribute on the video which forgets the playheads position
    // to set the videos canPlay flag to false will re-adjust playhead to last saved position when video canPlay again
    paused = true;
    canplay = false;
  }

  async function savePlayhead() {
    if (!canplay) return;
    if (hasPrivileges) {
      if (Math.round(video.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      proxyEvent('video:save', {
        data: { id: video.id, playhead }
      });
    } else {
      if (Math.round(joinData.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      const associated = user.videos
        .filter(/** @param {import('$lib/types').Video} v */ (v) => v.id != video.id)
        .map(/** @param {import('$lib/types').Video} v */ (v) => ({ id: v.id }));
      const data = {
        id: user?.id,
        videos: [
          {
            id: video.id,
            _joinData: { ...joinData, playhead }
          },
          ...associated
        ]
      };

      proxyEvent('user:save', { data });
    }
  }
</script>

<svelte:head>
  <title>{$sitename} | {video?.title || $_('text.no-title')}</title>
</svelte:head>

{#if video && user}
  <div in:fly={{ duration: 800, opacity: 0 }} class="media-player bg-black flex flex-1">
    <VideoPlayer
      class="video-player flex flex-1"
      bind:paused
      bind:playhead
      on:player:canplay={handleCanPlay}
      on:player:emptied={handleEmptied}
      on:player:loadeddata={handleLoadedData}
      on:player:loadstart={handleLoadStart}
      on:player:aborted={handleAborted}
      {video}
      {poster}
      {src}
      curtain
    />
  </div>
{:else}
  <div class="empty-selection">
    <span style="text-align: center;">{$_('text.empty-video-selection')}</span>
  </div>
{/if}

<style>
  .empty-selection {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
  .media-player {
    --curtain-lh-title: 4rem;
    --curtain-lh-descr: 2rem;
    --curtain-fs-title: 4rem;
    --curtain-fs-descr: 2rem;
    --curtain-p: 3rem;
    --curtain-c-title: #555555;
    --curtain-c-descr: #888888;
    --curtain-bg-left: #000000d0;
    --curtain-bg-right: #00000030;
  }
</style>