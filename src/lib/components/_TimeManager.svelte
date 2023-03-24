<script lang="ts">
  import './_icon-button.scss';
  import './_date-range-picker.scss';
  import './_video-list.scss';
  import { page } from '$app/stores';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import List, { Item, Graphic, Separator, Text } from '@smui/list';
  import FormField from '@smui/form-field';
  import Checkbox from '@smui/checkbox';
  import Button, { Label, Icon as ButtonIcon } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import { flash, infos, session, users, videos, videosAll } from '$lib/stores';
  import emptyPoster from '/src/assets/images/empty-poster.jpg';
  import {
    SimpleVideoCard,
    DateRangePicker,
    Heading,
    Container,
    VideoEditorList,
    Paginator,
    FlexContainer,
    SearchTextField,
    UserGraphic
  } from '$lib/components';
  import { endOfWeek, startOfYear, endOfYear, addYears, subYears, parseISO } from 'date-fns';
  import {
    toISODate,
    emit,
    sortByEndDate,
    createRedirectSlug,
    filterByModelKeys,
    ADMIN,
    SUPERUSER,
    LOCALESTORE
  } from '$lib/utils';
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
  import Radio from '@smui/radio';
  import { _, locale } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';
  import type { Badge, Issue } from '$lib/types';
  import type { User, Video } from '$lib/classes/repos/types';

  export let selectionUserId: string;

  const isUnmanagableNoneUserList = false;
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');
  const { open, close }: any = getContext('editor-modal');
  const { setFab }: any = getContext('fab');
  const { searchVideos, searchVideosAll }: any = getContext('search');
  const timespanSelections = [
    { title: 'text.1-month', value: 30 },
    { title: 'text.2-months', value: 60 },
    { title: 'text.3-months', value: 90 },
    { title: 'text.custom', value: 'custom' }
  ];
  const lists: Set<string> = new Set();
  const USERVIDEOSLIST = 'user-video-list';
  const NONUSERVIDEOSLIST = 'non-user-videos-list';
  const minSearchChars = 3;
  const modelSearchKeys = 'description,title,id';
  const lsTimespanName = 'timespanindex';

  let root: Element;
  let main: Element;
  let schedulingVideoId: string | null;
  let isopen = false;
  let scheduleDialog: Dialog;
  let removeDialog: Dialog;
  let timespanSelected: number | string;
  let firstDayOfWeek = 'monday';
  let snackbar: Snackbar;
  let message: string;
  let selectedIndex: number;
  let selectedNoneUserIndex: number;
  let selectionVideoId: string | null;
  let selectedVideo: Video;
  let readout: any;
  let schedulingVideo: Video | undefined;
  let expires: number | undefined;
  let isExpired: boolean;
  let itemsList: { [x: string]: { items: any; element: any; focusItemAtIndex: any } } = {};
  let displayedVideos: Video[];
  let search: string = '';
  let rememberSelection = false;
  let timespanSelectionIndex: number;

  $: selectionUserId && (selectionVideoId = null);
  $: selectedUser = $users.find((usr) => usr.id === selectionUserId);
  $: hasSelectedUserPrivileges = selectedUser?.role === ADMIN || selectedUser?.role === SUPERUSER;
  $: badge = {
    icon: (hasSelectedUserPrivileges && 'admin_panel_settings') || '',
    color:
      selectedUser?.role === SUPERUSER
        ? 'rgb(26, 4, 4)'
        : selectedUser?.role === ADMIN
        ? 'rgb(206, 4, 4)'
        : '',
    position: 'TOP_RIGHT',
    size: 'small'
  } as Badge;
  $: name = selectedUser?.name || '';
  $: role = selectedUser?.role;
  $: jwt = selectedUser?.jwt;
  $: active = selectedUser?.active;
  $: joinData =
    (selectedVideo = selectedUser?.videos?.find((video: Video) => video.id === selectionVideoId)) &&
    selectedVideo._joinData;
  $: startDate = (joinData?.start && parseISO(joinData.start)) || endOfWeek(new Date(0));
  $: endDate = (joinData?.end && parseISO(joinData.end)) || endOfWeek(new Date(0));
  $: expires = selectedUser?.expires;
  $: isExpired = (expires && expires * 1000 < +new Date().getTime()) || false;
  $: schedulingVideo =
    (schedulingVideoId && $videos?.find((video) => video.id === schedulingVideoId)) || undefined;
  $: schedulingVideoTitle = (schedulingVideo && schedulingVideo.title) || '';
  $: userInfos = ((infos: Map<string, { issues: Issue[] }> = new Map()) => {
    const info = infos.get(selectionUserId);
    if (info) {
      return info.issues.filter((info) => info.type === 'issue');
    } else {
      return [];
    }
  })($infos as Map<string, { issues: Issue[] }>);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: pagination = hasPrivileges ? $page.data.pagination?.videos : $page.data.pagination?.videosAll;
  $: store = hasPrivileges ? videos : videosAll;
  $: action = hasPrivileges ? '/videos?/more_videos' : '/videos?/more_videos_all';
  $: id = hasPrivileges ? 'videos-paginator' : 'videos-all-paginator';
  $: hasCurrentPrivileges = role === ADMIN || role === SUPERUSER;
  $: displayedVideos = hasPrivileges
    ? selectedUser?.videos?.sort(sortByEndDate) || []
    : selectedUser?.videos
        ?.filter((video: Video) => {
          return (
            new Date(video._joinData.start) <= new Date() &&
            new Date(video._joinData.end) >= new Date()
          );
        })
        .sort(sortByEndDate) || [];
  $: userVideos =
    displayedVideos.map((video) => {
      const _video = $videos?.find((vid) => vid.id === video.id);
      if (_video) {
        const { image_id, title } = _video;
        return { ...video, image_id, title };
      } else {
        return { ...video };
      }
    }) || [];
  $: noneUserVideos = hasPrivileges ? $videos : $videosAll;
  $: if (search.length >= minSearchChars) {
    (async (s) => {
      let res: any;
      if (hasPrivileges) {
        res = await searchVideos({ keys: modelSearchKeys, search: s });
        if (res.success) videos.add(res.data);
      } else {
        res = await searchVideosAll({ keys: modelSearchKeys, search: s });
        if (res.success) videosAll.add(res.data);
      }
    })(search);
  }
  $: filteredVideos = ((videos) => filterByModelKeys(search, videos, modelSearchKeys))(
    noneUserVideos
  );
  $: filteredVideos.sortBy('title');
  $: addClass(isopen);

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

  const getIndex = () => Number(localStorage.getItem(lsTimespanName)?.match(/[0|1|2/3]/)?.[0] || 0);

  function openScheduleDialog(video: Video) {
    timespanSelectionIndex = getIndex();
    schedulingVideoId = video.id;
    scheduleDialog?.setOpen(true);
  }

  function openRemoveDialog(video: Video) {
    schedulingVideoId = video.id;
    if (timeRemaining(video)) {
      removeDialog?.setOpen(true);
    } else {
      removeVideo();
    }
  }

  async function removeDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      removeVideo();
    }
    schedulingVideoId = null;
  }

  async function scheduleDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'accept') {
      let start = null;
      let end = null;

      timespanSelected = timespanSelections[timespanSelectionIndex].value;
      if (typeof timespanSelected === 'number') {
        let now = new Date();
        let time = new Date(now.getTime() + timespanSelected * 24 * 60 * 60 * 1000);
        start = toISODate(now);
        end = toISODate(time, true);
      }
      saveScheduledTime(schedulingVideoId, start, end);
      if (rememberSelection) {
        localStorage.setItem(lsTimespanName, timespanSelectionIndex.toString());
      }
      timespanSelectionIndex = getIndex();
      rememberSelection = false;
      schedulingVideoId = null;
    }
  }

  async function videoSelectedHandler({ detail }: CustomEvent) {
    const { event, video } = detail;
    const id = video?.id;
    selectionVideoId = id;
    const exists = ((isPrivileged) => {
      const finder = (v: Video) => selectionVideoId === v.id;
      if (isPrivileged) {
        return !!$videos.find(finder);
      } else {
        return !!$videosAll.find(finder);
      }
    })(hasPrivileges);
    if (!exists) {
      await fetch(`/repos/videos?id=${id}`)
        .then(async (res) => await res.json())
        .then((res) => emit('video:add', { data: [res] }));
    }
    scrollIntoView(event);
  }

  function onApplyHandler({ detail }: CustomEvent) {
    const { startDate, endDate }: any = { ...detail };

    let isoStart = toISODate(startDate);
    let isoEnd = toISODate(endDate);

    saveScheduledTime(selectionVideoId, isoStart, isoEnd);
  }

  function saveScheduledTime(id: string | null, start: string | null, end: string | null) {
    const associated = userVideos
      .filter((video) => video.id != id)
      .map((video) => ({ id: video.id }));
    const currentVideo = userVideos.find((video) => video.id == id);
    const joinData = currentVideo?._joinData || {};

    const data = {
      id: selectedUser?.id,
      videos: [
        {
          id,
          _joinData: { ...joinData, start, end }
        },
        ...associated
      ]
    };

    const onsuccess = (res: any) => {
      let idx;
      handleSuccess(res, $_('text.time-slot-updated'));
      setTimeout(() => {
        idx = userVideos.findIndex((video) => video.id == selectionVideoId);
        idx !== -1 && itemsList[USERVIDEOSLIST].focusItemAtIndex(idx);
      }, 500);
    };
    const onerror = (res: any) => {
      startDate = startDate;
      if (res) handleError(res);
    };
    emit('user:save', { data, onsuccess, onerror });
  }

  function timeRemaining(video: Video) {
    if (!video._joinData?.end) return 0;
    const end = new Date(video._joinData.end).getTime();
    const now = new Date().getTime();
    return Math.max(0, end - now);
  }

  async function removeVideo() {
    if (!schedulingVideoId) {
      throw 'No id specified when trying to remove a video';
    }
    const idx = userVideos.findIndex((itm) => itm.id === schedulingVideoId);
    const _userVideos = [...userVideos.slice(0, idx), ...userVideos.slice(idx + 1)];
    const ids = _userVideos.map((v) => v.id);
    const data = { id: selectedUser?.id, videos: { _ids: [...ids] } };

    const onsuccess = (res: any) => {
      selectionVideoId === schedulingVideoId && (selectionVideoId = null);
      if (res) handleSuccess(res, $_('text.video-removed'));
    };
    const onerror = (res: any) => {
      if (res) handleError(res);
    };
    emit('user:save', { data, onsuccess, onerror });
  }

  function handleSuccess(res: { data: User; message: any }, msg: string) {
    users.put(res.data);

    message = msg || res.message || res.data.message;
    configSnackbar(message);
    snackbar?.forceOpen();
  }

  function handleError(res: any) {
    message = res?.message || res?.data?.message || res?.statusText;
    const code = res.data?.code || res.status;

    if (400 <= code && code < 500) {
      configSnackbar(message);
      snackbar?.forceOpen();
    } else {
      flash.update({ type: 'error', message, timeout: 3500 });
      const url = `login?${createRedirectSlug($page.url)}`;
      configSnackbar(message, url);
      snackbar?.forceOpen();
    }
  }

  function onDateRangeSelected(event: Event) {}

  function toggleDatePicker(id: string | null) {
    if (selectionVideoId !== id) {
      selectionVideoId = id;
      isopen = true;
    } else {
      isopen = !isopen;
    }
  }

  function receiveListMethods(
    listName: string,
    methods: { items: any; element: any; focusItemAtIndex: any }
  ) {
    lists.add(listName);
    itemsList[listName] = methods;
  }

  function editVideo(video: Video) {
    open(VideoEditorList, {
      props: {
        data: [video]
      }
    });
  }

  function scrollIntoView({ detail }: CustomEvent) {
    const listEl = detail.target.closest('li');
    setTimeout(() => {
      lists.forEach((name) => {
        let item = itemsList[name].items.find((item: { selected: any }) => item.selected);
        if (item?.element && item?.element !== listEl) {
          item.element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    }, 100);
  }

  async function handlePaginatorAdded() {
    const { items, element } = itemsList[NONUSERVIDEOSLIST];
    await tick();
    const last = element.querySelector(`li:nth-child(${items.length})`); // :last-child fails for some reason
    last.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function addClass(isopen: boolean) {
    root?.classList.toggle('datapicker--open', isopen);
  }
</script>

<div bind:this={main} class="main-grid datapicker" class:isopen>
  <div
    class="grid-item user-videos"
    class:no-user-selected={!selectedUser}
    class:no-videos={!userVideos.length || hasCurrentPrivileges}
  >
    <Container density="sm" variant="primary">
      <div slot="header">
        <Heading mdc h="5">
          <div class="flex">
            {#if selectedUser}
              <span class="flex">
                <UserGraphic
                  size={50}
                  borderSize={2}
                  user={selectedUser}
                  badge={hasSelectedUserPrivileges ? badge : false}
                  borderColor="#c5c5c5"
                  style="padding: 2px;"
                />
              </span>
              <span class="header-name pr-5 self-center">{name}</span>
              <span
                class="uppercase flex-auto flex self-center justify-end"
                style="font-weight: 400;">| {$_('text.booked-videos')}</span
              >
            {/if}
          </div>
        </Heading>
      </div>
      {#if selectedUser}
        <List
          class="video-list"
          threeLine
          avatarList
          singleSelection
          bind:selectedIndex
          on:SMUIList:mount={(e) => receiveListMethods(USERVIDEOSLIST, { ...e.detail })}
        >
          {#if !hasCurrentPrivileges}
            {#if userVideos.length}
              {#each userVideos as video (video.id)}
                <SimpleVideoCard
                  isUserVideo
                  threeLine
                  class="user-video video-list-item"
                  on:datapicker={({ detail }) => toggleDatePicker(detail.id)}
                  on:video:selected={videoSelectedHandler}
                  selected={selectionVideoId === video.id}
                  {emptyPoster}
                  {video}
                  {selectionUserId}
                >
                  <IconButton
                    class="self-center mr-2 medium"
                    color="primary"
                    href={`/videos/${video.id}`}
                  >
                    <Icon class="material-icons">smart_display</Icon>
                  </IconButton>
                  {#if hasPrivileges}
                    <IconButton
                      color="primary"
                      class="toggle-date-picker"
                      on:click={() => toggleDatePicker(video.id)}
                    >
                      <Icon class="material-icons">
                        {isopen
                          ? video.id === selectionVideoId
                            ? 'cancel'
                            : 'date_range'
                          : 'date_range'}
                      </Icon>
                    </IconButton>
                    <IconButton
                      class="delete-action-button delete ml-2 medium"
                      on:click$preventDefault={() => openRemoveDialog(video)}
                    >
                      <Icon class="material-icons">delete</Icon>
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
        <FlexContainer>
          {$_('text.empty-user-selection')}
        </FlexContainer>
      {/if}
    </Container>
  </div>
  <div class="grid-item videos" class:no-videos={!noneUserVideos?.length}>
    <Container density="sm" variant="primary">
      <div slot="header">
        <Heading mdc h="5">
          <div class="uppercase" style="font-weight: 400; text-align: right;">
            {$_('text.available-videos')}
          </div></Heading
        >
      </div>
      <SearchTextField
        style="position: absolute; z-index: 1; width: 100%;"
        bind:search
        label={$_('text.search-videos')}
        infoLabel={$_('text.type-min-char-count', { values: { count: minSearchChars } })}
      />
      <List
        class="video-list"
        style="margin-top: 80px;"
        on:SMUIList:mount={(e) => receiveListMethods(NONUSERVIDEOSLIST, { ...e.detail })}
        twoLine
        avatarList
        singleSelection
        bind:selectedIndex={selectedNoneUserIndex}
      >
        {#if filteredVideos?.length}
          {#each filteredVideos as video (video.id)}
            <SimpleVideoCard
              on:video:selected={videoSelectedHandler}
              let:unmanagable
              class="video"
              disabled={(hasCurrentPrivileges || hasPrivileges) && isUnmanagableNoneUserList}
              selected={selectionVideoId === video.id}
              {emptyPoster}
              {video}
              {selectionUserId}
            >
              {#if hasPrivileges}
                <IconButton class="mr-2 medium" on:click={() => editVideo(video)}>
                  <Icon class="material-icons">movie_edit</Icon>
                </IconButton>
                <IconButton class="mr-2 medium" href={`/videos/${video.id}`}>
                  <Icon class="material-icons">smart_display</Icon>
                </IconButton>
                <IconButton
                  disabled={hasCurrentPrivileges || unmanagable || video.teaser}
                  class="add medium"
                  on:click={() => openScheduleDialog(video)}
                >
                  <Icon class="material-icons">playlist_add</Icon>
                </IconButton>
              {:else if userVideos.find(({ id }) => video.id == id)}
                <Icon class="material-icons">verified</Icon>
              {/if}
            </SimpleVideoCard>
          {/each}
          <Paginator {id} {pagination} {store} {action} type="label" indicator />
        {:else}
          <li class="flex flex-1 flex-col self-center text-center">
            <div class="m-5">{$_('text.no-videos')}</div>
          </li>
        {/if}
      </List>
    </Container>
  </div>
  {#if isopen}
    <div
      in:fly={{ opacity: 0 }}
      out:fly={{ opacity: 0 }}
      class="grid-item time"
      style="z-index: 1;"
    >
      <Container density="sm">
        <div slot="header">
          <span class="flex">
            <Icon class="material-icons">date_range</Icon>
            <Heading mdc h="5" class="ml-2">{readout}</Heading>
          </span>
          <button on:click={() => toggleDatePicker(selectionVideoId)} class="button-close" />
        </div>
        {#if $locale}
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
        {/if}
      </Container>
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
      {#each timespanSelections as selection, i}
        <Item use={(i === 0 && [InitialFocus]) || []}>
          <Graphic>
            <Radio bind:group={timespanSelectionIndex} value={i} />
          </Graphic>
          <Text>{$_(selection.title)}</Text>
        </Item>
      {/each}
      <div class="pl-2 mt-2 mb-2">
        <FormField>
          <Checkbox bind:checked={rememberSelection} />
          <span slot="label">{$_('text.make-default')}</span>
        </FormField>
      </div>
      {#if !jwt || isExpired || !active}
        <div class="mt-3">
          <ButtonIcon class="material-icons leading">warning</ButtonIcon>
          <p>
            {$_('text.account-inactive')}
          </p>
          <div class="reasons">
            {#each userInfos as issue}
              <Button variant="raised" on:click={() => emit(issue.eventType, { silent: true })}>
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
    grid-gap: var(--grid-gap-sm);
    align-items: center;
    grid-template-areas: 'one two';
    grid-template-columns: 4fr 4fr;
    grid-template-rows: auto;
    align-items: initial;
    background-color: var(--background);
    overflow: auto;
  }
  .grid-item {
    background: var(--background-intense);
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

  @media (max-width: 990px) {
    .main-grid {
      grid-template-areas:
        'one'
        'two';
      grid-template-columns: 1fr;
    }
  }
</style>
