<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Layout from './layout.svelte';
  import List from '@smui/list';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import { Legal, PageBar, SimpleVideoCard, Component, Paginator } from '$lib/components';
  import { dynamicUrl } from '$lib/utils';
  import { videos } from '$lib/stores';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import { _ } from 'svelte-i18n';

  /**
   * @type {import('./$types').LayoutData}
   */
  export let data;

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
  $: filteredVideos =
    Array.isArray($videos) &&
    $videos
      .filter?.((video) => video.title?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
      .sortBy('title');

  onMount(() => {});
</script>

<Layout {sidebar}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div class="sidebar flex-1" slot="side">
    <Component transparent>
      <div slot="header">
        <Textfield
          class="search"
          style="width: 100%;"
          variant="filled"
          bind:value={search}
          label={$_('text.search-video')}
        >
          <Icon
            role="button"
            class="material-icons-outlined cancel-search"
            slot="trailingIcon"
            on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
          >
        </Textfield>
      </div>
      <List class="video-list mb-10" twoLine avatarList singleSelection bind:selectedIndex>
        {#if filteredVideos.length}
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
        {:else}
          <li class="flex flex-1 flex-col self-center text-center">
            <div class="m-5">{$_('text.no-videos')}</div>
          </li>
        {/if}
      </List>
    </Component>
  </div>
  <div slot="ad"><Legal /></div>
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0" />
    <div class="m-auto mr-0" />
  </div>
</Layout>
