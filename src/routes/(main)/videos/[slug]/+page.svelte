<script lang="ts">
  import { page } from '$app/stores';
  import { beforeNavigate } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { getContext, onMount } from 'svelte';
  import { session, videos, users } from '$lib/stores';
  import { FlexContainer } from '$lib/components';
  import VideoPlayer, { format } from '$lib/components/Video';
  import {
    ADMIN,
    SUPERUSER,
    getMediaImage,
    getMediaVideo,
    emit,
  } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { User, Video } from '$lib/classes/repos/types';

  export let data;

  const { info }: any = getContext('logger');
  const curtain = true;
  const mediaAnimDuration = 1000;
  const curtainAnimDuration = 500;

  let paused: boolean;
  let loadeddata: boolean = false;
  let playhead: number;
  let timeoutIdWatchPlayhead: ReturnType<typeof setTimeout>;
  let timeoutIdSavePlayhead: number | undefined;
  let poster: string | undefined;
  let src: string | undefined;
  let introstart: boolean = false;
  let introend: boolean = false;
  let outrostart: boolean = false;
  let outroend: boolean = false;
  let customUI: boolean;
  let withinRoute: boolean;
  let curVideo: Video;
  let title: string;
  let description: string | undefined;

  beforeNavigate(({ to, from }) => {
    withinRoute = to?.route.id === $page.route.id;
    const id = from?.params?.slug;
    if (id && !paused) {
      savePlayhead(id, playhead);
    }
  });

  onMount(() => {
    withinRoute = true;
    setCurtainText();
  });

  $: if (data.video) videos.add([data.video]);
  $: user = $users.find((u) => u.id === $session.user?.id);
  $: video = $videos.find((v) => v.id === $page.params.slug);
  $: video_id = video?.id; // debounce video
  $: user_id = user?.id; // debounce user
  $: promise = () =>
    new Promise((resolve, reject) => {
      if (video_id !== undefined && user_id !== undefined) {
        resolve(1);
      } else {
        reject();
      }
    }).catch() as Promise<number>;
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joindata = $users
    .find((u: User) => u.id === user?.id)
    ?.videos.find((v: Video) => v.id === video?.id)?._joinData;
  $: video?.image_id
    ? getMediaImage(video.image_id, $session.user?.jwt).then(
        (v) => (poster = v)
      )
    : (poster = undefined);
  $: if (video)
    getMediaVideo(video.id, $session.user?.jwt).then((v) => (src = v));
  $: watchPlayhead(playhead, paused);
  $: playing = !paused;

  function watchPlayhead(time: number, paused: boolean) {
    if (paused) {
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
    if (!loadeddata) return;

    clearTimeout(timeoutIdSavePlayhead);
    const { onsuccess, onerror } = {
      onsuccess: () => {},
      onerror: () => {},
      ...callback,
    };
    if (hasPrivileges) {
      timeoutIdSavePlayhead = setTimeout(
        (data: {
          data: { id: string; playhead: number };
          onsuccess: () => void;
          onerror: () => void;
        }) => emit('video:save', data),
        200,
        {
          data: { id, playhead },
          onsuccess,
          onerror,
        }
      );
    } else {
      const associated = user?.videos
        .filter((v: Video) => v.id != video?.id)
        .map((v: Video) => ({ id: v.id }));
      const data = {
        id: user?.id,
        videos: [
          {
            id,
            _joinData: { ...joindata, playhead },
          },
          ...associated,
        ],
      };

      timeoutIdSavePlayhead = setTimeout(
        (data: { data: any; onsuccess: () => void; onerror: () => void }) =>
          emit('user:save', data),
        200,
        {
          data,
          onsuccess,
          onerror,
        }
      );
    }
  }

  function setCurtainText() {
    if (video) {
      curVideo = video;
      title = video.title || video.src;
      description = video.description;
    }
  }

  function canplayHandler({ detail }: CustomEvent) {
    info(
      4,
      '%c CANPLAY   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function emptiedHandler({ detail }: CustomEvent) {
    loadeddata = false;
    info(
      4,
      '%c EMPTIED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function loadstartHandler({ detail }: CustomEvent) {
    info(
      4,
      '%c LOADSTART %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function loadeddataHandler({ detail }: CustomEvent) {
    loadeddata = true;
    playhead = hasPrivileges ? video?.playhead : joindata.playhead;
    info(
      4,
      '%c LOADEDDATA%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function abortedHandler({ detail }: CustomEvent) {
    info(
      4,
      '%c ABORTED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function outrostartHandler() {
    outrostart = true;
    outroend = false;
    customUI = false;
  }

  function outroendHandler() {
    outroend = true;
    outrostart = false;
    setCurtainText();
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

  function savePlayheadHandler({ detail }: CustomEvent) {
    const { id, playhead, callback } = detail;
    savePlayhead(id, playhead, callback);
  }
</script>

<svelte:head>
  <title
    >{$page.data.config.Site?.name} | {video?.title ||
      $_('text.no-title')}</title
  >
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
          {description || $_('text.empty-description')}
        </h3>
      </div>
      <div class="curtain curtain-secondary" />
    </div>
  {/if}
  {#await promise() then}
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
        on:player:canplay_={canplayHandler}
        on:player:emptied={emptiedHandler}
        on:player:loadstart={loadstartHandler}
        on:player:aborted={abortedHandler}
        on:player:loadeddata={loadeddataHandler}
        on:player:saveplayhead={savePlayheadHandler}
        video={curVideo}
        {customUI}
        {poster}
        {src}
        scrub
      />
    </div>
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
