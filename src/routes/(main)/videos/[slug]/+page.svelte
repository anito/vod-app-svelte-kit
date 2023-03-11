<script lang="ts">
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { session, videos, users } from '$lib/stores';
  import { FlexContainer } from '$lib/components';
  import VideoPlayer from '$lib/components/Video';
  import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo, emit } from '$lib/utils';
  import type { PageData } from './$types';
  import type { User, Video } from '$lib/classes/repos/types';
  import { _ } from 'svelte-i18n';
  import { beforeNavigate } from '$app/navigation';

  export let data: PageData;

  const { info }: any = getContext('logger');
  const curtain = true;
  const mediaAnimDuration = 2000;
  const curtainAnimDuration = 1000;

  let paused: boolean;
  let canplay: boolean;
  let playhead: number;
  let timeoutIdWatchPlayhead: ReturnType<typeof setTimeout>;
  let timeoutIdSavePlayhead: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let src: string | undefined;
  let started: boolean = false;
  let ended: boolean = false;
  let customUI: boolean;

  $: if (data.video) videos.add([data.video]);
  $: user = $users?.find((user) => user.id === $session.user?.id);
  $: user && (canplay = false);
  $: video = $videos.find((v) => v.id === $page.params.slug);
  $: video_id = video?.id; // debounce video
  $: user_id = user?.id; // debounce user
  $: promise = new Promise((resolve, reject) => {
    if (video_id !== undefined && user_id !== undefined) {
      resolve(true);
    } else {
      reject();
    }
  }).catch() as Promise<boolean>;
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((u: User) => u.id === user?.id)
    ?.videos.find((v: Video) => v.id === video?.id)?._joinData;
  $: video?.image_id && getMediaImage(video.image_id, $session.user?.jwt).then((v) => (poster = v));
  $: if (video) getMediaVideo(video.id, $session.user?.jwt).then((v) => (src = v));
  $: watchPlayhead(playhead, paused);

  beforeNavigate(({ from }) => {
    const id = from?.params?.slug;
    if (id) {
      savePlayhead(id, playhead);
    }
  });

  function watchPlayhead(time: number, paused: boolean) {
    if (paused && canplay) {
      clearTimeout(timeoutIdWatchPlayhead);
      timeoutIdWatchPlayhead = setTimeout(
        (pausetime: number) => {
          if (pausetime === time) video && savePlayhead(video.id, time);
        },
        200,
        time
      );
    }
  }

  function savePlayhead(
    id: string,
    playhead: number,
    callback: { onsuccess?: any; onerror?: any } = {}
  ) {
    if (!canplay) return;

    clearTimeout(timeoutIdSavePlayhead);
    const { onsuccess, onerror } = { onsuccess: () => {}, onerror: () => {}, ...callback };
    if (hasPrivileges) {
      if (Math.round(video?.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      timeoutIdSavePlayhead = setTimeout(
        () =>
          emit('video:save', {
            data: { id, playhead },
            onsuccess,
            onerror
          }),
        200
      );
    } else {
      if (Math.round(joinData.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      const associated = user?.videos
        .filter((v: Video) => v.id != video?.id)
        .map((v: Video) => ({ id: v.id }));
      const data = {
        id: user?.id,
        videos: [
          {
            id,
            _joinData: { ...joinData, playhead }
          },
          ...associated
        ]
      };

      timeoutIdSavePlayhead = setTimeout(
        () =>
          emit('user:save', {
            data,
            onsuccess,
            onerror
          }),
        200
      );
    }
  }

  // set playhead to the last saved position when the video is ready to play
  function handleCanPlay() {
    if (canplay) return;
    canplay = true;
    playhead = hasPrivileges ? video?.playhead : joinData?.playhead;
  }

  function handleEmptied(event: CustomEvent) {
    info(
      4,
      '%c EMPTIED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  function handleLoadStart(event: CustomEvent) {
    info(
      4,
      '%c LOADSTART %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  function handleLoadedData(event: CustomEvent) {
    info(
      4,
      '%c LOADEDDATA%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  function handleAborted(event: CustomEvent) {
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
  function startHandler() {
    started = true;
    ended = false;
    customUI = false;
  }
  function endHandler() {
    ended = true;
    started = false;
    customUI = true;
  }
  $: playing = !paused;
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | {video?.title || $_('text.no-title')}</title>
</svelte:head>

{#if curtain}
  <div
    style:--animation-duration={`${curtainAnimDuration}ms`}
    class="curtains"
    class:paused
    class:playing
    class:started
    class:ended
  >
    <div class="curtain curtain-left">
      <h2
        class="mdc-typography--headline6 curtain-title opacity-25"
        class:opacity-25={!video?.title}
      >
        {video?.title || video?.src}
      </h2>
      <h3
        class="mdc-typography--subtitle2 curtain-desc opacity-25"
        class:opacity-25={!video?.description}
      >
        {video?.description || $_('text.empty-description')}
      </h3>
    </div>
    <div class="curtain curtain-right" />
  </div>
{/if}
{#await promise then}
  {#if video}
    <div
      in:fly={{ duration: mediaAnimDuration, opacity: 0 }}
      out:fly={{ duration: mediaAnimDuration, opacity: 0 }}
      on:introstart={startHandler}
      on:introend={endHandler}
      class="media-player flex flex-1"
    >
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
        {customUI}
        scrub
      />
    </div>
  {/if}
{:catch}
  <FlexContainer>
    {$_('text.empty-video-selection')}
  </FlexContainer>
{/await}

<style>
  .media-player {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #000000;
  }
  .curtain {
    --curtain-title-lh: 4rem;
    --curtain-descr-lh: 2rem;
    --curtain-title-size: 4rem;
    --curtain-descr-size: 2rem;
    --curtain-title-ink: #aaaaaa;
    --curtain-descr-ink: #888888;
    --curtain-left-bg: #000000d6;
    --curtain-right-bg: #00000043;
  }
  @keyframes leftopenclose {
    0% {
      transform: scaleX(1) translateX(calc(300px));
    }
    50% {
      transform: scaleX(.9) translateX(-50%);
    }
    100% {
      transform: scaleX(1) translateX(calc(300px));
    }
  }
  @keyframes rightopenclose {
    0% {
      transform: scaleX(1.2) translateX(calc(-50%));
    }
    50% {
      transform: scaleX(.9) translateX(calc(50%));
    }
    100% {
      transform: scaleX(1.2) translateX(calc(0%));
    }
  }
  .curtains {
    pointer-events: none;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow: hidden;
  }
  .curtain {
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 1;
    padding: 3rem;
    overflow: hidden;
    transform-origin: 0 center;
    transition-property: transform;
    transition-duration: var(--animation-duration);
    transition-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }
  .curtain-left {
    left: -300px;
    min-width: 60%;
    max-width: 60%;
    transform-origin: left;
    background-color: var(--curtain-left-bg);
    word-wrap: break-word;
  }
  .playing .curtain-left {
    transform: translateX(calc(-60%));
    transition-duration: calc(var(--animation-duration) * 2.3);
    transition-timing-function: cubic-bezier(0.075, 0.885, 0.32, 1.175);
  }
  .paused.started .curtain-left {
    animation-name: leftopenclose;
    animation-duration: calc(var(--animation-duration) * 1);
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .paused.ended .curtain-left {
    transform: scaleX(1) translateX(calc(300px));
    transition-duration: calc(var(--animation-duration) * 1.3);
    transition-timing-function: cubic-bezier(0.175, 0.385, 0.32, 1.075);
  }
  .curtain-right {
    left: -300px;
    min-width: 200%;
    max-width: 200%;
    transform-origin: right;
    background-color: var(--curtain-right-bg);
  }
  .playing .curtain-right {
    transform: translateX(calc(100% + 300px));
    transition-timing-function: cubic-bezier(0.175, 0.385, 0.32, 1.075);
    animation-duration: calc(var(--animation-duration) * 0.8);
  }
  .paused.started .curtain-right {
    animation-name: rightopenclose;
    animation-duration: calc(var(--animation-duration) * 1.2);
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .paused.ended .curtain-right {
    /* transform: scaleX(1.2) translateX(-43.8%); */
    transform: scaleX(1.2) translateX(calc(0%));
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.175);
  }
  .curtain .curtain-title {
    transform: translateX(0%);
    font-size: var(--curtain-title-size);
    line-height: var(--curtain-title-lh, 1rem);
    color: var(--curtain-title-ink, #444444);
    word-wrap: break-word;
  }
  .curtain .curtain-desc {
    font-size: var(--curtain-descr-size);
    line-height: var(--curtain-descr-lh, 1rem);
    color: var(--curtain-descr-ink, #444444);
  }
</style>
