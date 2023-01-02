<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { setContext, getContext, onMount } from 'svelte';
  import Layout from './layout.svelte';
  import List from '@smui/list';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import {
    Legal,
    PageBar,
    SimpleVideoCard,
    Component,
    Paginator,
    Header,
    FlexContainer
  } from '$lib/components';
  import { dynamicUrl, log } from '$lib/utils';
  import { session, videos } from '$lib/stores';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { _ } from 'svelte-i18n';

  /**
   * @type {import('./$types').LayoutData}
   */
  export let data;

  /**
   * @param {string} key
   * @param {string} val
   */
  async function searchBy(key, val) {
    return await api
      .get(`videos?${key}=${val}`, { token: $session.user?.jwt })
      .then((res) => res)
      .catch((reason) => log(reason));
  }

  setContext('search', {
    findBy: searchBy
  });

  const minSearchChars = 2;
  const { findBy } = getContext('search');

  /**
   * @type {number}
   */
  let selectedIndex;
  /**
   * @type {string}
   */
  let search = '';

  $: pagination = data.pagination?.videos;
  $: sidebar = !!$page.params.slug;
  $: selectionVideoId = $page.params.slug;
  $: isDeepSearch = search.length >= minSearchChars;
  $: if (isDeepSearch) {
    (async (s) => {
      const { success, data } = await findBy('title', s);
      if (success) videos.add(data);
    })(search);
  }
  $: filteredVideos =
    Array.isArray($videos) &&
    $videos
      .filter((video) => video.title?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
      .sortBy('title');
</script>

<Layout {sidebar}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div class="sidebar flex-1" slot="side">
    <Component transparent headerHeight="76px">
      <div slot="header">
        <Textfield class="search-for-item" bind:value={search} label={$_('text.search-video')}>
          <Icon
            role="button"
            class="material-icons-outlined cancel-search"
            slot="trailingIcon"
            on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
          >
          <span class="info-label"
            >{$_('text.type-min-char-count', { values: { count: minSearchChars } })}</span
          >
        </Textfield>
      </div>
      {#if filteredVideos.length}
        <List class="video-list mb-10" twoLine avatarList singleSelection bind:selectedIndex>
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
            store={videos}
            label={false}
            icon="rotate_right"
            id="videos-paginator"
            action="/videos?/more_videos"
          />
        </List>
      {:else}
        <FlexContainer style="height: 100%;">
          {$_('text.no-videos')}
        </FlexContainer>
      {/if}
    </Component>
  </div>
  <div slot="ad"><Legal /></div>
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0" />
    <div class="m-auto mr-0" />
  </div>
</Layout>
