import { get } from 'svelte/store';
import {
  addDays,
  differenceInCalendarWeeks,
  endOfMonth,
  eachWeekOfInterval,
  getWeek,
  addWeeks,
  subMonths,
  startOfWeek
} from 'date-fns';
import { dayOffset } from './day-offset';
import { getDayMetaData } from './get-day-meta-data';
import localeStore from '../stores/localeStore';
import type { DatePickerOptions, WeekMeta } from '../types';

/**
 *
 * @param {Object} getDayMetaDataParams
 * @prop {Date} date
 * @prop {Date} tempEnd
 * @prop {Date[]} events
 * @prop {Date} month
 * @prop {boolean} singlePicker
 * @prop {Date} tempStart
 * @prop {Date} today
 * @prop {Date} maxDate
 * @prop {Date} minDate
 * @prop {Date[]} disabledDates
 *
 * @returns {Day}
 */

/**
 *
 * @param {Date} start
 * @param {MetaDatePickerOptions} params
 *
 * @returns {Date[]}
 */

const buildWeek = (start: Date, params: DatePickerOptions) =>
  [0, 1, 2, 3, 4, 5, 6].map((w, i) => getDayMetaData({ ...params, date: addDays(start, w) }));

export const getCalendarWeeks = (params: DatePickerOptions): WeekMeta[] => {
  const { month, firstDayOfWeek, today } = params;
  const weekStartsOn = dayOffset(firstDayOfWeek);
  const start = startOfWeek(endOfMonth(subMonths(month, 1)));

  return eachWeekOfInterval(
    {
      start,
      end: addWeeks(start, 5)
    },
    { weekStartsOn, locale: get(localeStore) }
  ).map((date) => ({
    weeksFromToday: differenceInCalendarWeeks(date, today, {
      weekStartsOn,
      locale: get(localeStore)
    }),
    weekNumber: getWeek(date, { weekStartsOn }),
    daysInWeek: buildWeek(date, params)
  }));
};
