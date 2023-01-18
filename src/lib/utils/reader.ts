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
  const { subscribe, update, set } = writable(defaults, (set) => {
    console.log('first subscriber');
    return () => {
      set(defaults);
      console.log('no more subscribers');
    };
  });

  return {
    subscribe,
    update,
    set
  };
}

function bodyReader(store: {
  update: (arg0: (items: any) => any) => void;
  set: (value: any) => void;
}) {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let closed = false;
  let received = 0;
  let contentLength = 0;
  const getPercent = () => {
    if (contentLength) return Math.floor((received * 100) / contentLength);
  };
  const getStatus = () => {
    const percent = getPercent();
    if (closed) {
      return 'closed';
    }
    if (percent === 0) {
      return 'starting';
    }
    if (percent && percent > 0 && percent < 100) {
      return 'reading';
    }
    if (percent && percent === 100) {
      return 'done';
    }
    return 'unknown';
  };
  const updateStore = () => {
    const percent = getPercent();
    const status = getStatus();
    store.update((items: any) => {
      return {
        ...items,
        received,
        percent,
        chunks,
        status
      };
    });
  };
  const chunks: Uint8Array[] = [];

  return {
    getStream: (res: Response) =>
      new ReadableStream({
        start(controller) {
          reader = res.body?.getReader();
          reader?.closed.then(() => (closed = true));

          contentLength = parseInt(res.headers.get('content-length') || '0');

          store.set({ total: contentLength, controller, reader });

          return pump();

          function pump(): any {
            return reader?.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream

              if (done) {
                updateStore();
                controller.close();
                return;
              }

              received += value.length;
              chunks.push(value);

              updateStore();

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
    init: (fetch: () => Promise<any>, token?: string) => void;
    getResult: () => any;
    store: any;
    reader?: ReadableStreamDefaultReader<Uint8Array>;
    controller?: ReadableStreamDefaultController<any>;
    unsubscribe?: () => void;
  }
> = new Map();

export function register(
  { filename, url }: { filename?: string; url: string } = { filename: '', url: '' }
) {
  const path = url.concat(filename ? `/${filename}` : '');
  filename = filename ?? path;
  let result: Promise<any>;

  const init = (fetch: (token?: string) => Promise<any>, token?: string) => {
    result = fetch(token);
  };
  const getResult = () => {
    return result;
  };

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
    start: (token?: string) => {
      const { fetch, store } = read(path, data.store);
      if (!data.controller) {
        data.init(fetch, token);
        data.store = store;
        data.unsubscribe = store.subscribe(
          (val: {
            percent: number | undefined;
            controller: ReadableStreamDefaultController<any>;
            reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
          }) => {
            if (!data.controller) {
              data.controller = val.controller;
              data.reader = val.reader;
            }
            if (val.percent === 100) {
              data.controller = undefined;
              data.reader = undefined;
              data.unsubscribe?.();
            }
          }
        );
      } else {
        try {
          data.controller?.close();
          data.reader?.cancel();
          data.unsubscribe?.();
          data.reader = undefined;
          data.controller = undefined;
        } catch (err) {
          console.log('ERROR in ReadableStream', err);
          data.controller = undefined;
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
  }
) {
  let contentType: string;
  const process = async (response: Response) => {
    return await response
      .blob()
      .then((blob) => new Blob([blob], { type: contentType }))
      .then((blob) => {
        return { blob, filesize: blob.size };
      });
  };
  const { getStream } = bodyReader(store);

  return {
    fetch: async (token?: string) => {
      const headers = {
        Accept: 'application/json'
      } as {
        Accept: string;
        Authorization?: string;
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return await fetch(file, {
        method: 'GET',
        credentials: 'include',
        headers
      })
        .then(async (res) => {
          contentType = res.headers.get('content-type') || 'text/plain';
          return await getStream(res);
        })
        .then((stream) => new Response(stream))
        .then(process)
        .catch((err) => console.error('ERROR in Fetch', err));
    },
    store
  };
}
