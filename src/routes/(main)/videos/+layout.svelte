<script lang="ts">
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import Layout from './layout.svelte';
  import List from '@smui/list';
  import {
    Legal,
    PageBar,
    SimpleVideoCard,
    Container,
    Paginator,
    FlexContainer,
    SearchTextField
  } from '$lib/components';
  import { dynamicUrl, filterByModelKeys, proxyEvent } from '$lib/utils';
  import { videos } from '$lib/stores';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { _ } from 'svelte-i18n';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  const minSearchChars = 2;
  const { searchVideos }: any = getContext('search');
  const modelSearchKeys = 'title,id';

  let selectedIndex: any;
  let search = '';

  $: pagination = data.pagination?.videos;
  $: sidebar = !!$page.params.slug;
  $: selectionVideoId = $page.params.slug;
  $: isDeepSearch = search.length >= minSearchChars;
  $: if (isDeepSearch) {
    (async (s) => {
      const { success, data } = await searchVideos({ keys: modelSearchKeys, search: s });
      if (success) {
        proxyEvent('video:add', { data });
      }
    })(search);
  }
  $: filteredVideos = ((videos) => filterByModelKeys(search, videos, modelSearchKeys))($videos);
  $: filteredVideos.sortBy('title');
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
            />
          {/each}
          <Paginator
            {pagination}
            indicator
            store={videos}
            id="videos-paginator"
            action="/videos?/more_videos"
            type='label'
          />
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
