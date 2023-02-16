<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isSameDay } from 'date-fns';
  import Controls from './Controls.svelte';
  import DaysOfWeek from './DaysOfWeek.svelte';
  import Week from './Week.svelte';
  import { getCalendarWeeks, getTouchTarget } from '../utils';
  import localeStore from '../stores/localeStore';

  export let btnClass: string;
  export let disabledDates: Date[];
  export let events: Date[];
  export let firstDayOfWeek: string;
  export let hasSelection: boolean;
  export let maxDate: Date;
  export let minDate: Date;
  export let month: Date;
  export let monthDropdown: boolean;
  export let monthFormat: string;
  export let monthIndicator: boolean;
  export let nextIcon: string;
  export let pageNum: number;
  export let prevIcon: string;
  export let singlePicker: boolean;
  export let selectClass: string;
  export let tempEndDate: Date;
  export let tempStartDate: Date;
  export let today: Date;
  export let weekGuides: boolean;
  export let weekNumbers: boolean;
  export let yearDropdown: boolean;

  $: weeks = $localeStore && getCalendarWeeks({
      disabledDates,
      events,
      firstDayOfWeek,
      maxDate,
      minDate,
      month,
      singlePicker,
      tempEndDate,
      tempStartDate,
      today,
      date: new Date()
  });

  const dispatchEvent = createEventDispatcher();

  const onTouchmove = (e: TouchEvent) => {
    const target = getTouchTarget(e);
    if (target?.dataset.date && !target.disabled) {
      const valueArray = target.dataset.date?.split('-');
      if (valueArray.length === 3) {
        const newDate = new Date(
          Number(valueArray[0]),
          parseInt(valueArray[1]) - 1,
          Number(valueArray[2])
        );
        // Prevent unnecessary updates
        if (!isSameDay(newDate, tempEndDate)) {
          dispatchEvent('hover', newDate);
        }
      }
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    // e.preventDefault() is used to prevent mouse events from firing
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Supporting_both_TouchEvent_and_MouseEvent
    e.preventDefault();
    const target = e.target as HTMLSelectElement;
    if (target?.dataset.date && !target.disabled) {
      const valueArray = target.dataset.date.split('-');
      if (valueArray.length === 3)
        dispatchEvent(
          'selection',
          new Date(Number(valueArray[0]), parseInt(valueArray[1]) - 1, Number(valueArray[2]))
        );
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    // e.preventDefault() is used to prevent mouse events from firing
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Supporting_both_TouchEvent_and_MouseEvent
    e.preventDefault();
    const target = getTouchTarget(e) as HTMLSelectElement;
    if (target.dataset.date && !target.disabled) {
      const valueArray = target.dataset.date.split('-');
      if(valueArray.length === 3) {
        const newDate = new Date(Number(valueArray[0]), parseInt(valueArray[1]) - 1, Number(valueArray[2]));
  
        if (!isSameDay(newDate, tempStartDate) && !hasSelection) {
          dispatchEvent('selection', newDate);
        }
      }
    }
  };
</script>

<div class="calendar">
  <Controls
    locale={$localeStore}
    {btnClass}
    {maxDate}
    {minDate}
    {month}
    {monthDropdown}
    {monthFormat}
    {nextIcon}
    on:pageChange
    on:prevMonth
    on:nextMonth
    {pageNum}
    {prevIcon}
    {selectClass}
    {yearDropdown}
  />
  <div
    role="grid"
    on:touchmove|passive={onTouchmove}
    on:touchstart={onTouchStart}
    on:touchend={onTouchEnd}
  >
    <DaysOfWeek {weekGuides} {weekNumbers} {firstDayOfWeek} />
    {#each weeks as week}
      <Week
        {monthIndicator}
        on:apply
        on:cancel
        on:hover
        on:nextMonth
        on:prevMonth
        on:selection
        {week}
        {weekGuides}
        {weekNumbers}
      />
    {/each}
  </div>
</div>
