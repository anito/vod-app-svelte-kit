<script lang="ts">
  import './_button.scss';
  import './_menu-surface.scss';
  import { page } from '$app/stores';
  import { getContext, createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { currentVideo, images, selection, session } from '$lib/stores';
  import { getMediaImage } from '$lib/utils/media';
  import {
    emit,
    ADMIN,
    SUPERUSER,
    LOCALESTORE,
    DEFAULT_LOCALE,
    DateTimeFormatOptions
  } from '$lib/utils';
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
  import type { Video, Image as ImageType } from '$lib/classes/repos/types';

  export let video: Video;
  export { className as class };
  export let key = 'default-modal';

  const { open, close }: any = getContext(key);
  const dispatch = createEventDispatcher();

  let className = '';
  let cardMenu: Menu;
  let deleteMenu: Menu;
  let imageList: MenuSurface;
  let imageListAnchor: HTMLDivElement;
  let menuAnchor: HTMLDivElement;
  let deleteMenuAnchor: HTMLDivElement;
  let isEditMode = false;
  let title: string;
  let description: string;
  let isImageListOpen = false;
  let imagesCopy: ImageType[] = [];

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
  $: selected = !!$selection.find((id: string) => id === video.id) || false;

  function save() {
    isEditMode = false;
    if (!canSave) return;
    emit('video:save', {
      data: { id: video.id, title, description },
      show: true
    });
  }

  function edit() {
    isEditMode = true;
    title = video.title || '';
    description = video.description || '';
  }

  function setDeleteMenuOpen(open: boolean) {
    isEditMode = false;
    deleteMenu?.setOpen(open);
  }

  function remove() {
    emit('media:delete', {
      id: video.id,
      type: 'videos',
      show: true,
      onsuccess: (res: any) => {}
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

  function getCachedImage(id: string) {
    const res = getMediaImage(id, $session.user?.jwt, {
      width: 100,
      height: 100,
      square: 1
    });
    return res;
  }

  function uploadSuccessHandler({ detail }: CustomEvent) {
    dispatch('video:postercreated', detail);
    close();
  }

  function imageListOpenedHandler() {
    copyImages();
    isImageListOpen = true;
  }

  function imageListClosedHandler() {
    isImageListOpen = false;
  }

  function cardMenuOpenedHandler() {
    $currentVideo !== video && currentVideo.set(video);
  }

  function cardClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    selected = !selected;
    selected ? selection.add(video.id) : selection.remove(video.id);
  }

  function copyImages() {
    imagesCopy = $images.slice();
  }
</script>

<Card class="card {className} primary" {selected} variant="raised">
  <PrimaryAction class="primary-action" onclick={() => currentVideo.set(video)}>
    <VideoMedia
      on:key:enter={() => save()}
      on:key:escape={() => (isEditMode = false)}
      bind:title
      bind:description
      {video}
      {isEditMode}
      {emptyPoster}
    />
    <Content class="card-content">
      <div class="wrapper flex flex-row justify-between">
        <div class="flex flex-col" style="flex-basis: 50%; max-width: 50%">
          <div class="text-xs text-inherit inline-flex">
            <Icon class="material-icons">movie</Icon>
            <span class="ellipsed pl-2">{video.title || $_('text.no-title')}</span>
          </div>
          {#if hasPrivileges}
            <div class="flex text-xs text-inherit ">
              <Icon class="material-icons">cloud_upload</Icon>
              <span class="ellipsed pl-2"
                >{$_('text.uploaded-on', {
                  values: {
                    date: new Date(video.created).toLocaleDateString(
                      LOCALESTORE.get($locale || DEFAULT_LOCALE)?.fns?.code,
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
                          LOCALESTORE.get($locale || DEFAULT_LOCALE)?.fns?.code,
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
            class="action-button button-shaped-round unelevated small"
          >
            <i class="material-icons">smart_display</i>
          </IconButton>
        </div>
      </div>
    </Content>
  </PrimaryAction>
  {#if hasPrivileges}
    <Actions class="card-actions">
      <ActionButtons class="action-buttons" style="flex: 1 0 auto;">
        <Button
          on:click={() => (isEditMode ? save() : edit())}
          class="action-button"
          color="primary"
          variant="unelevated"
          disabled={isEditMode && !canSave}
        >
          <Label>{leftButton.label}</Label>
          <Icon class="material-icons">{leftButton.icon}</Icon>
        </Button>
        <div bind:this={deleteMenuAnchor} use:Anchor>
          <Button
            on:click={() => (isEditMode ? (isEditMode = false) : setDeleteMenuOpen(true))}
            class="action-button"
            color="primary"
            variant="unelevated"
          >
            <Label>{rightButton.label}</Label>
            <Icon class="material-icons">{rightButton.icon}</Icon>
          </Button>
          <Menu
            bind:this={deleteMenu}
            bind:anchorElement={deleteMenuAnchor}
            anchor={false}
            anchorCorner="TOP_RIGHT"
          >
            <List>
              <Item ripple={false} class="error-on-background" on:SMUI:action={() => remove()}>
                <Text>{$_('text.delete-video')}</Text>
              </Item>
            </List>
          </Menu>
        </div>
        <ActionIcons>
          <div bind:this={menuAnchor} use:Anchor>
            <IconButton
              on:click={() => cardMenu?.setOpen(true)}
              class="material-icons"
              aria-label={$_('text.more-options')}
              title={$_('text.more-options')}>more_vert</IconButton
            >
            <Menu
              on:MDCMenuSurface:opened={cardMenuOpenedHandler}
              bind:this={cardMenu}
              bind:anchorElement={menuAnchor}
              anchor={false}
              anchorCorner="BOTTOM_LEFT"
              style="left: -112px;"
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
                  on:SMUI:action={() => dispatch('video:removeposter', video.image_id)}
                >
                  <Text>{$_('text.remove-poster')}</Text>
                </Item>
                <Item ripple={false} class="error-on-background" on:SMUI:action={() => remove()}>
                  <Text>{$_('text.delete-video')}</Text>
                </Item>
              </List>
            </Menu>
          </div>
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
              {#each imagesCopy as image, i (image.id)}
                {#await getCachedImage(image.id) then src}
                  <ImageListItem>
                    <ImageAspectContainer>
                      <Image
                        class="preview-image"
                        on:click={() => dispatch('video:saveposter', image.id)}
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
            indicator
            store={images}
            id="images-paginator"
            action="/videos?/more_images"
            type="label"
            style="--fontSize: 0.6em;"
            on:paginator:loaded={copyImages}
          />
        </MenuSurface>
      </div>
    </Actions>
  {/if}
</Card>
<div class="card-outer" on:click={cardClick} on:mousedown on:keydown />

<style lang="scss">
  :global(.preview-image) {
    cursor: pointer;
  }
  .ellipsed {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }
</style>
