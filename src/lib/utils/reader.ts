import { writable } from 'svelte/store';

function createStore() {
  const defaults = {
    current: undefined,
    total: undefined,
    percent: undefined,
    controller: undefined,
    reader: undefined
  } as unknown as {
    current: number;
    total: number;
    percent: number;
    chunks?: Uint8Array[];
    controller?: ReadableStreamDefaultController<any>;
  };
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    update,
    reset: () => update(() => defaults),
    set
  };
}

function bodyReader(store: {
  update: (arg0: (items: any) => any) => void;
  set: (value: any) => void;
}) {
  let receivedLength = 0;
  let previousPercent = 0;
  const percent = (received: number, total: number) => {
    const res = Math.floor((received * 100) / total);
    return (!isNaN(res) && (previousPercent = res)) || previousPercent;
  };
  const chunks: Uint8Array[] = [];

  return {
    getStream: (res: Response) =>
      new ReadableStream({
        start(controller) {
          const reader = res.body?.getReader();
          const contentLength = parseInt(res.headers.get('content-length') || '0');

          store.set({ total: contentLength });

          return pump();

          function pump(): any {
            return reader?.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }

              receivedLength += value.length;
              chunks.push(value);

              // Update store
              store.update((items: any) => {
                return {
                  ...items,
                  current: receivedLength,
                  percent: percent(receivedLength, contentLength),
                  chunks,
                  controller
                };
              });

              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          }
        },
        cancel(reason) {
          console.log('The ReadableStream was cancelled', reason);
        }
      })
  };
}

const readerMap = new Map();
export function register(client: { filename: any; url: any }) {
  const { filename: name, url } = client;

  let _result: Promise<any>;

  const init = (fetch: () => Promise<any>) => {
    _result = fetch();
  };
  const getResult = () => _result;

  readerMap.set(name, {
    init,
    getResult,
    store: createStore(),
    controller: null,
    unsubscribe: null
  });

  const data = readerMap.get(name);
  return {
    store: data.store,
    start: () => {
      const { fetch, store } = read(`${url}/${name}`, data.store);
      if (!data.controller) {
        data.init(fetch);
        data.store = store;
        data.store.reset();
        data.unsubscribe = store.subscribe(async (val: { percent: any; controller: any }) => {
          const perc = val.percent;
          !data.controller && (data.controller = val.controller);
          if (perc === 100) {
            data.controller = null;
            data.unsubscribe();
          }
        });
      } else {
        try {
          data.controller.close();
        } catch (err) {
          console.log(err);
        }
        data.unsubscribe();
        data.controller = null;
        setTimeout(() => {
          data.store.reset();
        }, 200);
      }
      return { stream: data.getResult };
    }
  };
}

export default function read(
  file: RequestInfo | URL,
  store: { update: (arg0: (items: any) => any) => void; set: (value: any) => void; subscribe: any }
) {
  let contentType: string;
  const process = async (response: Response) => {
    return await response
      .blob()
      .then((blob) => new Blob([blob], { type: contentType }))
      .then((blob) => {
        return { url: URL.createObjectURL(blob), filesize: blob.size };
      });
  };
  const { getStream } = bodyReader(store);

  return {
    fetch: async () => {
      return await fetch(file, {
        method: 'GET',
        credentials: 'include'
      })
        .then(async (res) => {
          contentType = res.headers.get('content-type') || 'text/plain';
          return await getStream(res);
        })
        .then((stream) => new Response(stream))
        .then(process)
        .catch((err) => console.error(err));
    },
    store
  };
}
