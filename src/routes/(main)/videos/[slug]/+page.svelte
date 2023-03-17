<script lang="ts">
  import { page } from '$app/stores';
  import { beforeNavigate } from '$app/navigation';
  import { browser } from '$app/environment';
  import { fly } from 'svelte/transition';
  import { getContext, onMount } from 'svelte';
  import { session, videos, users } from '$lib/stores';
  import { FlexContainer } from '$lib/components';
  import VideoPlayer from '$lib/components/Video';
  import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo, emit } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import type { User, Video } from '$lib/classes/repos/types';

  export let data: PageData;

  const { info }: any = getContext('logger');
  const curtain = true;
  const mediaAnimDuration = 1000;
  const curtainAnimDuration = 500;

  let paused: boolean;
  let canplay: boolean;
  let playhead: number;
  let timeoutIdWatchPlayhead: ReturnType<typeof setTimeout>;
  let timeoutIdSavePlayhead: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let src: string | undefined;
  let introstart: boolean = false;
  let introend: boolean = false;
  let outrostart: boolean = false;
  let outroend: boolean = false;
  let customUI: boolean;
  let withinRoute: boolean;
  let title: string;
  let description: string | undefined;

  beforeNavigate(({ to, from }) => {
    withinRoute = to?.route.id === $page.route.id;
    const id = from?.params?.slug;
    if (id && !paused) savePlayhead(id, playhead);
  });

  onMount(() => {
    withinRoute = true;
    setCurtainText();
  });

  $: if (data.video) videos.add([data.video]);
  $: user = $users?.find((user) => user.id === $session.user?.id);
  $: user && (canplay = false);
  $: video = $videos.find((v) => v.id === $page.params.slug);
  $: video_id = video?.id; // debounce video
  $: user_id = user?.id; // debounce user
  $: promise =
    browser &&
    (new Promise((resolve, reject) => {
      if (video_id !== undefined && user_id !== undefined) {
        resolve(1);
      } else {
        reject();
      }
    }).catch() as Promise<number>);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((u: User) => u.id === user?.id)
    ?.videos.find((v: Video) => v.id === video?.id)?._joinData;
  $: video?.image_id && getMediaImage(video.image_id, $session.user?.jwt).then((v) => (poster = v));
  $: if (video) getMediaVideo(video.id, $session.user?.jwt).then((v) => (src = v));
  $: watchPlayhead(playhead, paused);
  $: playing = !paused;

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

  function setCurtainText() {
    title = video?.title || video?.src;
    description = video?.description;
  }

  function outrostartHandler() {
    outrostart = true;
    outroend = false;
    customUI = false;
  }

  function outroendHandler() {
    outroend = true;
    outrostart = false;
    setCurtainText()
  }

  function introstartHandler() {
    introstart = true;
    introend = false;
  }

  function introendHandler() {
    introend = true;
    introstart = false;
    customUI = true;
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | {video?.title || $_('text.no-title')}</title>
</svelte:head>

{#if withinRoute}
  {#if curtain && video}
    <div
      style:--transition-duration={`${curtainAnimDuration}ms`}
      class="curtains"
      class:paused
      class:playing
      class:introstart
      class:introend
      class:outrostart
      class:outroend
    >
      <div class="curtain curtain-primary">
        <h2
          class="mdc-typography--headline6 curtain-title opacity-25"
          class:opacity-25={!title}
        >
          {title}
        </h2>
        <h3
          class="mdc-typography--subtitle2 curtain-desc opacity-25"
          class:opacity-25={!description}
        >
          {description || $_('text.empty-description')}
        </h3>
      </div>
      <div class="curtain curtain-secondary" />
    </div>
  {/if}
  {#await promise then}
    {#if video}
      <div
        in:fly={{ duration: mediaAnimDuration, opacity: 0, delay: 200 }}
        out:fly={{ duration: mediaAnimDuration, opacity: 0 }}
        on:introstart={introstartHandler}
        on:introend={introendHandler}
        on:outrostart={outrostartHandler}
        on:outroend={outroendHandler}
        class="media-player single-player flex flex-1"
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
{/if}

<style>
  .media-player {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #000000;
  }
  .curtain {
    --curtain-title-ink: #aaaaaa;
    --curtain-descr-ink: #888888;
    --curtain-primary-bg: #000000d6;
    --curtain-secondary-bg: #0000006c;
  }
  .curtains {
    pointer-events: none;
    width: 100%;
    position: absolute;
    z-index: 1;
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
    padding: 2rem;
    overflow: hidden;
    transform-origin: 0 center;
    transition-property: transform;
    transition-duration: var(--transition-duration);
    transition-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }
  .curtain-primary {
    z-index: 2;
    right: 0;
    width: 50%;
    max-width: 100%;
    height: 200px;
    min-height: 200px;
    background-color: var(--curtain-primary-bg);
    word-wrap: break-word;
    border-bottom-left-radius: 40px;
  }
  .playing .curtain-primary {
    transform: translateX(100%);
    transition-duration: calc(var(--transition-duration) * 1.5);
    transition-timing-function: ease-in-out;
  }
  .paused.outrostart .curtain-primary {
    transform: translateX(100%);
    transition-duration: calc(var(--transition-duration) * 1);
  }
  .paused.outroend .curtain-primary {
    transform: translateX(0%);
    transition-duration: calc(var(--transition-duration) * 1);
  }
  .curtain-secondary {
    z-index: 1;
    left: 0;
    width: 100%;
    opacity: 1;
    transform: translateX(0%);
    transition: all;
    transition-duration: 1s;
    background-color: var(--curtain-secondary-bg);
  }
  .playing .curtain-secondary {
    opacity: 0;
  }
  .curtain .curtain-title {
    transform: translateX(0%);
    font-size: 2rem;
    line-height: 2rem;
    color: var(--curtain-title-ink, #444444);
    word-wrap: break-word;
    margin-bottom: 20px;
  }
  .curtain .curtain-desc {
    font-size: 1rem;
    line-height: 1rem;
    color: var(--curtain-descr-ink, #444444);
  }
</style>
