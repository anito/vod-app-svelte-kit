declare global {
  interface WindowEventMap {
    test: CustomEvent;
  }
}

export interface DayMeta {
  date: Date;
  events: Date[];
  isToday: boolean;
  isWeekend: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
  isStartDate: boolean;
  isDisabled: boolean;
  isEndDate: boolean;
  isWithinSelection: boolean;
}

export interface WeekMeta {
  weeksFromToday: number;
  weekNumber: number;
  daysInWeek: DayMeta[];
}

export interface DateMeta {
  date: Date;
  events: Date[];
  isToday: boolean;
  isWeekend: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
  isStartDate: boolean;
  isDisabled: boolean;
  isEndDate: boolean;
  isWithinSelection: boolean;
}

export interface DatePickerOptions {
  date: Date;
  tempEndDate: Date;
  events: Date[];
  month: Date;
  singlePicker: boolean;
  tempStartDate: Date;
  today: Date;
  maxDate: Date;
  minDate: Date;
  disabledDates: Date[];
  firstDayOfWeek: string;
  hasSelection?: boolean;
}
