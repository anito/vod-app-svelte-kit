import { isSameMonth, addMonths } from 'date-fns';

export const isNextMonth = (thisMonth: Date, date: Date) =>
  isSameMonth(addMonths(thisMonth, 1), date);
