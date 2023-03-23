export function format(seconds: number, prefix = '') {
  if (isNaN(seconds)) return '...';

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  const printMinutes = minutes < 10 ? '0' + minutes : minutes;
  const printSeconds = seconds < 10 ? '0' + seconds : seconds;

  return `${prefix}${printMinutes}:${printSeconds}`;
}
