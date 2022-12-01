<script>
  import './_icon-button.scss';
  import './_date-range-picker.scss';
  import { page } from '$app/stores';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
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
  import { endOfWeek, startOfYear, endOfYear, addYears, subYears, parseISO } from 'date-fns';
  import {
    toISODate,
    proxyEvent,
    sortByEndDate,
    sortByTitle,
    createRedirectSlug,
    ADMIN,
    SUPERUSER,
    LOCALESTORE
  } from '$lib/utils';
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
  import Radio from '@smui/radio';
  import { _, locale } from 'svelte-i18n';

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

  /**
   * @type {Element}
   */
  let root;
  /**
   * @type {string | null}
   */
  let schedulingVideoId;
  /**
   * @type {boolean}
   */
  let isopen = false;
  /**
   * @type {import("@smui/dialog").DialogComponentDev}
   */
  let scheduleDialog;
  /**
   * @type {import("@smui/dialog").DialogComponentDev}
   */
  let removeDialog;
  /**
   * @type {number | string}
   */
  let timespanSelection = timespanSelections[0].value;
  /**
   * @type {number | string}
   */
  let timespanSelected;
  let firstDayOfWeek = 'monday';
  /**
   * @type {import("@smui/snackbar").SnackbarComponentDev}
   */
  let snackbar;
  /**
   * @type {string}
   */
  let message;
  /**
   * @type {number}
   */
  let selectedIndex;
  /**
   * @type {number}
   */
  let selectedNoneUserIndex;
  /**
   * @type {string | null}
   */
  let selectionVideoId;
  /**
   * @type {import('$lib/types').Video}
   */
  let selectedVideo;
  /**
   * @type {any}
   */
  let readout;
  /**
   * @type {import('$lib/types').Video}
   */
  let schedulingVideo;
  /**
   * @type {number}
   */
  let expires;
  /**
   * @type {boolean}
   */
  let isExpired;
  /**
   * @type {any}
   */
  let itemsList = {};

  $: dateFormat = $locale?.startsWith('de') ? 'dd. MMM yyyy' : 'yyyy-MM-dd';
  $: (1 || selectionUserId) && (selectionVideoId = null);
  $: currentUser = $users.find((usr) => usr.id === selectionUserId);
  $: name = currentUser?.name || '';
  $: role = currentUser?.role;
  $: jwt = currentUser?.jwt;
  $: active = currentUser?.active;
  $: joinData =
    (selectedVideo = currentUser?.videos?.find(
      (/** @type {{ id: string | null; }} */ v) => v.id === selectionVideoId
    )) && selectedVideo._joinData;
  $: startDate = (joinData?.start && parseISO(joinData.start)) || endOfWeek(new Date(0));
  $: endDate = (joinData?.end && parseISO(joinData.end)) || endOfWeek(new Date(0));
  $: expires = currentUser?.expires;
  $: isExpired = (expires && expires * 1000 < +new Date().getTime()) || false;
  $: schedulingVideo =
    schedulingVideoId && $videos?.find((video) => video.id === schedulingVideoId);
  $: schedulingVideoTitle = (schedulingVideo && schedulingVideo.title) || '';
  $: userIssues =
    ($infos?.has(selectionUserId) &&
      $infos
        .get(selectionUserId)
        .params.filter((/** @type {{ type: string; }} */ info) => info.type === 'issue')) ||
    [];
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: hasCurrentPrivileges = role === ADMIN || role === SUPERUSER;
  $: displayedVideos = hasPrivileges
    ? currentUser?.videos.sort(sortByEndDate) || []
    : currentUser?.videos
        .filter(
          (
            /** @type {{ _joinData: { start: string | number | Date; end: string | number | Date; }; }} */ v
          ) => {
            return (
              new Date(v._joinData.start) <= new Date() && new Date(v._joinData.end) >= new Date()
            );
          }
        )
        .sort(sortByEndDate) || [];
  $: userVideos =
    displayedVideos.map((/** @type {{ id: any; }} */ video) => {
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
            !userVideos?.find(
              (/** @type {{ id: any; _joinData: { end: string | number | Date; }; }} */ uv) => {
                return (
                  v.id === uv.id && (!uv._joinData.end || new Date(uv._joinData.end) > new Date())
                );
              }
            )
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
  });

  /**
   * @param {import('$lib/types').Video} video
   */
  function openScheduleDialog(video) {
    schedulingVideoId = video.id;
    scheduleDialog.setOpen?.(true);
  }

  /**
   * @param {CustomEvent<any>} event
   * @param {import('$lib/types').Video} video
   */
  function openRemoveDialog(event, video) {
    event.preventDefault();
    schedulingVideoId = video.id;
    if (timeRemaining(video)) {
      removeDialog.setOpen?.(true);
    } else {
      removeVideo();
    }
  }

  /**
   * @param {CustomEvent} event
   */
  async function removeDialogCloseHandler({ detail }) {
    if (detail.action === 'approved') {
      removeVideo();
    }
    schedulingVideoId = null;
  }

  /**
   * @param {CustomEvent} event
   */
  async function scheduleDialogCloseHandler(event) {
    if (event.detail.action === 'accept') {
      let start = null;
      let end = null;

      timespanSelected = timespanSelection;
      if (typeof timespanSelected === 'number') {
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

  /**
   * @param {CustomEvent} event
   */
  async function videoSelectedHandler({ detail }) {
    const { video } = detail;
    selectionVideoId = video?.id;
    scrollIntoView();
  }

  /**
   * @param {CustomEvent} event
   */
  function onApplyHandler({ detail }) {
    /** @type {any} */
    const { startDate, endDate } = { ...detail };

    let isoStart = toISODate(startDate);
    let isoEnd = toISODate(endDate);

    saveTime(selectionVideoId, isoStart, isoEnd);
  }

  /**
   * @param {string | null} id
   * @param {string | null} start
   * @param {string | null} end
   */
  async function saveTime(id, start, end) {
    const associated = userVideos
      .filter((/** @type {{ id: string | null; }} */ v) => v.id != id)
      .map((/** @type {{ id: any; }} */ v) => ({ id: v.id }));
    const currentVideo = userVideos.find((/** @type {{ id: string | null; }} */ v) => v.id == id);
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

    const res = await saveUser(data);

    let idx;
    if (res?.success) {
      handleSuccess(res, $_('text.time-slot-updated'));
      setTimeout(() => {
        idx = userVideos.findIndex(
          (/** @type {import('$lib/types').Video} */ v) => v.id == selectionVideoId
        );
        idx !== -1 && itemsList[USERVIDEOSLIST].focusItemAtIndex(idx);
      }, 500);
    } else {
      startDate = startDate;
      handleError(res);
    }
  }

  /**
   * @param {import('$lib/types').Video} video
   */
  function timeRemaining(video) {
    if (!video._joinData?.end) return 0;
    const end = new Date(video._joinData.end).getTime();
    const now = new Date().getTime();
    return new Date(Math.max(0, end - now));
  }

  async function removeVideo() {
    const idx = userVideos.findIndex(
      (/** @type {{ id: string | null; }} */ itm) => itm.id === schedulingVideoId
    );
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

  /**
   * @param {{ videos: ({ id: any; } | { id: string | null; _joinData: any; })[] | { _ids: any[]; }; }} data
   */
  async function saveUser(data) {
    return await fetch(`/users/${currentUser?.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(async (res) => {
      if (res.ok) return await res.json();
    });
  }

  /**
   * @param {{ data: import("$lib/types").User<Record<any, any>>; message: any; }} res
   * @param {string} msg
   */
  function handleSuccess(res, msg) {
    snackbar.isOpen?.() && snackbar.close?.();
    users.put(res.data);

    message = msg || res.message || res.data.message;
    configSnackbar(message);
    snackbar.open?.();
  }

  /**
   * @param {{ message: any; data: { message: any; code: any; }; statusText: any; status: any; }} res
   */
  function handleError(res) {
    snackbar.isOpen?.() && snackbar.close?.();

    message = res?.message || res?.data?.message || res?.statusText;
    const code = res.data?.code || res.status;

    if (400 <= code && code < 500) {
      configSnackbar(message);
      snackbar.open?.();
    } else {
      flash.update({ type: 'error', message });
      const url = `login?${createRedirectSlug($page.url)}`;
      configSnackbar(message, url);
      snackbar.open?.();
    }
  }

  /**
   * @param {Event} event
   */
  function onDateRangeSelected(event) {}

  /**
   * @param {string | null} id
   */
  function toggleDataPicker(id) {
    if (selectionVideoId !== id) {
      selectionVideoId = id;
      isopen = true;
    } else {
      isopen = !isopen;
    }
  }

  // @ts-ignore
  function receiveListMethods({ focusItemAtIndex, items, listName }) {
    lists.add(listName);
    itemsList[listName] = { items, focusItemAtIndex };
  }

  /**
   * @param {import('$lib/types').Video} video
   */
  function editVideo(video) {
    open(
      VideoEditorList,
      {
        data: [video]
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
        let item = itemsList[name].items.find(
          (/** @type {{ selected: any; }} */ item) => item.selected
        );
        item?.element.scrollIntoView(options);
      });
    }, 100);
  }
</script>

<div class="main-grid datapicker" class:isopen>
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
                  on:datapicker={({ detail }) => toggleDataPicker(detail.id)}
                  on:video:selected={videoSelectedHandler}
                  selected={selectionVideoId === video.id}
                  emptyPoster="/empty-poster.jpg"
                  {video}
                  {selectionUserId}
                >
                  <IconButton class="self-center mr-2" color="primary" href={`/videos/${video.id}`}>
                    <Icon class="material-icons">smart_display</Icon>
                  </IconButton>
                  {#if hasPrivileges}
                    <Button
                      class="close-action-button button-shaped-round flex self-center"
                      variant="unelevated"
                      on:click={() => toggleDataPicker(video.id)}
                    >
                      <Icon class="material-icons">
                        {isopen
                          ? video.id === selectionVideoId
                            ? 'close'
                            : 'insert_invitation'
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
        on:SMUIList:mount={(e) => receiveListMethods({ ...e.detail, listName: NONUSERVIDEOSLIST })}
        twoLine
        avatarList
        singleSelection
        bind:selectedIndex={selectedNoneUserIndex}
      >
        {#if noneUserVideos.length}
          {#each noneUserVideos as video (video.id)}
            <SimpleVideoCard
              on:video:selected={videoSelectedHandler}
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
                  href={`/videos/${video.id}`}
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
  {#if isopen}
    <div in:fly={{ opacity: 0 }} out:fly={{ opacity: 0 }} class="grid-item time">
      <Component variant="sm">
        <div slot="header">
          <div class="">
            <Header mdc h="5">{readout}</Header>
            <button on:click={() => toggleDataPicker(selectionVideoId)} class="button-close" />
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
          localeObject={LOCALESTORE.get($locale)?.fns}
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
    position: relative;
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
    right: 30px;
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

  @media (max-width: 990px) {
    .main-grid {
      grid-template-areas:
        'one'
        'two';
      grid-template-columns: 1fr;
    }
  }
</style>
