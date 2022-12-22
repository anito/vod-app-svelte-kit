<script>
  import { onMount, getContext } from 'svelte';
  import Uploader from './_Uploader.svelte';
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

  const { getSnackbar, configSnackbar } = getContext('snackbar');

  let className = '';
  let count = 0;
  /**
   * @type {HTMLDivElement}
   */
  let uploader;
  /**
   * @type {import("@smui/snackbar")}
   * */
  let snackbar;

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

  /**
   *
   * @param {CustomEvent} param0
   */
  function onAddedfile({ detail }) {
    ++count;
  }

  /**
   *
   * @param {CustomEvent} param0
   */
  function onRemovedfile({ detail }) {
    --count;
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function onSuccess(event) {
    if (options.uploadMultiple) return;
    uploader.dispatchEvent(new CustomEvent('upload:success', event));
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function onSuccessmultiple(event) {
    if (!options.uploadMultiple) return;
    uploader.dispatchEvent(new CustomEvent('upload:successmultiple', event));
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function onError({ detail }) {
    /** @type {any} */
    const { message } = { ...detail };
    configSnackbar(message);
    snackbar?.open();
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
