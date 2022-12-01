<script>
  // @ts-nocheck

  import { createEventDispatcher, onMount } from 'svelte';
  import { __locale__ } from './stores/localeStore.js';

  import {
    addMonths,
    addYears,
    subYears,
    endOfWeek,
    endOfYear,
    isAfter,
    isBefore,
    isSameMinute,
    isSameSecond,
    isSameDay,
    isSameMonth,
    startOfWeek,
    startOfYear,
    subMonths
  } from 'date-fns';
  import { passiveSupported, roundDown } from './utils';
  import Calendar from './components/Calendar.svelte';
  import TimePicker from './components/TimePicker.svelte';

  /**
   * @type {Intl.DateTimeFormatOptions}
   */
  const DateTimeFormatOptions = {
    day: '2-digit',
    year: 'numeric',
    month: '2-digit'
  };

  export let applyBtnText = 'Apply';
  export let btnClass = 'picker-btn';
  export let actionBtnClass = btnClass;
  export let cancelBtnText = 'Cancel';
  export let dateTimeFormatOptions = DateTimeFormatOptions;
  export let disabledDates = [];
  export let endDate = endOfWeek(new Date());
  export let events = [];
  export let firstDayOfWeek = 'sunday';
  export let localeObject = undefined;
  export let maxDate = addYears(endOfYear(new Date()), 10);
  export let minDate = subYears(startOfYear(new Date()), 10);
  export let minuteIncrement = 1;
  export let monthDropdown = true;
  export let monthFormat = 'MMMM';
  export let monthIndicator = true;
  export let nextIcon = '▸';
  export let prevIcon = '◂';
  export let resetViewBtn = false;
  export let resetViewBtnText = '↚';
  export let rtl = false;
  export let secondIncrement = 1;
  export let selectClass = 'picker-select';
  export let singlePicker = false;
  export let startDate = startOfWeek(new Date());
  export let timePicker = false;
  export let timePickerControls = false;
  export let timePicker24Hour = true;
  export let timePickerSeconds = false;
  export let today = new Date();
  export let todayBtn = false;
  export let todayBtnText = 'Today';
  export let twoPages = false;
  export let weekGuides = false;
  export let weekNumbers = false;
  export let yearDropdown = true;
  export let resetTrigger = undefined;
  export let disabled = false;
  export let customHeaderHeight = false;
  export let label = false;
  export let readout;
  export { className as class };

  /** @todo Implement props/options */
  // export let maxSpan = null;
  // export let predefinedRanges = [];

  let hasSelection = true;
  let calendarRef;
  let numPages = twoPages ? 2 : 1;
  let navigator;
  let tempStartDate;
  let months;
  let className = '';

  const dispatch = createEventDispatcher();

  $: __locale__.update(localeObject);
  $: tempEndDate = endDate;
  $: tempStartDate = startDate;
  $: months = [...Array(numPages)].map((_, i) => addMonths(today, i));
  $: startDateReadout = () => {
    if (!hasSelection && isBefore(tempEndDate, tempStartDate)) {
      return new Date(tempEndDate).toLocaleDateString(lang, dateTimeFormatOptions);
    }

    return new Date(tempStartDate).toLocaleDateString(lang, dateTimeFormatOptions);
  };
  $: endDateReadout = () => {
    let ret;
    if (!hasSelection) {
      if (isBefore(tempEndDate, tempStartDate))
        return new Date(tempStartDate).toLocaleDateString(lang, dateTimeFormatOptions);
      return new Date(tempEndDate).toLocaleDateString(lang, dateTimeFormatOptions);
    } else {
      return new Date(tempEndDate).toLocaleDateString(lang, dateTimeFormatOptions);
    }
  };
  $: readout = `${startDateReadout()} - ${endDateReadout()}`;
  $: canResetView = !isSameMonth(tempStartDate, months[0]);
  $: lang = localeObject
    ? localeObject.code
    : navigator && navigator.languages
    ? navigator.languages.length && navigator.languages[0]
    : navigator && navigator.language
    ? navigator.language
    : '';
  $: canApply = ((tS, s, tE, e) => {
    if (!hasSelection) {
      return false;
    }

    if (timePicker) {
      if (timePickerSeconds) {
        return !isSameSecond(tS, s) || (!singlePicker && !isSameSecond(tE, e));
      }

      return !isSameMinute(tS, s) || (!singlePicker && !isSameMinute(tE, e));
    }

    return !isSameDay(tS, s) || (!singlePicker && !isSameDay(tE, e));
  })(tempStartDate, startDate, tempEndDate, endDate);
  $: resetTrigger && resetView();

  onMount(() => {
    calendarRef = document.querySelector('.calendar');
    navigator = window.navigator;

    if (twoPages) {
      onResize();
      window.addEventListener('resize', onResize, passiveSupported ? { passive: true } : false);
    }

    if (!startDate) return;

    if (timePicker) {
      tempStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startDate.getHours(),
        roundDown(startDate.getMinutes(), minuteIncrement),
        roundDown(startDate.getSeconds(), secondIncrement)
      );

      tempEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endDate.getHours(),
        roundDown(endDate.getMinutes(), minuteIncrement),
        roundDown(endDate.getSeconds(), secondIncrement)
      );
    }

    if (singlePicker) {
      endDate = startDate;
    }

    resetView();

    return () => {
      if (twoPages) {
        window.removeEventListener('resize', onResize);
      }
    };
  });

  const onResize = () => {
    numPages = document.body.offsetWidth - 64 <= 2 * calendarRef.offsetWidth ? 1 : 2;
  };

  const apply = () => {
    if (!canApply) {
      return;
    }

    dispatch('apply', {
      startDate: tempStartDate,
      endDate: tempEndDate
    });
  };

  const goToToday = () => {
    months = [...Array(numPages)].map((_, i) => addMonths(today, i));
  };

  const resetView = () => {
    const resetViewMonth = canApply ? tempStartDate : startDate;
    months = [...Array(numPages)].map((_, i) => addMonths(resetViewMonth, i));
  };

  const resetState = () => {
    tempStartDate = startDate;
    tempEndDate = endDate;
    hasSelection = true;
  };

  const cancel = () => {
    resetState();
    resetView();

    dispatch('cancel', {
      startDate,
      endDate
    });
  };

  const onSelection = ({ detail }) => {
    /**
     * @todo Take into account the min and max dates
     * when the new end date is after max date, set it to max date
     * when the new start date is before min date, set it to min date
     */
    const detailWithEndDateTime = new Date(
      detail.getFullYear(),
      detail.getMonth(),
      detail.getDate(),
      tempEndDate.getHours(),
      tempEndDate.getMinutes(),
      tempEndDate.getSeconds()
    );

    const detailWithStartDateTime = new Date(
      detail.getFullYear(),
      detail.getMonth(),
      detail.getDate(),
      tempStartDate.getHours(),
      tempStartDate.getMinutes(),
      tempStartDate.getSeconds()
    );

    if (singlePicker) {
      // Start and end dates are always the same on singlePicker
      tempStartDate = tempEndDate = detailWithStartDateTime;
    } else if (hasSelection) {
      // In range mode, if there is currently a selection and the selection
      // event is fired the user must be selecting the start date.
      tempStartDate = isBefore(detailWithStartDateTime, minDate)
        ? minDate
        : detailWithStartDateTime;
      tempEndDate = isAfter(detailWithEndDateTime, maxDate) ? maxDate : detailWithEndDateTime;
      hasSelection = false;
    } else {
      // In range mode, if there isn't a selection, the user must be selecting an end date
      // Sorting - Swap start and end dates when the end date is before the start date
      if (isBefore(detailWithEndDateTime, tempStartDate)) {
        if (isSameDay(detailWithEndDateTime, tempStartDate)) {
          tempEndDate = isAfter(tempStartDate, maxDate) ? maxDate : tempStartDate;
          tempStartDate = isBefore(detailWithEndDateTime, minDate)
            ? minDate
            : detailWithEndDateTime;
        } else {
          const newEndDate = new Date(
            tempStartDate.getFullYear(),
            tempStartDate.getMonth(),
            tempStartDate.getDate(),
            tempEndDate.getHours(),
            tempEndDate.getMinutes(),
            tempEndDate.getSeconds()
          );

          tempEndDate = isAfter(newEndDate, maxDate) ? maxDate : newEndDate;
          tempStartDate = isBefore(detailWithStartDateTime, minDate)
            ? minDate
            : detailWithStartDateTime;
        }
      } else {
        tempEndDate = isAfter(detailWithEndDateTime, maxDate) ? maxDate : detailWithEndDateTime;
      }

      hasSelection = true;

      dispatch('selection', {
        startDate: tempStartDate,
        endDate: tempEndDate
      });
    }
  };

  const onHover = ({ detail }) => {
    if (!hasSelection) {
      // Only update the year, month, and date when hovering over new dates.
      tempEndDate = new Date(
        detail.getFullYear(),
        detail.getMonth(),
        detail.getDate(),
        tempEndDate.getHours(),
        tempEndDate.getMinutes(),
        tempEndDate.getSeconds()
      );
    }
  };

  const onPrevMonth = () => {
    months = months.map((mo) => subMonths(mo, 1));
  };

  const onNextMonth = () => {
    months = months.map((mo) => addMonths(mo, 1));
  };

  const onPageChange = ({ detail: { incrementAmount } }) => {
    if (incrementAmount > 0) {
      months = months.map((mo) => addMonths(mo, incrementAmount));
    } else {
      const absIncrementAmount = Math.abs(incrementAmount);
      months = months.map((mo) => subMonths(mo, absIncrementAmount));
    }
  };

  const onStartTimeChange = ({ detail }) => {
    const newDate = new Date(
      tempStartDate.getFullYear(),
      tempStartDate.getMonth(),
      tempStartDate.getDate(),
      detail.hours,
      detail.minutes,
      detail.seconds
    );

    if (!singlePicker && isAfter(newDate, tempEndDate)) {
      tempStartDate = tempEndDate;
      tempEndDate = newDate;
    } else {
      tempStartDate = newDate;
    }
  };

  const onEndTimeChange = ({ detail }) => {
    const newDate = new Date(
      tempEndDate.getFullYear(),
      tempEndDate.getMonth(),
      tempEndDate.getDate(),
      detail.hours,
      detail.minutes,
      detail.seconds
    );

    if (isBefore(newDate, tempStartDate)) {
      tempEndDate = tempStartDate;
      tempStartDate = newDate;
    } else {
      tempEndDate = newDate;
    }
  };
</script>

<form
  {lang}
  dir={rtl ? 'rtl' : 'ltr'}
  class="date-range-picker {className}"
  class:disabled
  class:custom-header-height={customHeaderHeight}
  class:has-label={label}
  on:submit|preventDefault={apply}
>
  {#if label}
    <label class="readout"> {readout} <input type="hidden" /> </label>
  {/if}
  <div class="months space-around">
    {#each months as month, index}
      <Calendar
        {btnClass}
        {disabledDates}
        {events}
        {firstDayOfWeek}
        {hasSelection}
        {maxDate}
        {minDate}
        {month}
        {monthDropdown}
        {monthFormat}
        {monthIndicator}
        {nextIcon}
        pageNum={index}
        on:cancel={cancel}
        on:hover={onHover}
        on:nextMonth={onNextMonth}
        on:pageChange={onPageChange}
        on:prevMonth={onPrevMonth}
        on:selection={onSelection}
        {prevIcon}
        {singlePicker}
        {selectClass}
        {tempEndDate}
        {tempStartDate}
        {today}
        {weekGuides}
        {weekNumbers}
        {yearDropdown}
      />
    {/each}
  </div>

  {#if timePicker}
    <div class="hours space-around vcenter">
      <TimePicker
        {btnClass}
        dateReference={tempStartDate}
        {maxDate}
        {minDate}
        {minuteIncrement}
        on:timeChange={onStartTimeChange}
        {secondIncrement}
        {selectClass}
        {timePickerControls}
        {timePicker24Hour}
        {timePickerSeconds}
      />

      {#if !singlePicker}
        <TimePicker
          {btnClass}
          dateReference={tempEndDate}
          {maxDate}
          {minDate}
          {minuteIncrement}
          on:timeChange={onEndTimeChange}
          {secondIncrement}
          {selectClass}
          {timePickerControls}
          {timePicker24Hour}
          {timePickerSeconds}
        />
      {/if}
    </div>
  {/if}
  <div class="actions hcenter vcenter">
    {#if todayBtn}
      <button
        aria-disabled={isSameMonth(today, months[0])}
        aria-label="Show the today's month"
        class={actionBtnClass}
        disabled={isSameMonth(today, months[0])}
        on:click={goToToday}
        title="Show the today's month"
        type="button"
      >
        {todayBtnText}
      </button>
    {/if}
    {#if resetViewBtn}
      <button
        aria-disabled={!canResetView}
        aria-label="Show the current selection's start month"
        class={actionBtnClass}
        disabled={!canResetView}
        on:click={resetView}
        title="Show the current selection's start month"
        type="button"
      >
        {@html resetViewBtnText}
      </button>
    {/if}
    <button
      aria-disabled={!canApply}
      aria-label="Cancel the current selection and revert to previous start and
			end dates"
      class={actionBtnClass}
      disabled={!canApply}
      on:click={cancel}
      title="Cancel the current selection and revert to previous start and end
			dates"
      type="button"
    >
      {cancelBtnText}
    </button>

    <button
      aria-disabled={!canApply}
      aria-label="Apply the current selection"
      class={actionBtnClass}
      disabled={!canApply}
      title="Apply the current selection"
      type="submit"
    >
      {applyBtnText}
    </button>
  </div>
</form>

<style>
  .date-range-picker > * {
    display: flex;
  }
  .date-range-picker :global(.space-between) {
    display: flex;
    justify-content: space-between;
  }
  .date-range-picker :global(.space-around) {
    display: flex;
    justify-content: space-around;
  }
  .date-range-picker > :global(.vcenter) {
    align-items: center;
  }
  .date-range-picker > :global(.hcenter) {
    justify-content: center;
  }
  .date-range-picker :global(small) {
    font-size: 0.68rem;
  }

  /*
	https://webaim.org/resources/contrastchecker/
	WCAG AAA Compliant: #595959 on #FFFFFF background
	WCAG AA Compliant: #757575 on #FFFFFF background
	*/
  .date-range-picker :global(:not(:disabled).muted) {
    color: #757575;
  }
  .date-range-picker :global(.row) {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .date-range-picker :global(.cell),
  .date-range-picker :global(.day::after) {
    width: 30px;
    height: 30px;
  }
  .date-range-picker :global(.cell) {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /*
    Swap border radius of the start and end dates when in rtl
  */
  .date-range-picker[dir='rtl'] :global(.end-date::after) {
    border-radius: 100% 0 0 100%;
  }
  .date-range-picker[dir='rtl'] :global(.start-date::after) {
    border-radius: 0 100% 100% 0;
  }
  .months {
    flex-wrap: wrap;
  }
  .months > :global(*) {
    padding: 1rem;
  }
  .actions {
    padding: 2rem 0;
  }
  .readout {
    background: var(--drp-theme-readout-bg);
    padding: 10px;
    color: var(--drp-theme-readout-c);
  }
  form {
    display: grid;
    grid-template-rows: auto auto 1fr;
  }
  form.has-label {
    grid-template-rows: 4rem auto auto 1fr;
  }
</style>
