<script>
  import './_button.scss';
  import './_menu-surface.scss';
  import { page } from '$app/stores';
  import { getContext, createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { currentVideo, images, session } from '$lib/stores';
  import { getMedia } from '$lib/utils/media';
  import { ADMIN, DateTimeFormatOptions, LOCALESTORE, proxyEvent, SUPERUSER } from '$lib/utils';
  import { VideoMedia, MediaUploader, Paginator } from '$lib/components';
  import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Menu from '@smui/menu';
  import MenuSurface, { Anchor } from '@smui/menu-surface';
  import ImageList, { Item as ImageListItem, ImageAspectContainer, Image } from '@smui/image-list';
  import List, { Item, Separator, Text } from '@smui/list';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { _, locale } from 'svelte-i18n';

  /** @type {import('$lib/types').Video} */
  export let video;
  export { className as class };
  export let key = 'default-modal';

  const { open, close } = getContext(key);
  const dispatch = createEventDispatcher();

  let className = '';
  /**
   * @type {Menu}
   */
  let cardMenu;
  /**
   * @type {Menu}
   */
  let deleteMenu;
  /**
   * @type {MenuSurface}
   */
  let imageList;
  /**
   * @type {HTMLDivElement}
   */
  let imageListAnchor;
  /**
   * @type {boolean}
   */
  let isEditMode = false;
  /**
   * @type {string}
   */
  let title;
  /**
   * @type {string}
   */
  let description;
  /**
   * @type {boolean}
   */
  let isImageListOpen = false;

  $: pagination = $page.data.pagination?.images;
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: leftButton = isEditMode
    ? { label: $_('text.save'), icon: 'save' }
    : { label: $_('text.edit'), icon: 'edit' };
  $: rightButton = isEditMode
    ? { label: $_('text.cancel'), icon: 'cancel' }
    : { label: $_('text.delete'), icon: 'delete' };
  $: matchingData = ('_matchingData' in video && video._matchingData.UsersVideos) || null;
  $: canSave = description !== video.description || title !== video.title;

  function save() {
    proxyEvent('video:save', {
      data: { id: video.id, title, description },
      show: true
    });
    isEditMode = false;
    return false;
  }

  function edit() {
    title = video.title || '';
    description = video.description || '';
    return true;
  }

  /**
   * @param {boolean} open
   */
  function setDeleteMenuOpen(open) {
    deleteMenu?.setOpen(open);
    return false;
  }

  function remove() {
    proxyEvent('video:delete', {
      data: { id: video.id },
      show: true
    });
  }

  function createPoster() {
    open(
      MediaUploader,
      {
        layoutProps: { type: $_('text.image') },
        type: 'image',
        options: {
          parallelUploads: 1,
          maxFiles: 1,
          maxFilesize: 1024
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
      }
    );
  }

  /**
   * @param {string} id
   */
  function getCachedImage(id) {
    let res = getMedia('IMAGE', id, $session.user?.jwt, {
      width: 100,
      height: 100,
      square: 1
    });
    return res;
  }

  /**
   * @param {CustomEvent} param0
   */
  function uploadSuccessHandler({ detail }) {
    dispatch('video:posterCreated', detail);
    close();
  }

  function imageListOpenedHandler() {
    isImageListOpen = true;
  }

  function imageListClosedHandler() {
    isImageListOpen = false;
  }

  function cardMenuOpenedHandler() {
    $currentVideo !== video && currentVideo.set(video);
  }
</script>

<Card class="card {className}">
  <PrimaryAction onclick={() => $currentVideo.set(video)}>
    <VideoMedia {video} bind:title bind:description {isEditMode} {emptyPoster} />
    <Content class="mdc-typography--body2">
      <div class="wrapper flex flex-row justify-between">
        <div class="flex flex-col" style="flex-basis: 50%; max-width: 50%">
          <div class="text-xs text-inherit inline-flex">
            <Icon class="material-icons">movie</Icon>
            <span class="ellipsed pl-2">{video.title || $_('text.no-title')}</span>
          </div>
          {#if hasPrivileges}
            <div class="text-xs text-inherit">
              <Icon class="material-icons">cloud_upload</Icon>
              <span class="ellipsed pl-2"
                >{$_('text.uploaded-on', {
                  values: {
                    date: new Date(video.created).toLocaleDateString(
                      LOCALESTORE.get($locale)?.fns?.code,
                      DateTimeFormatOptions
                    )
                  }
                })}</span
              >
            </div>
          {:else}
            <div class="flex text-xs text-inherit">
              <Icon class="material-icons">timer</Icon>
              <span class="ellipsed pl-2"
                >{@html $_('text.until-date', {
                  values: {
                    date:
                      (matchingData &&
                        new Date(matchingData.end).toLocaleDateString(
                          LOCALESTORE.get($locale)?.fns?.code,
                          DateTimeFormatOptions
                        )) ||
                      'date invalid'
                  }
                })}</span
              >
            </div>
          {/if}
        </div>
        <div class="flex justify-end" style="flex-basis: 50%; max-width: 50%">
          <IconButton
            href={`/videos/${video.id}`}
            color="primary"
            class="button-shaped-round unelevated small"
          >
            <i class="material-icons">smart_display</i>
          </IconButton>
        </div>
      </div>
    </Content>
  </PrimaryAction>
  {#if hasPrivileges}
    <Actions class="card-actions">
      <ActionButtons class="action-buttons">
        <Button
          color="primary"
          class="action-button"
          disabled={isEditMode && !canSave}
          on:click={() => (isEditMode = !isEditMode && edit()) || save()}
        >
          <Label>{leftButton.label}</Label>
          <Icon class="material-icons">{leftButton.icon}</Icon>
        </Button>
        <Button
          color="primary"
          class="action-button"
          on:click={() => (isEditMode = !isEditMode && setDeleteMenuOpen(true))}
        >
          <Label>{rightButton.label}</Label>
          <Icon class="material-icons">{rightButton.icon}</Icon>
        </Button>
        <ActionIcons style="position: relative; flex: 1 0 auto;">
          <IconButton
            class="material-icons"
            on:click={() => cardMenu?.setOpen(true)}
            toggle
            aria-label={$_('text.more-options')}
            title={$_('text.more-options')}>more_vert</IconButton
          >
          <Menu
            bind:this={cardMenu}
            on:MDCMenuSurface:opened={cardMenuOpenedHandler}
            anchorCorner="TOP_LEFT"
          >
            <List class="menu-list">
              <Item on:click={() => createPoster()}>
                <Text>{$_('text.new-poster')}</Text>
              </Item>
              <Item disabled={!$images.length} on:click={() => imageList?.setOpen(true)}>
                <Text>{$_('text.select-poster')}</Text>
              </Item>
              <Separator />
              <Item
                disabled={!video.image_id}
                on:SMUI:action={() => dispatch('video:removePoster', video.image_id)}
              >
                <Text>{$_('text.remove-poster')}</Text>
              </Item>
              <Item class="text-red-700" on:SMUI:action={() => remove()}>
                <Text>{$_('text.delete-video')}</Text>
              </Item>
            </List>
          </Menu>
          <Menu bind:this={deleteMenu}>
            <List>
              <Item class="text-red-700" on:SMUI:action={() => remove()}>
                <Text>{$_('text.delete-video')}</Text>
              </Item>
            </List>
          </Menu>
        </ActionIcons>
      </ActionButtons>
      <div use:Anchor bind:this={imageListAnchor} style="top: -320px; right: 250px;">
        <MenuSurface
          bind:this={imageList}
          bind:anchorElement={imageListAnchor}
          anchor={false}
          anchorCorner="TOP_RIGHT"
          on:MDCMenuSurface:opened={imageListOpenedHandler}
          on:MDCMenuSurface:closed={imageListClosedHandler}
        >
          <ImageList class="menu-surface-image-list">
            {#if isImageListOpen}
              {#each $images as image, i (image.id)}
                {#await getCachedImage(image.id) then src}
                  <ImageListItem>
                    <ImageAspectContainer>
                      <Image
                        class="preview-image"
                        on:click={() => dispatch('video:selectedPoster', image.id)}
                        {src}
                      />
                    </ImageAspectContainer>
                  </ImageListItem>
                {/await}
              {/each}
            {/if}
          </ImageList>
          <Paginator
            {pagination}
            store={images}
            action="/videos?/more_images"
            id="images-paginator"
            style="--fontSize: 0.6em;"
          />
        </MenuSurface>
      </div>
    </Actions>
  {/if}
</Card>

<style>
  :global(.preview-image) {
    cursor: pointer;
  }
  .ellipsed {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
