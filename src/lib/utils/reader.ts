import { writable } from 'svelte/store';
import { streams } from '$lib/stores';
import { Blob as Buffer } from 'buffer';
import type { Stream } from '$lib/types';
import { browser } from '$app/environment';

function createStore(id: string) {
  const defaults: Stream = {
    received: undefined,
    total: 0,
    percent: undefined,
    controller: undefined,
    reader: undefined
  };
  let stream = writable(defaults, (set) => {
    return () => {
      set(defaults);
      streams.del(id);
    };
  });

  return stream;
}

function bodyReader(store: {
  update: (arg0: (items: any) => any) => void;
  set: (value: any) => void;
}) {
  let reader: ReadableStreamDefaultReader<any> | undefined;
  let closed = false;
  let received = 0;
  let contentLength: number;
  const getPercent = () => {
    if (contentLength) return Math.floor((received * 100) / contentLength);
    else 0;
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
    stream?: Promise<any>;
    store: any;
    reader?: ReadableStreamDefaultReader<any>;
    controller?: ReadableStreamDefaultController<any>;
    unsubscribe?: () => void;
  }
> = new Map();

export function register(
  { filename, url }: { filename?: string; url: string } = { filename: '', url: '' }
) {
  const path = url.concat(filename ? `/${filename}` : '');
  filename = filename ?? path;

  const initializer = {
    stream: undefined,
    store: createStore(path),
    reader: undefined,
    controller: undefined,
    unsubscribe: undefined
  };

  const data = readerMap.set(filename, initializer).get(filename) || initializer;

  return {
    store: data.store,
    start: (token?: string) => {
      const { fetch } = read(path, data.store);
      if (!data.controller) {
        data.stream = fetch(token);
        data.unsubscribe = data.store.subscribe(
          (stream: {
            percent: number | undefined;
            controller: ReadableStreamDefaultController<any>;
            reader: ReadableStreamDefaultReader<any> | undefined;
          }) => {
            if (!data.controller) {
              data.controller = stream.controller;
              data.reader = stream.reader;
            }
            streams.put({ id: path, stream });
            if (stream.percent === 100) {
              data.controller = undefined;
              data.reader = undefined;
              data.stream = undefined;
              data.unsubscribe?.();
            }
          }
        );
      } else {
        try {
          /**
           * If start has been called again before controller was done:
           */
          data.controller?.close();
          data.reader?.cancel();
          data.reader = undefined;
          data.controller = undefined;
          data.stream = undefined;
          data.unsubscribe?.();
        } catch (reason) {
          console.error('[READABLESTREAM]', reason);
        }
      }
      return data.stream;
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
      .then((blob) =>
        browser
          ? new Blob([blob], { type: contentType })
          : new Buffer([blob] as any[], { type: contentType })
      )
      .then((blob) => {
        return { blob, filesize: blob.size };
      });
  };
  const { getStream } = bodyReader(store);

  return {
    fetch: async (token?: string) => {
      const headers = {
        Accept: 'application/json',
        'Accept-Encoding': 'identity'
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
        .catch((reason) => console.error('[FETCH]', reason));
    }
  };
}
