<script lang="ts">
  import fallbackPoster from './dummy-poster.jpg';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from '@smui/button';
  import { Item, Graphic, Text, PrimaryText, SecondaryText } from '@smui/list';
  import Chip, { Set, LeadingIcon } from '@smui/chips';
  import {
    hasStarted,
    isExpired,
    LOCALESTORE,
    DateTimeFormatOptions,
    DEFAULT_LOCALE
  } from '$lib/utils';
  import { getMediaImage } from '$lib/utils/media';
  import { parseISO } from 'date-fns';
  import { session, users } from '$lib/stores';
  import { differenceInHours } from 'date-fns';
  import { _, locale } from 'svelte-i18n';
  import { page } from '$app/stores';
  import type { Video } from '$lib/classes/repos/types';

  export let video: Video;
  export let selectionUserId: string | null = '';
  export let anchorFn = (id: string, url: any) => $page.url.href;
  export { className as class };
  export let disabled = false;
  export let threeLine = false;
  export let selected = false;
  export let isUserVideo = false;
  export let emptyPoster = fallbackPoster;

  const placeholderDotCom = 'https://via.placeholder.com/40x40.png?text=';

  let dispatch = createEventDispatcher();
  let className = '';
  let src: string | void = emptyPoster;
  let _video;
  let readoutPeriod: any;
  let readoutDuration: any;
  let startDate;
  let endDate;
  let custom: boolean;
  let playhead;
  let duration;
  let pending: any;
  let expired: boolean;
  let timerOff: boolean;
  let filtered;
  let item;

  $: user = $session.user;
  $: video && (async (vid) => (src = await fetchBackgroundImage(vid)))(video);
  $: unmanagable = disabled;
  $: selectedUser =
    (filtered = ((id) => $users.filter((usr) => usr.id === id))(selectionUserId)) &&
    filtered.length &&
    filtered[0];
  $: joinData =
    selectedUser &&
    (_video = selectedUser.videos?.find((_video: Video) => _video.id === video.id)) &&
    _video._joinData;
  $: ((jData, _locale) => (
    (startDate = jData && jData.start && parseISO(jData.start)),
    (endDate = (jData && jData.end && parseISO(jData.end)) || startDate),
    (playhead = jData && jData.playhead),
    (custom = !(jData && jData.start)),
    (pending = startDate && !hasStarted(startDate)),
    (expired = (endDate && isExpired(endDate)) || false),
    (timerOff = expired || custom),
    (readoutPeriod =
      (startDate &&
        `${new Date(startDate).toLocaleDateString(
          LOCALESTORE.get($locale || DEFAULT_LOCALE)?.fns?.code,
          DateTimeFormatOptions
        )} - ${new Date(endDate).toLocaleDateString(
          LOCALESTORE.get($locale || DEFAULT_LOCALE)?.fns?.code,
          DateTimeFormatOptions
        )}`) ||
      $_('text.not-scheduled')),
    (readoutDuration = (startDate && _readoutDuration(startDate, endDate)) || '--')
  ))(joinData, $locale);

  function _timespan(date: any, endDate: number | Date) {
    let start = hasStarted(date) ? new Date() : date;
    return Math.abs(differenceInHours(start, endDate));
  }

  function _readoutDuration(date: any, endDate: number | Date) {
    if (endDate && isExpired(endDate)) return $_('text.expired');

    let time = _timespan(date, endDate);
    let days = Math.floor(time / 24);
    let hours = time % 24;
    let daysReadout = days ? `${days} d` : '';
    let hoursReadout = hours ? `${hours} h` : '';
    return `${daysReadout} ${hoursReadout}`;
  }

  async function fetchBackgroundImage(video: Video) {
    if (video.image_id) {
      return await getPosterUrl(video.image_id)
        .then((res) => res)
        .catch(() => {});
    } else {
      return emptyPoster;
    }
  }

  async function getPosterUrl(id: string) {
    if (id) {
      // options.square: 0 => intelligent resize (keep ratio) | 1 => force resize | 2 => no resize (original)
      const res = await getMediaImage(id, user?.jwt, {
        width: 40,
        height: 40,
        square: 1
      });
      if (res) return res;
    }
  }

  function fromTitle() {
    if (video.title) {
      let initials = video.title
        .split(' ')
        .map((val) => val.substring(0, 1))
        .join('');
      return `${placeholderDotCom}${initials}`;
    } else {
      return emptyPoster;
    }
  }

  function focusHandler() {}

  function useAnchorFn(url: URL) {
    return anchorFn(video?.id, url);
  }
</script>

<Item
  on:SMUI:action={(e) => dispatch('video:selected', { event: e, video })}
  class="item {className}"
  disabled={unmanagable}
  bind:this={item}
  {selected}
  ><a on:focus={() => focusHandler()} href={useAnchorFn($page.url)} class="flex flex-1 item-inner">
    <Graphic
      class="relative z-10"
      style="background-image: url({src}); background-position: center center;
  background-size: cover;"
    />
    <Text>
      <PrimaryText>
        <span class="opacity-25" class:opacity-25={!video.title}>
          {`${video.title || video.src}`}
        </span>
      </PrimaryText>
      {#if isUserVideo}
        <Set class="time-chip-set relative z-10" chips={[{ id: 0 }]} let:chip>
          <Chip
            {chip}
            class={(className = pending
              ? 'pending'
              : custom
              ? 'custom'
              : expired
              ? 'expired'
              : 'active')}
            on:click={() => dispatch('datapicker', { id: video.id })}
          >
            <LeadingIcon class="material-icons">date_range</LeadingIcon>
            <Text>{readoutPeriod}</Text>
          </Chip>
        </Set>
      {:else}
        <SecondaryText>
          <span>{`${video.description || $_('text.no-description')}`}</span>
        </SecondaryText>
      {/if}
      {#if threeLine}
        <SecondaryText>
          <span class="text-xs text-inherit">
            <Icon class="material-icons">
              {timerOff ? 'timer_off' : 'timer'}
            </Icon>
            <span>{readoutDuration}</span>
            <span>{pending ? `(${$_('text.pending')})` : ''}</span>
          </span>
        </SecondaryText>
      {/if}
    </Text>
    <span class="action-buttons flex flex-1 justify-end">
      <slot {expired} published={!custom} {unmanagable} />
    </span>
  </a>
</Item>

<style>
  .item-inner {
    border-bottom: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: 100%;
    align-items: center;
  }
</style>
