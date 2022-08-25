<script>
  // @ts-nocheck

  import './_user-video.scss';
  import { session } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from '@smui/button';
  import { Item, Graphic, Text, PrimaryText, SecondaryText } from '@smui/list';
  import Chip, { Set, LeadingIcon } from '@smui/chips';
  import { localeFormat, hasStarted, isExpired } from '$lib/utils';
  import { getMedia } from '$lib/utils/media';
  import { parseISO } from 'date-fns';
  import { users } from '$lib/stores';
  import { differenceInHours } from 'date-fns';
  import { _, locale } from 'svelte-i18n';

  export let video;
  export let disabled = false;
  export let selectionUserId = null;
  export { className as class };
  export let threeLine = false;
  export let selected = false;
  export let isUserVideo = false;
  export let emptyPoster = 'https://via.placeholder.com/40x40.png?text=';

  let dispatch = createEventDispatcher();
  let className = '';
  let src = '';
  let _video;
  let readoutPeriod;
  let readoutDuration;
  let startDate;
  let endDate;
  let custom;
  let playhead;
  let duration;
  let pending;
  let expired;
  let timerOff;
  let filtered;
  let item;

  $: user = $session.user;
  $: dateFormat = $locale.indexOf('de') != -1 ? 'dd. MMM yyyy' : 'yyyy-MM-dd';
  $: video && fetchBackgroundImage(video);
  $: unmanagable = disabled;
  $: currentUser =
    (filtered = ((id) => $users.filter((usr) => usr.id === id))(selectionUserId)) &&
    filtered.length &&
    filtered[0];
  $: joinData =
    currentUser && (_video = currentUser.videos.find((v) => v.id === video.id)) && _video._joinData;
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
        `${localeFormat(startDate, dateFormat)} - ${localeFormat(endDate, dateFormat)}`) ||
      $_('text.not-scheduled')),
    (readoutDuration = (startDate && _readoutDuration(startDate, endDate)) || '--')
  ))(joinData, $locale);

  function _timespan(date, endDate) {
    let start = hasStarted(date) ? new Date() : date;
    return Math.abs(differenceInHours(start, endDate));
  }

  function _readoutDuration(date, endDate) {
    if (endDate && isExpired(endDate)) return $_('text.expired');

    let time = _timespan(date, endDate);
    let days = Math.floor(time / 24);
    let hours = time % 24;
    let daysReadout = days ? `${days} d` : '';
    let hoursReadout = hours ? `${hours} h` : '';
    return `${daysReadout} ${hoursReadout}`;
  }

  async function fetchBackgroundImage(video) {
    if (video.image_id) {
      const res = await getPosterUrl(video.image_id)
        .then((res) => (src = res))
        .catch(() => (src = fromTitle()));
    } else {
      src = emptyPoster;
    }
  }

  async function getPosterUrl(id) {
    if (id) {
      // options.square: 0 => intelligent resize (keep ratio) | 1 => force resize | 2 => no resize (original)
      const res = await getMedia('IMAGE', id, user, {
        width: 40,
        height: 40,
        square: 1
      });
      if (res) return res;
    }
  }

  function fromTitle() {
    let _src;
    if (video.title) {
      let initials = video.title
        .split(' ')
        .map((val) => val.substring(0, 1))
        .join('');
      _src = `${emptyPoster}${initials}`;
    } else {
      _src = emptyPoster;
    }
    return _src;
  }
</script>

<Item
  class="item {className}"
  disabled={unmanagable}
  bind:this={item}
  on:SMUI:action={() => dispatch('itemSelected', { video })}
  {selected}
>
  <Graphic
    class="relative z-10"
    style="background-image: url({src}); background-position: center center;
  background-size: cover;"
  />
  <Text>
    <PrimaryText>
      <span class="opacity-25" class:opacity-25={!video.title}>
        {`${video.title || 'Kein Titel'}`}
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
          <LeadingIcon class="material-icons" leading>date_range</LeadingIcon>
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
</Item>

<style>
</style>
