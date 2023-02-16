import { isSameDay, isAfter } from 'date-fns';
import type { DatePickerOptions } from '../types';

/**
 *
 * @param {Object}
 * @property {boolean} hasSelection
 * @property {Date} date
 * @property {Date} tempStart
 * @property {Date} tempEnd
 *
 * @returns {boolean}
 */
export const isEndDate = ({
  tempEndDate,
  date,
  hasSelection,
  tempStartDate
}: DatePickerOptions) => {
  if (!hasSelection) {
    if (isAfter(tempEndDate, tempStartDate)) {
      return isSameDay(date, tempEndDate);
    }

    return isSameDay(date, tempStartDate);
  }

  return isSameDay(date, tempEndDate);
};
