import { isSameMonth, subMonths } from 'date-fns';

export const isPrevMonth = (thisMonth: Date, date: Date) =>
  isSameMonth(subMonths(thisMonth, 1), date);
