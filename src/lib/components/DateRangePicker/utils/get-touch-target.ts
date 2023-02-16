export const getTouchTarget = (e: TouchEvent) => {
  if ('changedTouches' in e) {
    const loc = e.changedTouches[0];

    return document.elementFromPoint(loc.clientX, loc.clientY) as HTMLSelectElement;
  }
};
