<script lang="ts">
  import '$lib/components/_icon-button.scss';
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Layout from './layout.svelte';
  import List from '@smui/list';
  import {
    Legal,
    PageBar,
    SimpleVideoCard,
    Container,
    Paginator,
    FlexContainer,
    SearchTextField,
    VideoEditorList
  } from '$lib/components';
  import { dynamicUrl, filterByModelKeys, emit, ADMIN, SUPERUSER } from '$lib/utils';
  import { session, videos } from '$lib/stores';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { _ } from 'svelte-i18n';
  import type { LayoutData } from './$types';
  import IconButton, { Icon } from '@smui/icon-button';

  export let data: LayoutData;

  const minSearchChars = 3;
  const modelSearchKeys = 'id,title,description';
  const { searchVideos }: any = getContext('search');
  const { open }: any = getContext('editor-modal');

  let selectedIndex: any;
  let search = '';

  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: pagination = data.pagination?.videos;
  $: sidebar = !!$page.params.slug;
  $: selectionVideoId = $page.params.slug;
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

  function openEditor(id: string) {
    open(VideoEditorList, {
      props: {
        data: [{ id }]
      },
      options: {
        transitionWindow: fly,
        transitionWindowProps: {
          y: -200,
          duration: 500
        }
      }
    });
  }
</script>

<Layout {sidebar}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div class="sidebar flex-1" slot="side">
    <Container transparent headerHeight="76px">
      <div slot="header">
        <SearchTextField
          bind:search
          label={$_('text.search-videos')}
          infoLabel={$_('text.type-min-char-count', { values: { count: minSearchChars } })}
        />
      </div>
      {#if filteredVideos.length}
        <List class="video-list" twoLine avatarList singleSelection bind:selectedIndex>
          {#each filteredVideos as video (video.id)}
            <SimpleVideoCard
              class="video"
              selected={selectionVideoId === video.id}
              {emptyPoster}
              anchorFn={dynamicUrl}
              {video}
            >
              {#if hasPrivileges}<IconButton class="small" on:click={() => openEditor(video.id)}>
                  <Icon class="material-icons">edit</Icon>
                </IconButton>{/if}</SimpleVideoCard
            >
          {/each}
          {#if !search}
            <Paginator
              {pagination}
              indicator
              store={videos}
              id="videos-paginator"
              action="/videos?/more_videos"
              type="label"
            />
          {/if}
        </List>
      {:else}
        <FlexContainer style="height: 100%;">
          {$_('text.no-videos')}
        </FlexContainer>
      {/if}
    </Container>
  </div>
  <div slot="ad"><Legal /></div>
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0" />
    <div class="m-auto mr-0" />
  </div>
</Layout>
