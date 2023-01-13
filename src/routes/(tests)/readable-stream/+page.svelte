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
  const promise = () => new Promise(() => void 0);

  let imageStream: Promise<any>;
  let imagePercentage: number;
  let imageLabel: string;
  let imageFilesize: Promise<unknown> = promise();

  let textStream: Promise<any>;
  let textPercentage: number;
  let textLabel: string;
  let textFilesize: Promise<unknown> = promise();

  let zipStream: Promise<any>;
  let zipPercentage: number;
  let zipLabel: string;
  let zipFilesize: Promise<unknown> = promise();

  let docStream: Promise<any>;
  let docPercentage: number;
  let docLabel: string;
  let docFilesize: Promise<unknown> = promise();

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
  $: imageStream?.then((res) => (imageFilesize = getFilesize(res)));
  $: textStream?.then((res) => (textFilesize = getFilesize(res)));
  $: zipStream?.then((res) => (zipFilesize = getFilesize(res)));
  $: docStream?.then((res) => (docFilesize = getFilesize(res)));

  // Configure button labels based on percentage
  $: imageLabel = getLabel(imagePercentage);
  $: textLabel = getLabel(textPercentage);
  $: zipLabel = getLabel(zipPercentage);
  $: docLabel = getLabel(docPercentage);

  /**
   * Subscribe to registered stores for actual streaming data
   * store values: percent, current, total, chunks, controller
   */
  imageStore.subscribe(({ percent }: { percent: number }) => {
    imagePercentage = percent;
  });
  textStore.subscribe(({ percent }: { percent: number }) => {
    textPercentage = percent;
  });
  zipStore.subscribe(({ percent }: { percent: number }) => {
    zipPercentage = percent;
  });
  docStore.subscribe(({ percent }: { percent: number }) => {
    docPercentage = percent;
  });

  onMount(() => {
    if (autostart) {
      imageStream = imageStart().stream();
      textStream = textStart().stream();
      zipStream = zipStart().stream();
      docStream = docStart().stream();
    }
  });

  async function getFilesize(stream: Promise<any>) {
    const res = await stream;
    const filesize = res.filesize;
    if (filesize) {
      return displayFilesize(filesize);
    }
  }

  function displayFilesize(filesize: any) {
    const byte = filesize;
    let kilobyte;
    let megabyte;
    const kb = (kilobyte = byte / 1024) > 1 && Math.floor(kilobyte);
    const mb = (megabyte = kilobyte / 1024) > 1 && Math.floor(megabyte);
    const unit = mb ? 'MByte' : kb ? 'KByte' : 'Byte';
    return `(${mb || kb || byte} ${unit})`;
  }

  function getLabel(percentage: number) {
    return percentage > 0 && percentage < 100 ? 'cancel' : 'start';
  }
</script>

<Blurb>
  <div class="outer one" slot="one">
    <div class="read-box">
      {#if imageStream}
        {#await imageStream}
          <Loader store={imageStore} bind:percentage={imagePercentage} />
        {:then result}
          <Viewer blob={result.url} title="sample.jpg" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (imageStream = imageStart().stream())} class="button"
        >{imageLabel}</button
      >
      <div class="fileinfo">
        {#await imageFilesize}<span class="waiting">waiting for</span>{:then filesize}<span
            class="filesize">{filesize}</span
          >{/await}
        <span class="filename">sample.jpg</span>
      </div>
    </div>
  </div>

  <div class="outer two" slot="two">
    <div class="read-box" style="">
      {#if textStream}
        {#await textStream}
          <Loader store={textStore} bind:percentage={textPercentage} />
        {:then result}
          <Viewer blob={result.url} title="sample.txt" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (textStream = textStart().stream())} class="button"
        >{textLabel}</button
      >
      <div class="fileinfo">
        {#await textFilesize}<span class="waiting">waiting for</span>{:then filesize}<span
            class="filesize">{filesize}</span
          >{/await}
        <span class="filename">sample.txt</span>
      </div>
    </div>
  </div>

  <div class="outer three" slot="three">
    <div class="read-box" style="">
      {#if zipStream}
        {#await zipStream}
          <Loader store={zipStore} bind:percentage={zipPercentage} />
        {:then result}
          <Viewer blob={result.url} title="sample.zip" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (zipStream = zipStart().stream())} class="button">{zipLabel}</button>
      <div class="fileinfo">
        {#await zipFilesize}<span class="waiting">waiting for</span>{:then filesize}<span
            class="filesize">{filesize}</span
          >{/await}
        <span class="filename">sample.zip</span>
      </div>
    </div>
  </div>

  <div class="outer fore" slot="fore">
    <div class="read-box" style="">
      {#if docStream}
        {#await docStream}
          <Loader store={docStore} bind:percentage={docPercentage} />
        {:then result}
          <Viewer blob={result?.url} title="sample.pdf" />
        {/await}
      {/if}
    </div>
    <div class="controls">
      <button on:click={() => (docStream = docStart().stream())} class="button">{docLabel}</button>
      <div class="fileinfo">
        {#await docFilesize}<span class="waiting">waiting for</span>{:then filesize}<span
            class="filesize">{filesize}</span
          >{/await}
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
  .fileinfo .waiting {
    font-size: 0.5rem;
    opacity: 0.6;
  }
</style>
