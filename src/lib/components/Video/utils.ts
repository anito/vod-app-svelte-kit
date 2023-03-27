export function format(seconds: number, prefix = '') {
  if (isNaN(seconds)) return '...';

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  const printMinutes = minutes < 10 ? '0' + minutes : minutes;
  const printSeconds = seconds < 10 ? '0' + seconds : seconds;

  return `${prefix}${printMinutes}:${printSeconds}`;
}

export const players = new Set<Player>();
export const streams: Set<HTMLVideoElement> = new Set<HTMLVideoElement>();

export interface Player<PlayerType = Record<any, any>> {
  element?: HTMLVideoElement;
  promise: Promise<any>;
}