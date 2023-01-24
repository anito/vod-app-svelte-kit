<script lang="ts">
  import './_icon-button.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Label, Icon } from '@smui/fab';
  import {
    Info,
    VideoCard,
    MediaUploader,
    VideoEditorList,
    Paginator,
    FlexContainer
  } from '$lib/components';
  import { session, videos, fabs } from '$lib/stores';
  import {
    ADMIN,
    SUPERUSER,
    posterCreatedHandler,
    posterRemoveHandler,
    posterSelectedHandler,
    proxyEvent
  } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';
  import type { Video } from '$lib/types';
  import type Dropzone from '$lib/components/Dropzone/index.svelte';

  const { getDropzone }: any = getContext('dropzone');
  const { open: open$editor, close: close$editor }: any = getContext('editor-modal');
  const { open: open$uploader, close: close$uploader }: any = getContext('default-modal');
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');
  const { setFab }: any = getContext('fab');
  const transitionParams = {
    delay: 0,
    duration: 200
  };
  const flyTransitionParams = { ...transitionParams, x: -80 };
  const sortAZ = (a: Video, b: Video) => {
    let _a, _b;
    a = (_a = a.title || a.src) && _a.toLowerCase();
    b = (_b = b.title || b.src) && _b.toLowerCase();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  let snackbar: Snackbar;
  let uploadedData: any;
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

  const openUploader = () => {
    let dropzone: Dropzone;
    let completed = true;
    open$uploader(
      MediaUploader,
      {
        layoutProps: { type: $_('text.videos') },
        type: 'video',
        options: {
          // acceptedFiles: '.mov .mp4 .m4a .m4v .3gp .3g2 .webm',
          uploadMultiple: true,
          parallelUploads: 1,
          maxFiles: 1,
          timeout: 3600 * 1000, // 60min
          maxFilesize: 1024 // Megabyte
        },
        events: {
          'upload:successmultiple': uploadSuccessHandler,
          'upload:complete': () => (completed = true)
        }
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
        onOpen: () => {
          dropzone = getDropzone();
        },
        beforeClose: () => {
          const queuedFiles = dropzone.getQueuedFiles();
          const uploadingFiles = dropzone.getUploadingFiles();
          if (queuedFiles.length || uploadingFiles.length) {
            const confirmed = confirm($_('text.files-in-upload-queue'));
            if (confirmed) {
              dropzone.removeAllFiles(true);
            }
            return confirmed;
          }
          return true;
        },
        onClosed: openEditor
      }
    );
  };

  function uploadSuccessHandler({ detail }: CustomEvent) {
    const { data, message, success }: any = detail.responseText;

    configSnackbar(message);
    snackbar?.forceOpen();

    if (success) {
      uploadedData = data;
      proxyEvent('video:add', { data });
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
  {#if $videos?.length}
    <ul
      bind:this={videoList}
      class="items-list grid lg:grid-cols-3 md:grid-cols-2 grid-flow-row gap-4"
    >
      {#each $videos.sort(sortAZ) as video (video.id)}
        <li class="list-item relative">
          <VideoCard
            on:video:posterCreated={(event) => posterCreatedHandler(event, video.id)}
            on:video:selectedPoster={(event) => posterSelectedHandler(event.detail, video.id)}
            on:video:removePoster={() => posterRemoveHandler(video.id)}
            {video}
          />
        </li>
      {/each}
    </ul>
  {:else}
    <FlexContainer maxHeight="300px">
      {$_('text.no-content-available')}
    </FlexContainer>
  {/if}
  <Paginator
    label={false}
    icon="rotate_right"
    {pagination}
    store={videos}
    id="videos-paginator"
    action="/videos?/more_videos"
  />
  {#if $fabs === 'add-video'}
    <Fab class="floating-fab" color="primary" on:click={() => openUploader()} extended>
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
  .items-list {
    padding: 15px;
    min-height: 200px;
    background-color: var(--background-100);
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
</style>
