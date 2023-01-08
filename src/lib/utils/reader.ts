import { writable } from 'svelte/store';

function createStore() {
  const defaults = {
    current: 0,
    total: 0,
    percent: 0,
    controller: null,
    reader: null
  } as unknown as {
    current: number;
    total: number;
    percent: number;
    chunks?: Uint8Array[];
    controller?: ReadableStreamDefaultController<any>;
  };
  const { subscribe, update } = writable(defaults);

  return {
    subscribe,
    update,
    reset: () => update(() => defaults)
  };
}

function bodyReader(store: { update: (arg0: (items: any) => any) => void }) {
  const chunks: Uint8Array[] = [];
  const percent = (received: number, total: number) => {
    return Math.floor((received * 100) / total);
  };
  let receivedLength = 0;

  return {
    getStream: (res: Response) =>
      new ReadableStream({
        start(controller) {
          const reader = res.body?.getReader();
          const contentLength = parseInt(res.headers.get('content-length') || '0');

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
                  total: contentLength,
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

  let _stream: undefined;

  const getStream = () => _stream;
  const setStream = (stream = () => void 0) => (_stream = stream());

  readerMap.set(name, {
    setStream,
    getStream,
    store: createStore(),
    controller: null,
    unsubscribe: null
  });

  const data = readerMap.get(name);
  return {
    store: data.store,
    start: () => {
      const { fetch, store } = read(`${url}/${name}`, data.store);
      if (data.controller) {
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
      } else {
        data.setStream(fetch);
        data.store = store;
        data.unsubscribe = store.subscribe((val: { percent: any; controller: any }) => {
          const perc = val.percent;
          !data.controller && (data.controller = val.controller);
          if (perc === 100) {
            data.controller = null;
            data.store.reset();
            data.unsubscribe();
          }
        });
      }
      return { stream: data.getStream };
    }
  };
}

export default function read(file: RequestInfo | URL, store: any) {
  let contentType: string | null;
  const process = async (response: Response) => {
    if (contentType?.startsWith('text')) {
      return response.text();
    } else {
      return await response.blob().then((blob) => {
        return URL.createObjectURL(blob);
      });
    }
  };
  const { getStream } = bodyReader(store);

  return {
    fetch: async () => {
      return await fetch(file, {
        method: 'GET',
        credentials: 'include'
      })
        .then(async (res) => {
          contentType = res.headers.get('content-type');
          return await getStream(res);
        })
        .then((stream) => new Response(stream))
        .then(process)
        .catch((err) => console.error(err));
    },
    store
  };
}
