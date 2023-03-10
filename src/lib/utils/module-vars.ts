export const key = {};
export const players = new Set<Player>();
export const stack: Set<HTMLVideoElement> = new Set<HTMLVideoElement>();

export interface Player<PlayerType = Record<any, any>> {
  element?: HTMLVideoElement;
  promise: Promise<any>;
}