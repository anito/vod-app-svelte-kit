<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import { selection, session, currentMediaStore, videos } from '$lib/stores';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Group, Label, Icon } from '@smui/button';
  import { emit, ADMIN, SUPERUSER, filterByModelKeys } from '$lib/utils';
  import {
    VideoManager,
    ImageManager,
    Container,
    Paginator,
    Heading,
    SearchTextField,
    SvgIcon
  } from '$lib/components';
  import { _ } from 'svelte-i18n';

  const TABS = ['videos', 'images'];

  let select: boolean;
  let confirmDeletionMediaDialog: Dialog;
  let search: string = '';

  const modelSearchKeys = 'id,title,description';
  const minSearchChars = 3;
  const { getNameByEndpoint }: any = getContext('media');
  const { searchVideos }: any = getContext('search');

  $: tab = ((tab) => TABS.find((itm) => itm === tab))($page.url.searchParams.get('tab')) || TABS[0];
  $: tab && resetCardSelect();
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: deleteLabel = $_('text.delete').concat($selection.length ? ` (${$selection.length})` : '');
  $: isDeepSearch = search.length >= minSearchChars;
  $: if (isDeepSearch) {
    (async (s) => {
      const { success, data } = await searchVideos({ keys: modelSearchKeys, search: s });
      if (success) {
        emit('video:add', { data });
      }
    })(search);
  }
  $: filteredVideos = ((videos) => filterByModelKeys(search, videos, modelSearchKeys))($videos);
  $: filteredVideos.sortBy('title');

  onMount(() => {
    resetCardSelect();
  });

  async function changeTab(tab: string) {
    await goto(`/videos?tab=${tab}`);
    return false;
  }

  function toggleCardSelect() {
    selection.reset();
    select = !select;
  }

  function resetCardSelect() {
    selection.reset();
    currentMediaStore.update(tab);
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | Video-Kurse</title>
</svelte:head>

{#if hasPrivileges}
  <div class:select class="media-grid {tab} flex-1 has-privileges" style="margin-top: 10px;">
    <div class="flex grid-item toolbar mt-2" style="justify-content: space-between;">
      <Group variant="unelevated">
        <Button
          class="focus:outline-none focus:shadow-outline"
          on:click={() => changeTab(TABS[0])}
          variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
        >
          <Icon class="material-icons">ondemand_video</Icon>
          <Label>Videos</Label>
        </Button>

        <Button
          class="focus:outline-none focus:shadow-outline"
          on:click={() => changeTab(TABS[1])}
          variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
        >
          <Icon class="material-icons">collections</Icon>
          <Label>{$_('text.posters')}</Label>
        </Button>
      </Group>
      {#if tab === TABS[0]}
        <SearchTextField
          style="width: 100%; margin: 0 20px;"
          height="60px"
          bind:search
          label={$_('text.search-videos')}
          infoLabel={$_('text.type-min-char-count', { values: { count: minSearchChars } })}
        />
      {/if}
      <Group variant="unelevated">
        <Button
          style="min-width: 150px;"
          class="focus:outline-none focus:shadow-outline"
          on:click={() => toggleCardSelect()}
          variant="unelevated"
        >
          <Icon class="material-icons">{select ? 'done' : 'select_all'}</Icon>
          <Label>{select ? $_('text.done') : $_('text.select')}</Label>
        </Button>
        <Button
          class="focus:outline-none focus:shadow-outline"
          disabled={!$selection.length}
          on:click={() => selection.reset()}
          variant="outlined"
        >
          <Icon class="material-icons" style="margin-right: 0;">deselect</Icon>
        </Button>
        <Button
          class="focus:outline-none focus:shadow-outline"
          disabled={!$selection.length}
          on:click={() => confirmDeletionMediaDialog?.setOpen(true)}
          variant="outlined"
        >
          <Icon class="material-icons" style="margin-right: 0;">delete</Icon>
          {#if $selection.length}
            <Label style="margin-left: 8px;">({$selection.length})</Label>
          {/if}
        </Button>
      </Group>
    </div>

    <div class="frame grid-item one">
      {#if tab === TABS[0]}
        <VideoManager videos={filteredVideos} />
        {#if search === ''}
          <Paginator
            pagination={$page.data.pagination?.videos}
            indicator
            store={videos}
            id="videos-paginator"
            action="/videos?/more_videos"
            type="label"
          />
        {/if}
      {/if}
      {#if tab === TABS[1]}
        <ImageManager />
      {/if}
    </div>
  </div>
{:else}
  <Container density="sm" class="flex">
    <div slot="header">
      <div class="grid grid-cols-2">
        <span class="ml-2">
          <Heading h="6" mdc style="text-transform: capitalize;"
            >{$_('text.videos-library')}</Heading
          >
        </span>
        <span class="justify-self-end mr-2">
          <Heading h="5" mdc>
            {@html $session.user?.name || ''}
          </Heading>
        </span>
      </div>
    </div>
    <div class="flex flex-1">
      <div class="grid-inner">
        <div class="media-grid non-admin">
          <div class="grid-item pl-8 pt-3 flex items-center">
            <span class="pr-3"><SvgIcon name="ondemand_video" /></span>
            <span>
              <Heading
                h="5"
                mdc
                wrapperStyle="
              color: currentColor; padding: 10px 10px 10px 0;"
                >{@html $_('text.your-booked-videos')}</Heading
              >
            </span>
            <SearchTextField
              style="width: 100%; margin-left: 20px;"
              height="60px"
              bind:search
              label={$_('text.search-videos')}
              infoLabel={$_('text.type-to-search')}
            />
          </div>
          <div class="frame grid-item one">
            <VideoManager videos={filteredVideos} />
          </div>
        </div>
      </div>
    </div></Container
  >
{/if}
<Dialog
  bind:this={confirmDeletionMediaDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={({ detail }) => {
    if (detail.action === 'accept') {
      emit('media:deleteMany', {
        endpoint: tab,
        show: true,
        oncompleted: () => selection.reset()
      });
    }
  }}
>
  <Title id="info-title"
    >{$_('text.deleting-media', {
      values: { count: $selection.length, type: getNameByEndpoint(tab) }
    })}</Title
  >
  <Content>
    <div class="">{$_('text.confirm-deletion', { values: { type: getNameByEndpoint(tab) } })}</div>
  </Content>
  <Actions>
    <Button>
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="accept" variant="unelevated">
      <Label>{$_('text.delete')}</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .media-grid:not(.has-privileges),
  .media-grid:not(.has-privileges) ::after,
  .media-grid:not(.has-privileges) ::before {
    --page-w: 80vw;
  }
  .media-grid {
    --toolbar: calc(var(--toolbar-h) * 1.2);
    display: grid;
    grid-template-rows: 110px auto;
    grid-template-columns: 1fr;
    grid-gap: 0;
    align-items: initial;
    grid-template-areas:
      'toolbar'
      'one';
    max-width: var(--page-w);
    width: var(--page-w);
  }
  .grid-item {
    background: var(--background-intense);
  }
  .toolbar {
    grid-area: toolbar;
    display: flex;
    align-items: center;
  }
  .non-admin .toolbar {
    align-items: flex-end;
  }
  .one {
    grid-area: one;
    overflow: auto;
  }
  .frame::before {
    --scale-x: 1.15;
    --translate-x: calc(10% / 2 - 10% / 2);
    content: '';
    height: 1px;
    background: rgb(255, 255, 255);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgb(167 167 167 / 44%) 13%,
      rgb(167 167 167 / 44%) 88%,
      rgba(255, 255, 255, 0) 100%
    );
    display: block;
    position: absolute;
    width: var(--page-w);
    z-index: 1;
    transform: scaleX(var(--scale-x)) translateX(var(--translate-x));
  }
</style>
