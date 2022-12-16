<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
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
  /**
   * @type {HTMLUListElement}
   */
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

  async function handlePaginatorAdded() {
    const options = { block: 'nearest', behavior: 'smooth' };
    await tick();
    const count = imagesList.childElementCount;
    const last = imagesList.querySelector(`li.list-item:nth-child(${count - 1})`); // :last-child fails for some reason
    // @ts-ignore
    last?.scrollIntoView(options);
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
      on:paginator:loaded={handlePaginatorAdded}
      {pagination}
      store={images}
      id="images-paginator"
      action="/videos?/more_images"
    />
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
  .items-list {
    padding: 15px;
    background-color: var(--background);
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
</style>
