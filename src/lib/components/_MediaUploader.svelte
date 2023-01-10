<script lang="typescript">
  import { onMount, getContext } from 'svelte';
  import Uploader from './_Uploader.svelte';
  import type Snackbar from '@smui/snackbar';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let type = '';
  export let uid = '';
  export let options = {
    path: '',
    uploadMultiple: false,
    parallelUploads: 1,
    maxFiles: 1,
    timeout: 3600 * 1000, // 60min
    maxFilesize: 2 // Megabyte
  };
  export let events = {};

  const { getSnackbar, configSnackbar }: any = getContext('snackbar');

  let className = '';
  let count = 0;
  let uploader: HTMLDivElement;
  let snackbar: Snackbar;

  $: fileType = (type === 'avatar' && 'image') || type;
  $: acceptedFiles = `${fileType}/*`;
  $: path = `${type.toLowerCase()}s`;
  $: options = { acceptedFiles, ...options, path };

  onMount(() => {
    snackbar = getSnackbar();

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

  function onRemovedfile({ detail }: CustomEvent) {
    --count;
  }

  function onSuccess(event: CustomEvent) {
    if (options.uploadMultiple) return;
    uploader.dispatchEvent(new CustomEvent('upload:success', event));
  }

  function onSuccessmultiple(event: CustomEvent) {
    if (!options.uploadMultiple) return;
    uploader.dispatchEvent(new CustomEvent('upload:successmultiple', event));
  }

  function onError({ detail }: CustomEvent) {
    const message = detail.message;
    configSnackbar(message);
    snackbar?.forceOpen();
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
      on:Uploader:successmultiple={onSuccessmultiple}
      on:Uploader:success={onSuccess}
      on:Uploader:error={onError}
      on:Uploader:addedfile={onAddedfile}
      on:Uploader:removedfile={onRemovedfile}
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
