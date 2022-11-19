<script>
  // @ts-nocheck

  import * as api from '$lib/api';
  import './_icon-button.scss';
  import './_date-range-picker.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { createRedirectSlug, ADMIN, SUPERUSER, log } from '$lib/utils';
  import List, { Item, Graphic, Separator, Text } from '@smui/list';
  import Button, { Label, Icon as ButtonIcon } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import { flash, infos, session, users, videos, videosAll } from '$lib/stores';
  import {
    SimpleVideoCard,
    DateRangePicker,
    Header,
    Component,
    VideoEditorList
  } from '$lib/components';
  import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfYear,
    endOfYear,
    addYears,
    subYears,
    parseISO
  } from 'date-fns';
  import * as locales from 'date-fns/locale/index.js';
  import { toISODate, proxyEvent, sortByEndDate, sortByTitle } from '$lib/utils';
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
  import Radio from '@smui/radio';
  import { _, locale } from 'svelte-i18n';

  /** @type {import('$lib/types').User} */
  export let user;
  /** @type {string} */
  export let selectionUserId;

  const isUnmanagableNoneUserList = false;
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const { open, close } = getContext('editor-modal');
  const { setFab } = getContext('fab');
  const timespanSelections = [
    { title: 'text.1-month', value: 30 },
    { title: 'text.2-months', value: 60 },
    { title: 'text.3-months', value: 90 },
    { title: 'text.custom', value: 'custom' }
  ];
  const lists = new Set();
  const USERVIDEOSLIST = 'user-video-list';
  const NONUSERVIDEOSLIST = 'non-user-videos-list';

  /** @type {Element} */
  let root;
  /** @type {string} */
  let schedulingVideoId;
  let scheduleDialog;
  let removeDialog;
  let timespanSelection = timespanSelections[0].value;
  let timespanSelected;
  let firstDayOfWeek = 'monday';
  /** @type {import("@smui/snackbar").SnackbarComponentDev} */
  let snackbar;
  let message;
  /** @type {string} */
  let selectedIndex;
  /** @type {string} */
  let selectedNoneUserIndex;
  /** @type {string} */
  let selectionVideoId;
  /** @type {import('$lib/types').Video} */
  let selectedVideo;
  let readout;
  let schedulingVideo = '';
  let expires;
  let isExpired;
  let itemsList = {};

  $: dateFormat = $locale.startsWith('de') ? 'dd. MMM yyyy' : 'yyyy-MM-dd';
  $: (() => (selectionVideoId = null))(selectionUserId);
  $: currentUser = $users.find((usr) => usr.id === selectionUserId);
  $: name = currentUser?.name || '';
  $: role = currentUser?.role;
  $: jwt = currentUser?.jwt;
  $: active = currentUser?.active;
  $: joinData =
    (selectedVideo = currentUser?.videos?.find((v) => v.id === selectionVideoId)) &&
    selectedVideo._joinData;
  $: startDate = (joinData && joinData.start && parseISO(joinData.start)) || endOfWeek(new Date(0));
  $: endDate = (joinData && joinData.end && parseISO(joinData.end)) || endOfWeek(new Date(0));
  $: expires = currentUser?.expires;
  $: isExpired = (expires && expires * 1000 < +new Date().getTime()) || false;
  $: isDatapickerOpen = ((id) => {
    if (!root) return;
    !id && root.classList.remove('datapicker--open');
    return root.classList.contains('datapicker--open');
  })(selectionVideoId);
  $: schedulingVideo =
    schedulingVideoId && $videos?.find((video) => video.id === schedulingVideoId);
  $: schedulingVideoTitle = (schedulingVideo && schedulingVideo.title) || '';
  $: localeObject = ((l) => locales[l.slice(0, 2)])($locale);
  $: userIssues =
    ($infos?.has(selectionUserId) &&
      $infos.get(selectionUserId).params.filter((info) => info.type === 'issue')) ||
    [];
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: hasCurrentPrivileges = role === ADMIN || role === SUPERUSER;
  $: displayedVideos = hasPrivileges
    ? currentUser?.videos.sort(sortByEndDate) || []
    : currentUser?.videos
        .filter((v) => {
          return (
            new Date(v._joinData.start) <= new Date() && new Date(v._joinData.end) >= new Date()
          );
        })
        .sort(sortByEndDate) || [];
  $: userVideos =
    displayedVideos.map((video) => {
      const _video = $videos.find((vid) => vid.id === video.id);
      if (_video) {
        const { image_id, title } = _video;
        return { ...video, image_id, title };
      } else {
        return { ...video };
      }
    }) || [];
  $: noneUserVideos = hasPrivileges
    ? $videos.sort(sortByTitle)
    : $videosAll
        .filter(
          (v) =>
            !userVideos?.find((uv) => {
              return (
                v.id === uv.id && (!uv._joinData.end || new Date(uv._joinData.end) > new Date())
              );
            })
        )
        .sort(sortByTitle);

  onMount(() => {
    root = document.documentElement;
    root.classList.add('timemanager--open');

    snackbar = getSnackbar();

    if (hasPrivileges) {
      setFab('add-video');
    } else {
      setFab();
    }

    return () => root.classList.remove('timemanager--open', 'datapicker--open');
  });

  function openScheduleDialog(video) {
    schedulingVideoId = video.id;
    scheduleDialog.setOpen(true);
  }

  function openRemoveDialog(e, video) {
    e.stopPropagation();
    schedulingVideoId = video.id;
    if (timeRemaining(video)) {
      removeDialog.setOpen(true);
    } else {
      removeVideo();
    }
  }

  async function removeDialogCloseHandler(e) {
    if (e.detail.action === 'approved') {
      removeVideo();
    }
    schedulingVideoId = null;
  }

  async function scheduleDialogCloseHandler(e) {
    if (e.detail.action === 'accept') {
      let start = null;
      let end = null;

      timespanSelected = timespanSelection;
      if (timespanSelected !== 'custom') {
        let now = new Date();
        let time = new Date(now.getTime() + timespanSelected * 24 * 60 * 60 * 1000);
        start = toISODate(now);
        end = toISODate(time, true);
      }
      saveTime(schedulingVideoId, start, end);
      timespanSelection = timespanSelections[0].value;
      schedulingVideoId = null;
    }
  }

  function itemSelectedHandler({ detail }) {
    const { video } = detail;
    selectionVideoId = video.id;
    scrollIntoView();
  }

  function onApplyHandler({ detail }) {
    const { startDate, endDate } = { ...detail };

    let isoStart = toISODate(startDate);
    let isoEnd = toISODate(endDate);

    saveTime(selectionVideoId, isoStart, isoEnd);
  }

  async function saveTime(id, start, end) {
    const associated = userVideos.filter((v) => v.id != id).map((v) => ({ id: v.id }));
    const currentVideo = userVideos.find((v) => v.id == id);
    const joinData = currentVideo?._joinData || {};

    const data = {
      videos: [
        {
          id,
          _joinData: { ...joinData, start, end }
        },
        ...associated
      ]
    };

    await saveUser(data).then((res) => {
      let idx;

      if (res?.success) {
        handleSuccess(res, $_('text.time-slot-updated'));
        setTimeout(() => {
          idx = userVideos.findIndex((v) => v.id == selectionVideoId);
          idx !== -1 && itemsList[USERVIDEOSLIST].focusItemAtIndex(idx);
        }, 500);
      } else {
        startDate = startDate;
        handleError(res);
      }
    });
  }

  function timeRemaining(video) {
    if (!video._joinData?.end) return 0;
    let end = new Date(video._joinData.end).toISOString();
    let now = new Date().toISOString();
    return Math.max(0, new Date(end) - new Date(now));
  }

  async function removeVideo() {
    const idx = userVideos.findIndex((itm) => itm.id === schedulingVideoId);
    const _userVideos = [...userVideos.slice(0, idx), ...userVideos.slice(idx + 1)];
    const ids = _userVideos.map((v) => v.id);

    const data = { videos: { _ids: [...ids] } };
    const res = await saveUser(data);

    if (res?.success) {
      selectionVideoId === schedulingVideoId && (selectionVideoId = null);
      handleSuccess(res, $_('text.video-removed'));
    } else {
      handleError(res);
    }
  }

  function saveUser(data) {
    return api.put(`users/${selectionUserId}?locale=${$locale}`, {
      data,
      token: $session.user?.jwt
    });
  }

  function handleSuccess(res, msg) {
    snackbar.isOpen() && snackbar.close();
    users.put(res.data);

    message = msg || res.message || res.data.message;
    configSnackbar(message);
    snackbar?.open();
  }

  function handleError(res) {
    snackbar.isOpen() && snackbar.close();

    message = res?.message || res?.data?.message || res?.statusText;
    const code = res.data?.code || res.status;

    if (400 <= code && code < 500) {
      configSnackbar(message);
      snackbar.open();
    } else {
      flash.update({ type: 'error', message });
      const url = `login?${createRedirectSlug($page.url)}`;
      configSnackbar(message, url);
      snackbar.open();
    }
  }

  function onDateRangeSelected(e) {}

  function toggleDataPicker(id, open) {
    selectionVideoId = id && root.classList.toggle('datapicker--open', open);
  }

  function receiveListMethods({ focusItemAtIndex, items, listName }) {
    lists.add(listName);
    itemsList[listName] = { items, focusItemAtIndex };
  }

  function editVideo(video) {
    open(
      VideoEditorList,
      {
        data: [video],
        user
      },
      {
        closeOnOuterClick: false
      }
    );
  }

  function scrollIntoView() {
    const options = { block: 'nearest', behavior: 'smooth' };
    setTimeout(() => {
      lists.forEach((name) => {
        let item = itemsList[name].items.find((item) => item.selected);
        item?.element.scrollIntoView(options);
      });
    }, 100);
  }
</script>

<div class="main-grid">
  <div
    class="grid-item user-videos"
    class:no-user-selected={!currentUser}
    class:no-videos={!userVideos.length || hasCurrentPrivileges}
  >
    <Component variant="sm">
      <div slot="header">
        <Header mdc h="5" class="xxx">
          <div class="flex">
            {#if currentUser}
              <span class="header-name pr-5">{name}</span>
              <span class="uppercase flex-auto text-right" style="font-weight: 400;"
                >| {$_('text.booked-classes')}</span
              >
            {/if}
          </div>
        </Header>
      </div>
      {#if currentUser}
        <List
          class="video-list mb-24"
          threeLine
          avatarList
          singleSelection
          bind:selectedIndex
          on:SMUIList:mount={(e) => receiveListMethods({ ...e.detail, listName: USERVIDEOSLIST })}
        >
          {#if !hasCurrentPrivileges}
            {#if userVideos.length}
              {#each userVideos as video (video.id)}
                <SimpleVideoCard
                  isUserVideo
                  threeLine
                  class="user-video video-list-item"
                  on:datapicker={(e) =>
                    toggleDataPicker(
                      e.detail.id,
                      selectionVideoId != e.detail.id ||
                        !root.classList.contains('datapicker--open')
                    )}
                  on:itemSelected={itemSelectedHandler}
                  selected={selectionVideoId === video.id}
                  emptyPoster="/empty-poster.jpg"
                  {video}
                  {selectionUserId}
                >
                  <IconButton
                    class="self-center mr-2"
                    color="primary"
                    on:click={async () => await goto(`/videos/${video.id}`)}
                  >
                    <Icon class="material-icons">smart_display</Icon>
                  </IconButton>
                  {#if hasPrivileges}
                    <Button
                      class="close-action-button button-shaped-round flex self-center"
                      variant="unelevated"
                      on:click={() =>
                        toggleDataPicker(
                          video.id,
                          selectionVideoId != video.id ||
                            !root.classList.contains('datapicker--open')
                        )}
                    >
                      <Icon class="material-icons">
                        {isDatapickerOpen && selectionVideoId == video.id
                          ? 'close'
                          : 'insert_invitation'}
                      </Icon>
                      <Label>{$_('text.scheduler')}</Label>
                    </Button>
                    <IconButton
                      class="delete-action-button delete ml-2"
                      on:click={(e) => openRemoveDialog(e, video)}
                    >
                      <Icon class="material-icons">remove_circle</Icon>
                    </IconButton>
                  {/if}
                </SimpleVideoCard>
              {/each}
            {:else}
              <div class="flex flex-1 flex-col self-center text-center">
                <div class="m-5">
                  {@html $_('text.user-has-no-videos', {
                    values: { name: name }
                  })}
                </div>
              </div>
            {/if}
          {:else}
            <div class="flex flex-1 flex-col self-center text-center">
              <div class="m-5">
                {@html $_('text.full-access-user', {
                  values: { role, name }
                })}
              </div>
            </div>
          {/if}
        </List>
      {:else}
        <div class="flex-1 flex-col">
          <span class="empty-selection no-user-selection">{$_('text.empty-user-selection')}</span>
        </div>
      {/if}
    </Component>
  </div>
  {#if !isDatapickerOpen}
    <div class="grid-item videos" class:no-videos={!noneUserVideos.length}>
      <Component variant="sm">
        <div slot="header">
          <Header mdc h="5">
            <div class="uppercase" style="font-weight: 400; text-align: right;">
              {$_('text.more-classes')}
            </div></Header
          >
        </div>
        <List
          class="video-list mb-24"
          on:SMUIList:mount={(e) =>
            receiveListMethods({ ...e.detail, listName: NONUSERVIDEOSLIST })}
          twoLine
          avatarList
          singleSelection
          bind:selectedIndex={selectedNoneUserIndex}
        >
          {#if noneUserVideos.length}
            {#each noneUserVideos as video (video.id)}
              <SimpleVideoCard
                on:itemSelected={itemSelectedHandler}
                let:unmanagable
                class="video"
                disabled={(hasCurrentPrivileges || hasPrivileges) && isUnmanagableNoneUserList}
                selected={selectionVideoId === video.id}
                emptyPoster="/empty-poster.jpg"
                {video}
                {selectionUserId}
              >
                {#if hasPrivileges}
                  <IconButton
                    class="self-center mr-2"
                    color="primary"
                    style=""
                    on:click={() => editVideo(video)}
                  >
                    <Icon class="material-icons">edit</Icon>
                  </IconButton>
                  <IconButton
                    class="self-center mr-2"
                    color="primary"
                    style=""
                    on:click={async () => await goto(`/videos/${video.id}`)}
                  >
                    <Icon class="material-icons">smart_display</Icon>
                  </IconButton>
                  <IconButton
                    disabled={hasCurrentPrivileges || unmanagable || video.teaser}
                    class="add-action-button add primary"
                    on:click={() => openScheduleDialog(video)}
                  >
                    <Icon class="material-icons">add_circle</Icon>
                  </IconButton>
                {/if}
              </SimpleVideoCard>
            {/each}
          {:else}
            <li class="flex flex-1 flex-col self-center text-center">
              <div class="m-5">{$_('text.no-videos-available')}</div>
            </li>
          {/if}
        </List>
      </Component>
    </div>
  {:else}
    <div class="grid-item time">
      <Component variant="sm">
        <div slot="header">
          <div class="">
            <Header mdc h="5">{readout}</Header>
            <button
              on:click={() => toggleDataPicker(selectionVideoId, false)}
              class="button-close"
              variant="unelevated"
            >
              <Icon class="material-icons" style="vertical-align: middle;">close</Icon>
            </button>
          </div>
        </div>
        <DateRangePicker
          on:apply={onApplyHandler}
          on:selection={onDateRangeSelected}
          bind:readout
          {firstDayOfWeek}
          {startDate}
          {endDate}
          minDate={subYears(startOfYear(new Date()), 2)}
          maxDate={addYears(endOfYear(new Date()), 2)}
          {dateFormat}
          {localeObject}
          customHeaderHeight
          class="sm-header"
          disabled={!selectionVideoId}
          resetTrigger={selectionVideoId}
          monthDropdown={true}
          weekGuides
          weekNumbers
          todayBtn
          twoPages
          resetViewBtn
          timePicker
          timePickerSeconds
          timePickerControls
          todayBtnText={$_('text.today')}
          cancelBtnText={$_('text.reset')}
          applyBtnText={$_('text.apply')}
          actionBtnClass="picker-btn mdc-button mdc-ripple-upgraded mdc-button--unelevated"
        />
      </Component>
    </div>
  {/if}
</div>
<Dialog
  bind:this={scheduleDialog}
  aria-labelledby="list-selection-title"
  aria-describedby="list-selection-content"
  on:SMUIDialog:closed={scheduleDialogCloseHandler}
>
  <Title id="list-selection-title">{$_('text.select-time-slot')}</Title>
  <Content id="list-selection-content">
    <List radioList>
      {#each timespanSelections as timespan, i}
        <Item use={(i === 0 && [InitialFocus]) || []}>
          <Graphic>
            <Radio bind:group={timespanSelection} value={timespan.value} />
          </Graphic>
          <Text>{$_(timespan.title)}</Text>
        </Item>
      {/each}
      {#if !jwt || isExpired || !active}
        <div class="mt-3">
          <Icon class="material-icons leading">warning</Icon>
          <p>
            {$_('text.account-inactive')}
          </p>
          <div class="reasons">
            {#each userIssues as issue}
              <Button
                variant="raised"
                on:click={() => proxyEvent(issue.eventType, { silent: true })}
              >
                <Label>{$_(issue.label)}</Label>
              </Button>
            {/each}
          </div>
        </div>
      {/if}
    </List>
  </Content>
  <Actions>
    <Button>
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="accept" variant="unelevated">
      <Label>Ok</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={removeDialog}
  aria-labelledby="event-title"
  aria-describedby="event-content"
  on:SMUIDialog:closed={removeDialogCloseHandler}
>
  <Title id="event-title">
    {$_('text.video-is-active')}
  </Title>
  <Content id="event-content">
    <p>
      {@html $_('messages.class-has-active-time-slot', {
        values: { title: schedulingVideoTitle }
      })}
    </p>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="approved" default use={[InitialFocus]} variant="unelevated">
      <Label>{$_('text.remove-class')}</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .main-grid {
    grid-area: main;
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap);
    align-items: center;
    grid-template-areas: 'one two';
    grid-template-columns: 4fr 4fr;
    grid-template-rows: auto;
    align-items: initial;
    background-color: var(--background);
    overflow: auto;
  }
  .grid-item {
    background: var(--back-grid-item);
  }
  .user-videos {
    grid-area: one;
    overflow: auto;
  }
  .time,
  .videos {
    grid-area: two;
    overflow: auto;
  }
  .time {
    background: #fff;
  }
  .no-user-selected {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :global(.item > label) {
    width: 100%;
  }
  .button-close {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translate(50%, -50%);
  }
  .reasons > :global(*) {
    display: block;
    margin: 1em 0;
  }
  :global(.no-user-selected .content) {
    display: flex;
  }
  .header-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
</style>
