<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { session, sitename } from '$lib/stores';
  import { ADMIN, SUPERUSER } from '$lib/utils';
  import Button, { Group, Label, Icon } from '@smui/button';
  import { VideoManager, ImageManager, Container } from '$lib/components';
  import { Header } from '$lib/components';
  import { _ } from 'svelte-i18n';

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
    <div class="grid-item toolbar mt-2">
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

    <div class="frame grid-item one">
      {#if tab === TABS[0]}
        <VideoManager />
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
          <div class="grid-item toolbar pl-8">
            <Header
              h="5"
              mdc
              wrapperStyle="
            padding: 10px 10px 0;">{@html $_('text.your-videos')}</Header
            >
          </div>
          <div class="frame grid-item one">
            <VideoManager />
          </div>
        </div>
      </div>
    </div></Container
  >
{/if}

<style>
  .media-grid:not(.has-privileges),
  .media-grid:not(.has-privileges) ::after,
  .media-grid:not(.has-privileges) ::before {
    --page-w: 80vw;
  }
  .media-grid {
    --toolbar: calc(var(--toolbar-h) * 1.2);
    display: grid;
    grid-template-rows: 80px auto;
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
    height: 100%;
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
