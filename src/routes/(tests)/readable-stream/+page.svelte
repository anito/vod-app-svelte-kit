<script lang="ts">
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { register } from '$lib/utils/reader';
  import Blurb from './Blurb.svelte';
  import Viewer from './Viewer.svelte';
  import Loader from './Loader.svelte';

  /**
   * Autostart
   * - if you want the stream to start automatically, put the start method in onMount:
   * onMount(() => {
   *  myStreamPromise = myStart().stream()
   * })
   *
   * Manual start
   * - to control the start of the stream add a button with a clickHandler like so:
   * <button on:click={() => myStreamPromise = myStart().stream()}>start</button>
   */
  const autostart = false;
  const url = dev ? 'https://anito.dev' : 'https://anito.de';

  let imageStream: Promise<any>;
  let imageData: Promise<{
    url: string;
    filesize: number;
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  }>;
  let imageStoreData: any;

  let textStream: Promise<any>;
  let textData: Promise<{
    url: string;
    filesize: number;
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  }>;
  let textStoreData: any;

  let zipStream: Promise<any>;
  let zipData: Promise<{
    url: string;
    filesize: number;
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  }>;
  let zipStoreData: any;

  let docStream: Promise<any>;
  let docData: Promise<{
    url: string;
    filesize: number;
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  }>;
  let docStoreData: any;

  /**
   * Register external ressources
   *
   * register - takes an object with two keys:
   *  - filename (e.g. sample.zip) and
   *  - url: e.g. https://example.com
   * The 'register' method will return an object { start, store }
   * 'start': a function that returns a function 'stream' which receives a promise you can use for e.g. a loading spinner
   * 'store' - a svelte store you can subscribe to to receive the following props:
   * - percentage, current, total, chunks, controller (to controller.close() the pipe)
   */
  const { start: imageStart, store: imageStore } = register({
    filename: 'sample.jpg',
    url
  });
  const { start: textStart, store: textStore } = register({
    filename: 'sample.txt',
    url
  });
  const { start: zipStart, store: zipStore } = register({
    filename: 'sample.zip',
    url
  });
  const { start: docStart, store: docStore } = register({
    filename: 'sample.pdf',
    url
  });

  // Do something with the stream(s)
  $: imageData = imageStream?.then((res) => res);
  $: textData = textStream?.then((res) => res);
  $: zipData = zipStream?.then((res) => res);
  $: docData = docStream?.then((res) => res);

  // Configure button labels based on bound percentage property in Loader.svelte
  $: imageButtonLabel = getLabel(imageStoreData);
  $: textButtonLabel = getLabel(textStoreData);
  $: zipButtonLabel = getLabel(zipStoreData);
  $: docButtonLabel = getLabel(docStoreData);

  onMount(() => {
    if (autostart) {
      imageStream = imageStart().stream?.();
      textStream = textStart().stream?.();
      zipStream = zipStart().stream?.();
      docStream = docStart().stream?.();
    }
  });

  function displayFilesize(filesize: number, decimals: 1 | 2 | 3 | 4 = 2) {
    if (!filesize) return '(click to start)';
    let kilobyte;
    let megabyte;
    const byte = filesize;
    const kb = (kilobyte = byte / 1024) > 1 && kilobyte;
    const mb = (megabyte = kilobyte / 1024) > 1 && megabyte;
    const unit = mb ? 'MByte' : kb ? 'KByte' : 'Byte';
    const to2Decimals = (mb || kb || byte).toFixed(decimals);
    return `(${to2Decimals} ${unit})`;
  }

  function getLabel(data: any) {
    if (data?.status === undefined || data?.status === 'done') return 'Start';
    if (data?.status === 'starting') return 'Starting';
    if (data?.status === 'reading') return 'Cancel';
  }
</script>

<Blurb>
  <div class="outer one" slot="one">
    <div class="read-box">
      {#if imageStream}
        {#await imageStream}
          <Loader store={imageStore} bind:storeData={imageStoreData} />
        {:then result}
          <Viewer src={result.url} title="sample.jpg" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (imageStream = imageStart().stream())} class="button"
        >{imageButtonLabel}</button
      >
      <div class="fileinfo">
        {#await imageData then result}
          <span class="filesize">{displayFilesize(result?.filesize)}</span>
        {/await}
        <span class="filename">sample.jpg</span>
      </div>
    </div>
  </div>

  <div class="outer two" slot="two">
    <div class="read-box" style="">
      {#if textStream}
        {#await textStream}
          <Loader store={textStore} bind:storeData={textStoreData} />
        {:then result}
          <Viewer src={result.url} title="sample.txt" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (textStream = textStart().stream?.())} class="button"
        >{textButtonLabel}</button
      >
      <div class="fileinfo">
        {#await textData then result}
          <span class="filesize">{displayFilesize(result?.filesize)}</span>
        {/await}
        <span class="filename">sample.txt</span>
      </div>
    </div>
  </div>

  <div class="outer three" slot="three">
    <div class="read-box" style="">
      {#if zipStream}
        {#await zipStream}
          <Loader store={zipStore} bind:storeData={zipStoreData} />
        {:then result}
          <Viewer src={result.url} title="sample.zip" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (zipStream = zipStart().stream())} class="button"
        >{zipButtonLabel}</button
      >
      <div class="fileinfo">
        {#await zipData then result}
          <span class="filesize">{displayFilesize(result?.filesize)}</span>
        {/await}
        <span class="filename">sample.zip</span>
      </div>
    </div>
  </div>

  <div class="outer fore" slot="fore">
    <div class="read-box" style="">
      {#if docStream}
        {#await docStream}
          <Loader store={docStore} bind:storeData={docStoreData} />
        {:then result}
          <Viewer src={result?.url} title="sample.pdf" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (docStream = docStart().stream())} class="button"
        >{docButtonLabel}</button
      >
      <div class="fileinfo">
        {#await docData then result}
          <span class="filesize">{displayFilesize(result?.filesize)}</span>
        {/await}
        <span class="filename">sample.pdf</span>
      </div>
    </div>
  </div>
</Blurb>

<style>
  .outer {
    --height: 50px;
    position: relative;
  }
  .read-box {
    display: flex;
    width: 350px;
    min-width: 350px;
    height: 350px;
    min-height: 350px;
    text-align: justify;
    padding: 10px;
    background-color: #69696920;
    margin: 0 auto;
    position: relative;
    overflow: auto;
  }
  .controls {
    position: absolute;
    width: 100%;
    height: var(--height);
    left: 0;
    bottom: 0;
    background: var(--back-grid-item);
  }
  .button,
  .button:focus {
    display: inline-block;
    font-size: 0.9rem;
    position: absolute;
    bottom: 10px;
    width: 100px;
    left: 50%;
    margin-left: -50px;
    outline: 1px solid #000 !important;
    border-radius: 0.15rem;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    text-transform: uppercase;
    padding: 5px 10px;
  }
  .fileinfo {
    display: inline-block;
    padding: 0 10px;
    font: var(--h6) var(--font-mono);
    position: absolute;
    bottom: -20px;
    right: 0;
    font-size: 0.8rem;
    font-family: var(--font-mono);
    opacity: 0.6;
  }
</style>
