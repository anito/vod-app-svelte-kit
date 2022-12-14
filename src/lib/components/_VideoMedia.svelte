<script>
  import { onDestroy, onMount } from 'svelte';
  import { Media, MediaContent } from '@smui/card';
  import Textfield, { Textarea } from '@smui/textfield';
  import { VideoPlayer } from '$lib/components/Video';
  import { ADMIN, SUPERUSER, getMediaImage, getMediaVideo, info, proxyEvent } from '$lib/utils';
  import { session, users } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  /**
   * @type {import('$lib/types').Video}
   */
  export let video;
  /**
   * @type {string | undefined}
   */
  export let emptyPoster = 'test';
  /**
   * @type {string}
   */
  export let title = '';
  /**
   * @type {string}
   */
  export let description = '';
  /**
   * @type {boolean}
   */
  export let isEditMode = false;

  /**
   * @type {string | undefined}
   */
  let src;
  /**
   * @type {number}
   */
  let playhead;
  /**
   * @type {ReturnType<typeof setTimeout>}
   */
  let timeoutId;
  /**
   * @type {string | undefined}
   */
  let poster;
  let canplay = false;
  let paused = true;

  $: user = $users.find((user) => user?.id === $session.user?.id);
  $: user && (canplay = false);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: joinData = $users
    .find((/** @type {import('$lib/types').User} v */ u) => u?.id === user?.id)
    ?.videos.find(
      (/** @type {import('$lib/types').Video} v */ v) => v?.id === video?.id
    )?._joinData;
  $: associated = user?.videos
    .filter(/** @param {import('$lib/types').Video} v */ (v) => v?.id != video?.id)
    .map(/** @param {import('$lib/types').Video} v */ (v) => ({ id: v?.id }));
  $: (video.image_id &&
    getMediaImage(video.image_id, $session.user?.jwt).then((res) => (poster = res))) ||
    (poster = emptyPoster);
  $: video?.id && getMediaVideo(video?.id, $session.user?.jwt).then((res) => (src = res));
  $: ((time) => {
    if (!paused || !canplay) return;
    let pausedTime = time;
    clearTimeout(timeoutId);
    timeoutId = setTimeout((saved) => saved === time && savePlayhead(), 200, pausedTime);
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
      proxyEvent('video:save', {
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

      proxyEvent('user:save', {
        data
      });
    }
  }

  /**
   * @param {CustomEvent} event
   */
  function handleEmptied(event) {
    info(
      4,
      '%c EMPTIED   %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /**
   * @param {CustomEvent} event
   */
  function handleLoadStart(event) {
    info(
      4,
      '%c LOADSTART %c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /**
   * @param {CustomEvent} event
   */
  function handleLoadedData(event) {
    info(
      4,
      '%c LOADEDDATA%c %s',
      'background: #8593a9; color: #ffffff; padding:4px 6px 3px 0;',
      'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
      event.detail.title
    );
  }

  /**
   * @param {CustomEvent} event
   */
  function handleAborted(event) {
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
</script>

<Media aspectRatio="16x9">
  <MediaContent class="flex z-10">
    {#if hasPrivileges}
      <div class="editor-wrapper" class:is-edit-mode={isEditMode}>
        <div class="editor p-2">
          <Textfield
            class="mb-3"
            variant="outlined"
            dense
            bind:value={title}
            label="Title"
            input$aria-controls="helper-text-title"
            input$aria-describedby="helper-text-title"
          />
          <Textfield
            class="flex-1"
            textarea
            variant="outlined"
            bind:value={description}
            label="Description"
            input$aria-controls="helper-text-description"
            input$aria-describedby="helper-text-description"
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
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
    background: rgba(255, 255, 255, 0.9);
  }
  .editor {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .editor-wrapper.is-edit-mode {
    display: inline-block;
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
