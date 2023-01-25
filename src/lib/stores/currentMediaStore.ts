import { IMAGE, VIDEO } from '$lib/utils/const';
import { writable, type Writable } from 'svelte/store';
import { images, videos } from '.';

function createStore() {
  const { update, subscribe } = writable(null as any | null);

  function getStoreByEndpoint(endpoint: string | null) {
    if (endpoint === IMAGE) return images;
    if (endpoint === VIDEO) return videos;
    return writable();
  }

  return {
    update: (endpoint: string) => update(() => getStoreByEndpoint(endpoint)),
    subscribe
  };
}
export default createStore();
