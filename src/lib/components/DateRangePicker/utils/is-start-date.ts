import { isSameDay, isBefore } from 'date-fns';
import type { DatePickerOptions } from '../types';

/**
 *
 * @param {Object}
 * @property {boolean} hasSelection
 * @property {Date} date
 * @property {Date} tempStartDate
 *
 * @returns {boolean}
 */
export const isStartDate = ({
  hasSelection,
  date,
  tempEndDate,
  tempStartDate
}: DatePickerOptions) => {
  if (!hasSelection && isBefore(tempEndDate, tempStartDate)) {
    return isSameDay(date, tempEndDate);
  }

  return isSameDay(date, tempStartDate);
};
