<script lang="ts">
  import { page, navigating } from '$app/stores';
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
  import { browser } from '$app/environment';

  export let data: PageData;

  const { info }: any = getContext('logger');

  let paused: boolean;
  let canplay: boolean;
  let playhead: number;
  let timeoutIdWatchPlayhead: ReturnType<typeof setTimeout>;
  let timeoutIdSavePlayhead: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let src: string | undefined;

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
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | {video?.title || $_('text.no-title')}</title>
</svelte:head>

{#await promise then}
  {#if video}
    <div in:fly={{ duration: 1000, opacity: 0 }} class="media-player bg-black flex flex-1">
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
        customUI
        curtain
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
