import { addMonths, startOfYear } from 'date-fns';
import { localeFormat } from './locale-format';

export const buildMonthDropdown = (mo: Date, format: string) => {
  if (!(mo instanceof Date)) return false;
  const yrStart = startOfYear(mo);

  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m, i) => {
    const value = addMonths(yrStart, m);

    return { value, text: localeFormat(value, format) };
  });
};
