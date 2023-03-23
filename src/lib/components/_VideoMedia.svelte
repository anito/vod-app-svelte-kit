<script lang="ts">
  import { onDestroy, getContext, createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { Media, MediaContent } from '@smui/card';
  import Textfield from '@smui/textfield';
  import VideoPlayer from '$lib/components/Video';
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
  let timeoutIdSavePlayhead: ReturnType<typeof setTimeout>;
  let poster: string | undefined;
  let canplay = false;
  let loadeddata: boolean = false;
  let paused = true;

  const dispatch = createEventDispatcher();
  const { info }: any = getContext('logger');

  $: user = $users?.find((user) => user?.id === $session.user?.id);
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
  $: if (video.id) getMediaVideo(video.id, $session.user?.jwt).then((res) => (src = res));

  onDestroy(() => {
    if (!paused) savePlayhead(video.id, playhead);
  });

  // set playhead to the last saved position when the video is ready to play
  function savePlayhead(
    id: string,
    playhead: number,
    callback: { onsuccess?: any; onerror?: any } = {}
  ) {
    if (!loadeddata) return;

    clearTimeout(timeoutIdSavePlayhead);
    const { onsuccess, onerror } = { onsuccess: () => {}, onerror: () => {}, ...callback };
    if (hasPrivileges) {
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

  function savePlayheadHandler({ detail }: CustomEvent) {
    const { id, playhead, callback } = detail;
    savePlayhead(id, playhead, callback);
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

  function canplayHandler({ detail }: CustomEvent) {
    info(
      4,
      '%c CANPLAY%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }
  
  function loadeddataHandler({ detail }: CustomEvent) {
    loadeddata = true;
    playhead = hasPrivileges ? video?.playhead : joinData?.playhead;
    info(
      4,
      '%c LOADEDDATA%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function abortedHandler({ detail }: CustomEvent) {
    paused = true;
    loadeddata = false;
    info(
      4,
      '%c ABORTED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      detail.video.title
    );
  }

  function setFocus(node: HTMLElement) {
    const inputEl = node.querySelector('input');
    inputEl?.focus();
    inputEl?.select();
  }

  function dispatchEnter(event: CustomEvent) {
    const e = event as unknown as KeyboardEvent;
    if (e.code == 'Enter') {
      dispatch('key:enter');
    }
    if (e.code == 'Escape') {
      dispatch('key:escape');
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
          on:player:aborted={abortedHandler}
          on:player:canplay={canplayHandler}
          on:player:emptied={emptiedHandler}
          on:player:loadstart={loadstartHandler}
          on:player:loadeddata={loadeddataHandler}
          on:player:saveplayhead={savePlayheadHandler}
          customUI
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
</style>
