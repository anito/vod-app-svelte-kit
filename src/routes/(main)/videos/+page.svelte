<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { session, sitename } from '$lib/stores';
  import { ADMIN, SUPERUSER } from '$lib/utils';
  import Button, { Group, Label, Icon } from '@smui/button';
  import { VideoManager, ImageManager, Component } from '$lib/components';
  import { Header } from '$lib/components';
  import { _ } from 'svelte-i18n';

  /**
   * @type {import('./$types').PageData}
   */
  export let data;

  const TABS = ['videos', 'images'];

  $: tab = ((tab) => TABS.find((itm) => itm === tab))($page.url.searchParams.get('tab')) || TABS[0];
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;

  onMount(() => {});

  /**
   * @param {string} tab
   */
  async function changeTab(tab) {
    await goto(`/videos?tab=${tab}`);
    return false;
  }
</script>

<svelte:head>
  <title>{$sitename} | Video-Kurse</title>
</svelte:head>

{#if hasPrivileges}
  <div class="media-grid {tab} flex-1 has-privileges" style="margin-top: 10px;">
    <div class="grid-item one mt-2">
      <Group variant="unelevated">
        <Button
          class="focus:outline-none focus:shadow-outline"
          on:click={() => changeTab(TABS[0])}
          variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
        >
          <Icon class="material-icons">video_settings</Icon>
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
    </div>

    <div class="frame grid-item two">
      {#if tab === TABS[0]}
        <VideoManager />
      {/if}
      {#if tab === TABS[1]}
        <ImageManager />
      {/if}
    </div>
  </div>
{:else}
  <Component variant="sm" class="flex">
    <div slot="header">
      <div class="grid grid-cols-2">
        <span class="ml-2">
          <Header h="6" mdc>{$_('text.your-classes')}</Header>
        </span>
        <span class="justify-self-end mr-2">
          <Header h="5" mdc>
            {@html $session.user?.name || ''}
          </Header>
        </span>
      </div>
    </div>
    <div class="flex flex-1">
      <div class="grid-inner">
        <div class="media-grid non-admin">
          <div class="grid-item one pl-8">
            <Header
              h="5"
              mdc
              wrapperStyle="
            padding: 10px 10px 0;
            --border-color: #d7d7d7;
            border-left: 1px solid var(--border-color);
            border-top: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            background: #f4f4f4;
            box-shadow: 0px 0px 15.7px rgb(202 202 202 / 44%);"
              >{@html $_('text.your-videos')}</Header
            >
          </div>
          <div class="frame grid-item two">
            <VideoManager />
          </div>
        </div>
      </div>
    </div>
  </Component>
{/if}

<style>
  .media-grid:not(.has-privileges) ::after,
  .media-grid:not(.has-privileges) ::before,
  .media-grid:not(.has-privileges) {
    --page-w: 100vw;
  }
  .media-grid {
    --toolbar: calc(var(--toolbar-h) * 1.2);
    display: grid;
    grid-template-rows: 80px auto;
    grid-template-columns: 1fr;
    grid-gap: 0;
    align-items: initial;
    grid-template-areas:
      'one'
      'two';
    max-width: var(--page-w);
    width: var(--page-w);
    overflow: hidden;
  }
  .grid-item {
    background: var(--back-grid-item);
  }
  .one {
    grid-area: one;
    display: flex;
    align-items: center;
    height: 100%;
  }
  .non-admin .one {
    grid-area: one;
    display: flex;
    align-items: flex-end;
  }
  .two {
    grid-area: two;
    overflow: auto;
  }
  .frame::before {
    --scale-x: 1;
    --translate-x: 0;
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
  .has-privileges .frame::before {
    --scale-x: 1.15;
    --translate-x: calc(10% / 2 - 10% / 2);
  }
</style>
