<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    addMonths,
    differenceInCalendarMonths,
    differenceInCalendarYears,
    isAfter,
    isBefore,
    isSameMonth,
    isSameYear,
    subMonths,
    type Locale,
  } from 'date-fns';
  import en from 'date-fns/locale/en-US/index.js';
  import {
    buildMonthDropdown,
    buildYearDropdown,
    localeFormat,
  } from '../utils';

  export let locale: Locale = en;
  export let btnClass: string;
  export let month: Date;
  export let monthFormat: string;
  export let monthDropdown: boolean;
  export let maxDate: Date;
  export let minDate: Date;
  export let nextIcon: string;
  export let pageNum: number;
  export let prevIcon: string;
  export let selectClass: string;
  export let yearDropdown: boolean;

  const dispatch = createEventDispatcher();

  interface DateRecord {
    value: Date;
    text: string;
  }

  let selectedMonth: DateRecord;
  let selectedYear: DateRecord;

  $: months = (locale && buildMonthDropdown(month, monthFormat)) || [];
  $: years = months && buildYearDropdown(minDate, maxDate, pageNum);
  $: prevMonth = subMonths(month, 1);
  $: nextMonth = addMonths(month, 1);
  /** @todo Simplify disabling logic */
  $: nextBtnDisabled = isSameMonth(month, maxDate) || isAfter(month, maxDate);
  $: prevBtnDisabled = isSameMonth(month, minDate) || isBefore(month, minDate);

  $: isOptionDisabled = (mo: Date) =>
    (!isSameMonth(mo, minDate) && isBefore(mo, minDate)) ||
    (!isSameMonth(mo, minDate) && isAfter(mo, maxDate));

  function isSelectedMonth(mo: DateRecord) {
    if (isSameMonth(mo.value, month)) {
      setSelectedMonth(mo);
      return true;
    }
    return false;
  }

  function isSelectedYear(yr: DateRecord) {
    if (isSameYear(yr.value, month)) {
      setSelectedYear(yr);
      return true;
    }
    return false;
  }

  async function setSelectedMonth(month: DateRecord) {
    setTimeout(() => (selectedMonth = month));
  }

  async function setSelectedYear(year: DateRecord) {
    setTimeout(() => (selectedYear = year));
  }
</script>

<div class="space-between">
  <button
    aria-disabled={prevBtnDisabled}
    aria-label={`Previous month, ${localeFormat(prevMonth, 'MMMM yyyy')}`}
    class={btnClass}
    disabled={prevBtnDisabled}
    on:click={() => dispatch('prevMonth')}
    title={`Previous month, ${localeFormat(prevMonth, 'MMMM yyyy')}`}
    type="button"
  >
    {@html prevIcon}
  </button>
  <span>
    {#if monthDropdown}
      <select
        aria-label="Month select"
        bind:value={selectedMonth}
        class={selectClass}
        on:change={(e) => {
          let incrementAmount = differenceInCalendarMonths(
            selectedMonth.value,
            month
          );
          dispatch('pageChange', {
            incrementAmount,
          });
        }}
      >
        {#each months as mo}
          <option
            disabled={isOptionDisabled(mo.value)}
            selected={isSelectedMonth(mo)}
            value={mo}
          >
            {mo.text}
          </option>
        {/each}
      </select>
    {:else}
      <small>{localeFormat(month, 'MMMM')}</small>
    {/if}
    {#if yearDropdown}
      <select
        aria-label="Year select"
        bind:value={selectedYear}
        class={selectClass}
        on:change={() =>
          dispatch('pageChange', {
            incrementAmount:
              differenceInCalendarYears(selectedYear.value, month) * 12,
          })}
      >
        {#each years as yr}
          <option
            disabled={isOptionDisabled(yr.value)}
            selected={isSelectedYear(yr)}
            value={yr}
          >
            {yr.text}
          </option>
        {/each}
      </select>
    {:else}
      <small>{localeFormat(month, 'yyyy')}</small>
    {/if}
  </span>
  <button
    aria-disabled={nextBtnDisabled}
    aria-label={`Next month, ${localeFormat(nextMonth, 'MMMM yyyy')}`}
    class={btnClass}
    disabled={nextBtnDisabled}
    on:click={() => dispatch('nextMonth')}
    title={`Next month, ${localeFormat(nextMonth, 'MMMM yyyy')}`}
    type="button"
  >
    {@html nextIcon}
  </button>
</div>
