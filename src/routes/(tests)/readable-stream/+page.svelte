<script lang="typescript">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { register } from '$lib/utils/reader';
  import Layout from './Layout.svelte';
  import Blurb from './Blurb.svelte';

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
  const url = 'https://anito.de';

  let imageStream: Promise<string | void | undefined>;
  let imagePercentage: number;
  let imageLabel: string;

  let textStream: Promise<string | void | undefined>;
  let textPercentage: number;
  let textLabel: string;

  let zipStream: Promise<string | void | undefined>;
  let zipPercentage: number;
  let zipLabel: string;

  let docStream: Promise<string | void | undefined>;
  let docPercentage: number;
  let docLabel: string;

  /**
   * Register files to be read from external source
   *
   * register - takes an object with two self-explanatory keys: filename and url
   * the method will returns a start method and a svelte store
   * @returns {start, store} object
   * start - method to start the file reading process. 'start' itself will return a stream method
   * - 'stream' receives a promise you can use for e.g. a loading spinner
   * store - a svelte store you can subscribe to receive the following props:
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
    filename: 'sample.docx',
    url
  });

  // Do something with the stream(s)
  $: imageStream && imageStream.then((res) => console.log(res));
  $: textStream && textStream.then((res) => console.log(res));
  $: zipStream && zipStream.then((res) => console.log(res));
  $: docStream && docStream.then((res) => console.log(res));
  // Configure button labels depending on percentage
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

  function getLabel(percentage: number) {
    return percentage > 0 && percentage < 100 ? 'cancel' : 'start';
  }
</script>

<Layout>
  <Blurb>
    <div class="outer" slot="one">
      <div class="read-box">
        {#if imageStream}
          {#await imageStream}
            <div class="wait">
              <h5 class="inner">{imagePercentage}</h5>
            </div>
          {:then src}
            <div in:fade={{ duration: 500 }}>
              <img {src} alt="" width="300" />
            </div>
            <label for="">{src}</label>
          {/await}
        {/if}
      </div>
      <div class="controls">
        <div class="filename">sample.jpg</div>
        <button on:click={() => (imageStream = imageStart().stream())} class="start-button"
          >{imageLabel}</button
        >
      </div>
    </div>

    <div class="outer" slot="two">
      <div class="read-box" style="">
        {#if textStream}
          {#await textStream}
            <div class="wait">
              <h5 class="inner">{textPercentage}</h5>
            </div>
          {:then file}
            <div in:fade={{ duration: 500 }} style="font-size: 0.4em;">
              {@html file}
            </div>
          {/await}
        {/if}
      </div>
      <div class="controls">
        <div class="filename">sample.txt</div>
        <button on:click={() => (textStream = textStart().stream())} class="start-button"
          >{textLabel}</button
        >
      </div>
    </div>

    <div class="outer" slot="three">
      <div class="read-box" style="">
        {#if zipStream}
          {#await zipStream}
            <div class="wait">
              <h5 class="inner">{zipPercentage}</h5>
            </div>
          {:then file}
            <div in:fade={{ duration: 500 }} style="font-size: 0.4em;">
              {file}
            </div>
          {/await}
        {/if}
      </div>
      <div class="controls">
        <div class="filename">sample.zip</div>
        <button on:click={() => (zipStream = zipStart().stream())} class="start-button"
          >{zipLabel}</button
        >
      </div>
    </div>

    <div class="outer" slot="fore">
      <div class="read-box" style="">
        {#if docStream}
          {#await docStream}
            <div class="wait">
              <h5 class="inner">{docPercentage}</h5>
            </div>
          {:then file}
            <div in:fade={{ duration: 500 }} style="font-size: 0.4em;">
              {file}
            </div>
          {/await}
        {/if}
      </div>
      <div class="controls">
        <div class="filename">sample.docx</div>
        <button on:click={() => (docStream = docStart().stream())} class="start-button"
          >{docLabel}</button
        >
      </div>
    </div>
  </Blurb>
</Layout>

<style>
  .outer {
    --height: 50px;
    position: relative;
  }
  .read-box {
    display: flex;
    width: 300px;
    height: 350px;
    min-width: 300px;
    min-height: 330px;
    text-align: justify;
    padding: 10px;
    background-color: #69696920;
    margin: 0 auto;
    position: relative;
    overflow: auto;
  }
  .wait {
    display: flex;
    justify-content: center;
    flex: 1 0 auto;
    height: 100%;
    font-size: 7em;
  }
  .wait .inner {
    display: flex;
    align-items: center;
  }
  .controls {
    position: absolute;
    width: 100%;
    height: var(--height);
    left: 0;
    bottom: 0;
    background: var(--background-100);
  }
  .start-button {
    display: inline-block;
    position: absolute;
    bottom: 10px;
    width: 100px;
    left: 50%;
    margin-left: -50px;
    text-transform: uppercase;
  }
  .read-box label {
    position: absolute;
    font-size: 0.7em;
    top: 0;
    left: 0;
    right: 0;
    bottom: var(--height);
    padding: 15px;
    overflow: hidden;
    background-color: #00000040;
    color: #000000;
    z-index: 1;
  }
</style>
