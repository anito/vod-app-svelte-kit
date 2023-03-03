<script lang="ts">
  import { onDestroy, onMount, getContext, createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { Media, MediaContent } from '@smui/card';
  import Textfield, { Textarea } from '@smui/textfield';
  import VideoPlayer, { mute } from '$lib/components/Video';
  import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo, emit } from '$lib/utils';
  import { session, users } from '$lib/stores';
  import dummyPoster from '/src/assets/images/empty-poster.jpg';
  import { _ } from 'svelte-i18n';
  import type { Video } from '$lib/classes/repos/types';

  export let video: Video;
  export let emptyPoster: string = dummyPoster;
  export let title: string = '';
  export let description: string = '';
  export let isEditMode: boolean = false;

  let src: string | undefined;
  let playhead: number;
  let timeoutId: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let canplay = false;
  let paused = true;

  const dispatch = createEventDispatcher();
  const { info }: any = getContext('logger');

  $: user = $users?.find((user) => user?.id === $session.user?.id);
  $: user && (canplay = false);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((u) => u?.id === user?.id)
    ?.videos.find((v: Video) => v?.id === video?.id)?._joinData;
  $: associated = user?.videos
    .filter((v: Video) => v?.id != video?.id)
    .map((v: Video) => ({ id: v?.id }));
  $: (video.image_id &&
    getMediaImage(video.image_id, $session.user?.jwt).then((res) => (poster = res))) ||
    (poster = emptyPoster);
  $: video?.id && getMediaVideo(video?.id, $session.user?.jwt).then((res) => (src = res));
  $: ((time) => {
    if (paused && canplay) {
      let pausedTime = time;
      clearTimeout(timeoutId);
      timeoutId = setTimeout((saved) => saved === time && savePlayhead(), 200, pausedTime);
    }
  })(playhead);

  onMount(() => {});

  onDestroy(() => {
    paused = true;
    src = '';
    savePlayhead();
  });

  // set playhead to the last saved position when the video is ready to play
  function handleCanPlay() {
    if (canplay) return;
    canplay = true;
    playhead = hasPrivileges ? video?.playhead : joinData?.playhead;
  }

  async function savePlayhead() {
    if (!canplay) return;
    if (hasPrivileges) {
      // if (Math.round(video?.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
      emit('video:save', {
        data: { id: video.id, playhead }
      });
    } else {
      // if (Math.round(joinData?.playhead * 100) / 100 === Math.round(playhead * 100) / 100) return;
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

      emit('user:save', {
        data
      });
    }
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
    paused = true;
    canplay = false;
  }

  function setFocus(node: HTMLElement) {
    const inputEl = node.querySelector('input');
    inputEl?.focus();
    inputEl?.select();
  }

  function dispatchEnter(event: CustomEvent) {
    const e = event as unknown as KeyboardEvent
    if(e.code == 'Enter') {
      dispatch('key:enter')
    }
    if(e.code == 'Escape') {
      dispatch('key:escape')
    }
  }
</script>

<Media aspectRatio="16x9">
  <MediaContent class="flex z-10">
    {#if isEditMode}
      <div in:fly out:fly class="editor-wrapper">
        <div class="editor p-2">
          <Textfield
            class="mb-3"
            variant="outlined"
            use={[setFocus]}
            label="Title"
            bind:value={title}
            on:keydown={dispatchEnter}
          />
          <Textfield
            class="flex-1"
            textarea
            variant="outlined"
            label="Description"
            bind:value={description}
          />
        </div>
      </div>
    {/if}
    <div class="media-player player-container flex flex-1 justify-center bg-black">
      {#if $session.user}
        <VideoPlayer
          class="video-player flex flex-1"
          bind:paused
          bind:playhead
          on:player:canplay={handleCanPlay}
          on:player:emptied={handleEmptied}
          on:player:loadeddata={handleLoadedData}
          on:player:loadstart={handleLoadStart}
          on:player:aborted={handleAborted}
          multiplayer
          {poster}
          {src}
          {video}
        />
      {/if}
    </div>
  </MediaContent>
</Media>

<style>
  .editor-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
    background: var(--background);
  }
  .editor {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .player-container {
    position: relative;
  }
  .media-player {
    --curtain-fs-title: 1.3rem;
    --curtain-fs-descr: 0.7rem;
    --curtain-lh-title: 1.3rem;
    --curtain-lh-descr: 0.7rem;
    --curtain-p: 1rem;
    --curtain-c-title: #555555;
    --curtain-c-descr: #888888;
    --curtain-bg-left: #000000f0;
    --curtain-bg-right: #00000030;
  }
</style>
