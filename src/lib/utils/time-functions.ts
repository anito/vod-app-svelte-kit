import { compareAsc, fromUnixTime, formatISO9075 } from 'date-fns';

export function hasStarted(date: number | Date) {
  return compareAsc(new Date(), date) !== -1 ? true : false;
}
export function isExpired(endDate: number | Date) {
  if (!(endDate instanceof Date)) endDate = fromUnixTime(endDate);
  return compareAsc(new Date(), endDate) !== -1 ? true : false;
}
export function toLocalDate(
  date: string | number | Date,
  locale = 'de-DE',
  options = {}
) {
  let defaults = {
    year: false,
    month: false, // 2-digit
    day: false,
    hour: false,
    minute: false,
  };
  options = { ...defaults, ...options };
  return new Date(date).toLocaleDateString('de-DE', options);
}
export function toLocalTime(
  date: string | number | Date,
  locale = 'de-DE',
  options = {}
) {
  let defaults = {
    year: false,
    month: false, // 2-digit
    day: false,
    hour: false,
    minute: false,
  };
  options = { ...defaults, ...options };
  return new Date(date).toLocaleDateString('de-DE', options);
}
export function toISODate(date: Date, tillMidnight?: boolean) {
  return formatISO9075(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      tillMidnight ? 23 : date.getHours(),
      tillMidnight ? 59 : date.getMinutes(),
      tillMidnight ? 59 : date.getSeconds()
    )
  );
}
export function isToday(date: string | number | Date) {
  let today = new Date();
  let midnight =
    today.getTime() -
    today.getHours() * 3600 * 1000 -
    today.getMinutes() * 60 * 1000 -
    today.getSeconds() * 1000;

  let dateTime = new Date(date).getTime();
  return midnight < dateTime;
}
export function elapsedFormatted(start = Date.now()) {
  let _sec = Math.floor((Date.now() - start) / 1000);
  let min = Math.floor(_sec / 60);
  let sec = Math.floor(_sec % 60);
  sec = sec < 10 ? 0 + sec : sec;
  return `${min}:${sec}`;
}
