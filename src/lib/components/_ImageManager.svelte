<script lang="ts">
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Icon } from '@smui/fab';
  import { Label } from '@smui/common';
  import { ImageCard, MediaUploader, Info, Paginator, FlexContainer } from '$lib/components';
  import { fabs, videos, sitename, images, session } from '$lib/stores';
  import { _ } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';
  import type { Dropzone } from '.';
  import type { Image } from '$lib/types';

  let snackbar: Snackbar;
  let imagesList;

  const { getDropzone }: any = getContext('dropzone');
  const { open: open$uploader, close: close$uploader }: any = getContext('default-modal');
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');
  const { setFab }: any = getContext('fab');

  const openUploader = () => {
    let dropzone: Dropzone;
    open$uploader(
      MediaUploader,
      {
        layoutProps: { type: $_('text.video-poster') },
        type: 'image',
        options: {
          uploadMultiple: true,
          parallelUploads: 20,
          maxFiles: 20
        },
        events: {
          'upload:successmultiple': uploadSuccessHandler
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
        }
      }
    );
  };

  $: pagination = $page.data.pagination?.images;

  onMount(() => {
    snackbar = getSnackbar();
    setFab('add-image');
  });

  function uploadSuccessHandler({ detail }: CustomEvent) {
    const { data, message, success }: any = { ...detail.responseText };

    configSnackbar(message);
    snackbar?.forceOpen();

    if (success) {
      images.add(data);
    }
    close$uploader();
  }
  function isVideoPoster(image: Image) {
    return !!image.videos?.length;
  }
</script>

<svelte:head>
  <title>{$sitename} | Video Posters</title>
</svelte:head>

{#if $session.user}
  {#if $images.length}
    <ul bind:this={imagesList} class="items-list grid grid-cols-3 grid-flow-row gap-4 mb-10 mt-10">
      {#each $images as image (image.id)}
        <li class="list-item relative">
          <ImageCard {image} locked={isVideoPoster(image)} />
        </li>
      {/each}
    </ul>
  {:else}
    <FlexContainer maxHeight="300px">
      {$_('text.no-content-available')}
    </FlexContainer>
  {/if}
  <Paginator
    {pagination}
    store={images}
    id="images-paginator"
    action="/videos?/more_images"
    label={false}
    icon="rotate_right"
  />
  {#if $fabs === 'add-image'}
    <Fab class="floating-fab" color="primary" on:click={() => openUploader()} extended>
      <Label>{$_('text.new-poster')}</Label>
      <Icon class="material-icons">add</Icon>
    </Fab>
  {/if}
{:else}
  <div class="paper-container flex justify-center m-8">
    <Info title="Unauthorized" let:href>
      <a {href} on:click|preventDefault={() => goto(href)}>Login</a>
    </Info>
  </div>
{/if}

<style>
  :global(.dark) .items-list {
    padding: 15px;
    min-height: 200px;
    background-color: var(--background-100);
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
</style>
