<script lang="ts">
  import { onMount, getContext, setContext } from 'svelte';
  import Uploader from './_Uploader.svelte';
  import type Snackbar from '@smui/snackbar';
  import { _ } from 'svelte-i18n';
  import type { UploaderOptions } from '$lib/types';

  export { className as class };
  export let type = '';
  export let uid = '';
  export let options: UploaderOptions = {
    path: '',
    uploadMultiple: false,
    parallelUploads: 1,
    maxFiles: 1,
    timeout: 3600 * 1000, // 60min
    maxFilesize: 2 // Megabyte
  };
  export let events: Record<string, any> = {};

  const { showSnackbar }: any = getContext('snackbar');

  let className = '';
  let count = 0;
  let uploader: HTMLDivElement;

  $: fileType = type === 'avatar' ? 'image' : type;
  $: acceptedFiles = `${fileType}/*`;
  $: path = `${type.toLowerCase()}s`;
  $: options = { acceptedFiles, ...options, path };

  onMount(() => {

    Object.entries(events).map(([eventKey, eventFunc]) => {
      uploader.addEventListener(eventKey, eventFunc);
    });

    return () =>
      Object.entries(events).map(([eventKey, eventFunc]) => {
        uploader.removeEventListener(eventKey, eventFunc);
      });
  });

  function onAddedfile({ detail }: CustomEvent) {
    ++count;
  }

  function onRemovedfileHandler({ detail }: CustomEvent) {
    --count;
  }

  function onSuccessHandler(event: CustomEvent) {
    if (options.uploadMultiple) return;
    uploader?.dispatchEvent(new CustomEvent('upload:success', event));
  }

  function onSuccessmultipleHandler(event: CustomEvent) {
    if (!options.uploadMultiple) return;
    uploader?.dispatchEvent(new CustomEvent('upload:successmultiple', event));
  }

  function onErrorHandler({ detail }: CustomEvent) {
    const {file, responseText, request } = detail;
    let message = 'Error'
    if(responseText.data) {
      message = responseText.data.message
    } else if (typeof responseText === 'string') {
      message = responseText;
    }
    showSnackbar(message);
  }
</script>

<div class="uploader-wrapper {className}" bind:this={uploader}>
  <div class="flex justify-between">
    <div class="subheader p-2 pb-3 mr-10">
      <span>{$_('text.file-queue', { values: { count } })}</span>
      <span
        >({$_('text.max-files', {
          values: { ...options }
        })})</span
      >
    </div>
  </div>
  <div class="content-wrapper">
    <Uploader
      on:uploader:successmultiple={onSuccessmultipleHandler}
      on:uploader:success={onSuccessHandler}
      on:uploader:error={onErrorHandler}
      on:uploader:complete={() => console.log('Complete')}
      on:uploader:processing={() => console.log('Processing')}
      on:uploader:addedfile={onAddedfile}
      on:uploader:removedfile={onRemovedfileHandler}
      {...options}
      {uid}
    />
  </div>
</div>

<style>
  :global(.upload-header) {
    text-transform: capitalize;
  }
  .subheader {
    font-size: 0.8rem;
    color: #aaaaaa;
  }
</style>
