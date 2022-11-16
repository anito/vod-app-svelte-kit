<script>
  import { goto } from '$app/navigation';
  import { onMount, getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Fab, { Icon } from '@smui/fab';
  import { Label } from '@smui/common';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';
  import { Info, ImageCard, MediaUploader } from '$lib/components';
  import { Header } from '$lib/components';
  import { fabs, session, sitename, images, currentVideo } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  /** @type {import('./$types').PageData} */
  export let data;

  $: images.update(data.images);

  const { open } = getContext('default-modal');
  const { setFab } = getContext('fab');

  onMount(() => {
    if ($session.user) setFab('add-image');
  });

  /**
   * @param {any} type
   */
  let openUploader = (type) => {
    open(
      MediaUploader,
      {
        layoutProps: { fileType: $_('text.images') },
        type: 'image',
        options: {
          parallelUploads: 12,
          maxFiles: $currentVideo ? 1 : 12
        }
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
</script>

<svelte:head>
  <title>{$sitename} | Posters</title>
</svelte:head>

<Header h="2" mdc class="m-2 lg:m-5">Posters</Header>
<div class="lg:p-8">
  {#if $session.user}
    {#if $images.length}
      <div class="flex flex-wrap flex-row justify-center lg:justify-start">
        {#each $images as image (image.id)}
          <div class="flex m-1">
            <ImageCard {image} />
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex justify-center">
        <Paper color="primary">
          <Title style="color: var(--text-light)">No Images available</Title>
          <Content>
            <a href="/images" on:click|preventDefault={() => openUploader('image')}>Upload</a>
            some images to your content
          </Content>
        </Paper>
      </div>
    {/if}
  {:else}
    <div class="flex justify-center m-8">
      <Info title="Unauthorized" let:href>
        <a {href} on:click|preventDefault={() => goto(href)}>Login</a>
      </Info>
    </div>
  {/if}
</div>
{#if $fabs === 'add-image'}
  <Fab class="floating-fab" color="primary" on:click={() => openUploader('image')} extended>
    <Label>{$_('text.new-poster')}</Label>
    <Icon class="material-icons">add</Icon>
  </Fab>
{/if}

<style>
</style>
