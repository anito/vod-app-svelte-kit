<script lang="ts">
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Icon } from '@smui/fab';
  import { Label } from '@smui/common';
  import { ImageCard, MediaUploader, Info, Paginator, FlexContainer } from '$lib/components';
  import { fabs, urls, sitename, images, session } from '$lib/stores';
  import { _ } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';

  const { open: open$uploader, close: close$uploader }: any = getContext('default-modal');
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');
  const { setFab }: any = getContext('fab');

  let snackbar: Snackbar;
  let imagesList;
  let openUploader = () => {
    open$uploader(
      MediaUploader,
      {
        layoutProps: { type: $_('text.video-poster') },
        type: 'image',
        options: {
          uploadMultiple: true,
          parallelUploads: 12,
          maxFiles: 12
        },
        events: { 'upload:successmultiple': uploadSuccessHandler }
      },
      {
        closeOnOuterClick: false,
        transitionWindow: fly,
        transitionWindowProps: {
          y: -200,
          duration: 500
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
    console.log(detail);
    const { data, message, success }: any = { ...detail.responseText };

    configSnackbar(message);
    snackbar?.forceOpen();

    if (success) {
      images.add(data);
    }

    close$uploader();
  }

  async function deletePoster(event: CustomEvent) {
    const { image }: any = { ...event.detail };
    const id = image.id;
    await api.del(`images/${image.id}`, { token: $session.user?.jwt }).then((res) => {
      let message = res.message || res.data.message || res.statusText;
      if (res?.success) {
        urls.del(id);
        images.del(id);
      }
      configSnackbar(message);
      snackbar?.forceOpen();
    });
  }
</script>

<svelte:head>
  <title>{$sitename} | Video Posters</title>
</svelte:head>

{#if $session.user}
  {#if $images.length}
    <ul bind:this={imagesList} class="items-list grid grid-cols-3 grid-flow-row gap-4 mb-10">
      {#each $images as image (image.id)}
        <li class="list-item">
          <ImageCard on:Image:delete={deletePoster} {image} />
        </li>
      {/each}
    </ul>
    <Paginator
      {pagination}
      store={images}
      id="images-paginator"
      action="/videos?/more_images"
      label={false}
      icon="rotate_right"
    />
  {:else}
    <FlexContainer>
      {$_('text.no-content-available')}
    </FlexContainer>
  {/if}
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
