<script lang="ts">
  import { page, navigating } from '$app/stores';
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { session, videos, users } from '$lib/stores';
  import { FlexContainer } from '$lib/components';
  import VideoPlayer, { mute } from '$lib/components/Video';
  import { ADMIN, SUPERUSER, USER, getMediaImage, getMediaVideo, emit } from '$lib/utils';
  import type { PageData } from './$types';
  import type { User, Video } from '$lib/classes/repos/types';
  import { _ } from 'svelte-i18n';

  export let data: PageData;

  const { info }: any = getContext('logger');

  let paused: boolean;
  let canplay: boolean;
  let playhead: number;
  let timeoutId: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let src: string | undefined;

  $: if (data.video) videos.add([data.video]);
  $: user = $users?.find((user) => user.id === $session.user?.id);
  $: user && (canplay = false);
  $: video = $videos.find((v) => v.id === $page.params.slug);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((u: User) => u.id === user?.id)
    ?.videos.find((v: Video) => v.id === video?.id)?._joinData;
  $: ((time) => {
    if (!paused || !canplay) return;
    let pauseTime = time;
    clearTimeout(timeoutId);
    timeoutId = setTimeout((saved) => saved === playhead && savePlayhead(), 500, pauseTime);
  })(playhead);
  $: video?.image_id && getMediaImage(video.image_id, $session.user?.jwt).then((v) => (poster = v));
  $: video?.id && getMediaVideo(video.id, $session.user?.jwt).then((v) => (src = v));
  $: $navigating && savePlayhead();

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

  async function savePlayhead() {
    if (!canplay) return;
    if (hasPrivileges) {
      if (Math.round(video?.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      emit('video:save', {
        data: { id: video?.id, playhead }
      });
    } else if ($session.role === USER) {
      if (Math.round(joinData.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      const associated = user?.videos
        .filter((v: Video) => v.id != video?.id)
        .map((v: Video) => ({ id: v.id }));
      const data = {
        id: user?.id,
        videos: [
          {
            id: video?.id,
            _joinData: { ...joinData, playhead }
          },
          ...associated
        ]
      };

      emit('user:save', { data });
    }
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | {video?.title || $_('text.no-title')}</title>
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
  <FlexContainer>
    {$_('text.empty-video-selection')}
  </FlexContainer>
{/if}

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
