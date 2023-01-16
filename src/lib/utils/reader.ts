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
    percent: number | undefined;
    chunks?: Uint8Array[];
    controller?: ReadableStreamDefaultController<any>;
    reader?: ReadableStreamDefaultReader<Uint8Array> | undefined;
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
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let received = 0;
  let contentLength = 0;
  const getPercent = () => {
    if (contentLength) return Math.floor((received * 100) / contentLength);
  };
  const getStatus = (percent: number | undefined) => {
    if (percent === undefined) {
      return undefined;
    }
    if (percent === 0) {
      return 'starting';
    }
    if (percent > 0 && percent < 100) {
      return 'reading';
    }
    if (percent === 100) {
      return 'done';
    }
  };
  const chunks: Uint8Array[] = [];

  return {
    getStream: (res: Response) =>
      new ReadableStream({
        start(controller) {
          reader = res.body?.getReader();
          contentLength = parseInt(res.headers.get('content-length') || '0');

          store.set({ total: contentLength, reader });

          return pump();

          function pump(): any {
            return reader?.read().then(({ done, value }: ReadableStreamReadResult<any>) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }

              received += value.length;
              const percent = getPercent();
              const status = getStatus(percent);
              chunks.push(value);

              // percent && percent >= 50 && reader.cancel();

              // Update store
              store.update((items: any) => {
                return {
                  ...items,
                  received,
                  percent,
                  chunks,
                  controller,
                  status
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

const readerMap: Map<
  string,
  {
    init: (fetch: () => Promise<any>) => void;
    getResult: () => any;
    store: any;
    reader?: ReadableStreamDefaultReader<Uint8Array>;
    controller?: ReadableStreamDefaultController<any>;
    unsubscribe?: () => void;
  }
> = new Map();

export function register({ filename, url }: { filename: any; url: any }) {
  let _result: Promise<any>;

  const init = (fetch: () => Promise<any>) => {
    _result = fetch();
  };
  const getResult = () => _result;

  const initializer = {
    init,
    getResult,
    store: createStore(),
    reader: undefined,
    controller: undefined,
    unsubscribe: undefined
  };

  const data = readerMap.set(filename, initializer).get(filename) || initializer;

  return {
    store: data.store,
    start: () => {
      const { fetch, store } = read(`${url}/${filename}`, data.store);
      if (!data.controller) {
        data.init(fetch);
        data.store = store;
        store.reset();
        data.unsubscribe = store.subscribe(
          async (val: {
            percent: number | undefined;
            controller: ReadableStreamDefaultController<any>;
            reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
          }) => {
            if (!data.controller) {
              data.controller = val.controller;
              data.reader = val.reader;
            }
            const perc = val.percent;
            if (perc === 100) {
              data.controller = undefined;
              data.unsubscribe?.();
            }
          }
        );
      } else {
        try {
          data.controller.close();
          data.reader?.cancel();
          data.unsubscribe?.();
          data.controller = undefined;
          data.reader = undefined;
          setTimeout(() => {
            data.store.reset();
          }, 200);
        } catch (err) {
          console.log(err);
        }
      }
      return { stream: data.getResult };
    }
  };
}

export default function read(
  file: RequestInfo | URL,
  store: {
    update: (arg0: (items: any) => any) => void;
    set: (value: any) => void;
    subscribe: any;
    reset: any;
  }
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
