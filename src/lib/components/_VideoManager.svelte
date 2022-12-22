<script>
  import './_icon-button.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Label, Icon } from '@smui/fab';
  import { Info, VideoCard, MediaUploader, VideoEditorList, Paginator } from '$lib/components';
  import { session, videos, fabs } from '$lib/stores';
  import {
    ADMIN,
    SUPERUSER,
    posterCreatedHandler,
    posterRemoveHandler,
    posterSelectedHandler
  } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  const { open: open$editor, close: close$editor } = getContext('editor-modal');
  const { open: open$uploader, close: close$uploader } = getContext('default-modal');
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const { setFab } = getContext('fab');
  const transitionParams = {
    delay: 0,
    duration: 200
  };
  const flyTransitionParams = { ...transitionParams, x: -80 };
  const sortAZ =
    /**
     * @param {any} a
     * @param {any} b
     *
     */
    (a, b) => {
      let _a, _b;
      a = (_a = a.title || a.src) && _a.toLowerCase();
      b = (_b = b.title || b.src) && _b.toLowerCase();
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    };

  /**
   * @type {import("@smui/snackbar")}
   */
  let snackbar;
  /**
   * @type {any}
   */
  let uploadedData;
  /**
   * @type {HTMLUListElement}
   */
  let videoList;

  $: pagination = $page.data.pagination?.videos;
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;

  onMount(() => {
    snackbar = getSnackbar();

    if (hasPrivileges) {
      setFab('add-video');
    } else {
      setFab();
    }
  });

  let openUploader =
    /**
     * @param {any} type
     */
    (type) => {
      open$uploader(
        MediaUploader,
        {
          layoutProps: { type: $_('text.videos') },
          type: 'video',
          options: {
            // acceptedFiles: '.mov .mp4 .m4a .m4v .3gp .3g2 .webm',
            parallelUploads: 1,
            maxFiles: 1,
            timeout: 3600 * 1000, // 60min
            maxFilesize: 1024 // Megabyte
          },
          events: { 'upload:success': uploadSuccessHandler }
        },
        {
          closeOnOuterClick: false,
          transitionWindow: fly,
          transitionWindowProps: {
            y: -200,
            duration: 500
          }
        },
        {
          onClosed: openEditor
        }
      );
    };

  /**
   *
   * @param {CustomEvent} param0
   */
  function uploadSuccessHandler({ detail }) {
    /** @type {any} */
    const { data, message, success } = { ...detail.responseText };

    configSnackbar(message);
    snackbar?.open();

    if (success) {
      uploadedData = data;
      videos.add([data]);
      close$uploader();
    }
  }

  function openEditor() {
    if (!uploadedData) return;

    open$editor(
      VideoEditorList,
      {
        data: uploadedData
      },
      {},
      {}
    );
    uploadedData = null;
  }
</script>

{#if $session.user}
  {#if $videos.length}
    <ul
      bind:this={videoList}
      class="items-list grid lg:grid-cols-3 md:grid-cols-2 grid-flow-row gap-4"
    >
      {#each $videos.sort(sortAZ) as video (video.id)}
        <li class="list-item">
          <VideoCard
            on:video:posterCreated={(event) => posterCreatedHandler(event, video.id)}
            on:video:selectedPoster={(event) => posterSelectedHandler(event.detail, video.id)}
            on:video:removePoster={() => posterRemoveHandler(video.id)}
            {video}
          />
        </li>
      {/each}
    </ul>
    <Paginator {pagination} store={videos} id="videos-paginator" action="/videos?/more_videos" />
  {:else}
    <div class="empty-selection">
      <span style="text-align: center;">{$_('text.no-content-available')}</span>
    </div>
  {/if}
  {#if $fabs === 'add-video'}
    <Fab class="floating-fab" color="primary" on:click={() => openUploader('video')} extended>
      <Label>{$_('text.add-video')}</Label>
      <Icon class="material-icons">add</Icon>
    </Fab>
  {/if}
{:else}
  <div class="paper-container flex justify-center m-8">
    <div class="flyer" transition:fly={flyTransitionParams}>
      <Info title={$_('text.authentication-required')} let:href>
        <a {href} on:click|preventDefault={() => goto(href)}>{$_('text.sign-in-now')}</a>
      </Info>
    </div>
  </div>
{/if}

<style>
  .flyer {
    min-width: 50%;
    position: relative;
  }
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
  .items-list {
    padding: 15px;
    min-height: 200px;
    background-color: var(--background-100);
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
</style>
