<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Icon } from '@smui/fab';
  import { Label } from '@smui/common';
  import { ImageCard, MediaUploader, Info, Paginator } from '$lib/components';
  import { fabs, urls, sitename, images, session } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  const { open: open$uploader, close: close$uploader } = getContext('default-modal');
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const { setFab } = getContext('fab');

  /**
   * @type {import("@smui/snackbar")}
   */
  let snackbar;
  let pagination = $page.data.pagination.images;
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

  onMount(() => {
    snackbar = getSnackbar();
    setFab('add-image');
  });

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
      images.add(data);
    }

    close$uploader();
  }

  /**
   *
   * @param {CustomEvent} event
   */
  async function deletePoster(event) {
    /** @type {any} */
    const { image } = { ...event.detail };
    const id = image.id;
    await api.del(`images/${image.id}`, { token: $session.user?.jwt }).then((res) => {
      let message = res.message || res.data.message || res.statusText;
      if (res?.success) {
        urls.del(id);
        images.del(id);
      }
      configSnackbar(message);
      snackbar?.open();
    });
  }
</script>

<svelte:head>
  <title>{$sitename} | Video Posters</title>
</svelte:head>

{#if $session.user}
  {#if $images.length}
    <div class="grid grid-cols-3 grid-flow-row gap-4 mb-24">
      {#each $images as image (image.id)}
        <ImageCard on:Image:delete={deletePoster} {image} />
      {/each}
      <Paginator
        style="position: fixed; left: 30%; right: 30%; bottom: 70px; margin: 0 auto;"
        bind:pagination
        store={images}
        id="images-paginator"
        action="/videos?/more_images"
      />
    </div>
  {:else}
    <div class="empty-selection no-user-selection">
      <span style="text-align: center;">{$_('text.no-content-available')}</span>
    </div>
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
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
</style>
