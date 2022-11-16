<script>
  import { onMount, createEventDispatcher, getContext } from 'svelte';
  import { session } from '$lib/stores';
  import PreviewTemplate from './_PreviewTemplate.svelte';
  import Button, { Label, Icon } from '@smui/button';
  import LinearProgress from '@smui/linear-progress';
  import Dropzone from '$lib/components/Dropzone/index.svelte';
  import { base } from '$lib/api';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let path = '';
  export let acceptedFiles = '';
  export let uploadMultiple = false;
  export let parallelUploads = 2;
  export let maxFiles = 2;
  export let maxFilesize = 1024; // Megabyte
  export let timeout = 180 * 1000; // 3min
  export let uid = '';

  const dispatch = createEventDispatcher();

  /**
   * @type {Dropzone}
   */
  let dropzone;
  let className = '';
  let progress = 0;
  /**
   * @type {any}
   */
  let previewTemplate;
  /** @type {any} */
  let options;
  let count = 0;

  $: hasFiles = !!count;
  $: closed = !hasFiles;
  $: if (!hasFiles) progress = 0; // reset progress when removing last file

  /**
   *
   * @param {Element} el
   */
  const template = (el) => {
    if (el.childNodes.length) {
      /** @type {Element | null} */
      // @ts-ignore
      const firstChild = el.firstChild;
      previewTemplate = firstChild?.outerHTML;
      el.remove();
    }
  };

  let submit = function () {
    dropzone.processQueue();
  };
  let init =
    /**
     * @this {Dropzone}
     */
    function () {
      dropzone = this;

      // Events
      this.on(
        'successmultiple',
        (
          /** @type {Blob[]} */ files,
          /** @type {any} */ responseText,
          /** @type {Event} */ event
        ) => {
          dispatch('Uploader:successmultiple', { files, responseText, event });
        }
      );
      this.on(
        'success',
        (
          /** @type {Blob[]} */ files,
          /** @type {any} */ responseText,
          /** @type {Event} */ event
        ) => {
          dispatch('Uploader:success', { files, responseText, event });
        }
      );
      this.on(
        'error',
        (
          /** @type {Blob} */ file,
          /** @type {string} */ message,
          /** @type {XMLHttpRequestResponseType} */ xhr
        ) => {
          dispatch('Uploader:error', { file, message, xhr });
        }
      );
      this.on('addedfile', (/** @type {Blob} */ file) => {
        ++count;
        dispatch('Uploader:addedfile', { file });
      });
      this.on('removedfile', (/** @type {Blob} */ file) => {
        --count;
        dispatch('Uploader:removedfile', { file });
      });
      this.on(
        'totaluploadprogress',
        (
          /** @type {number} */ totalUploadProgress,
          /** @type {any} */ totalBytes,
          /** @type {any} */ totalBytesSent
        ) => {
          dispatch('Uploader:totaluploadprogress', {
            totalUploadProgress,
            totalBytes,
            totalBytesSent
          });
          progress = totalUploadProgress / 100;
        }
      );
      this.on('complete', (/** @type {Blob} */ file) => {
        dropzone.removeFile(file);
      });
      this.on('maxfilesreached', (/** @type {any} */ files) => {
        // TODO
      });
    };

  onMount(async () => {
    options = {
      url: `${base}/${path}?token=${$session.user?.jwt}`,
      timeout,
      paramName: 'Files',
      uploadMultiple,
      maxFiles,
      autoProcessQueue: false,
      parallelUploads,
      withCredentials: true,
      thumbnailWidth: 80,
      thumbnailHeight: 80,
      clickable: true,
      acceptedFiles,
      maxFilesize,
      previewTemplate,
      init
    };
  });
</script>

<div class="content {className}">
  <div class="content-inner relative">
    <Dropzone style="margin-bottom: 3em" dropzoneEvents={{ init }} let:id {options}>
      <form
        {id}
        on:submit|preventDefault={submit}
        class="items-start flex-wrap justify-start flex"
        enctype="multipart/form-data"
        method="post"
      >
        <p class:hasFiles class="fileAdded dz-message">
          {$_('text.drop-your-files-here')}
        </p>
        <Button disabled={!hasFiles} variant="raised" color="primary" class="button-upload w-full">
          <Label>Hochladen</Label>
          <Icon class="material-icons">cloud_upload</Icon>
        </Button>
        <input hidden name="user_id" type="hidden" value={uid} />
        <LinearProgress class="progressbar" {progress} {closed} />
      </form>
    </Dropzone>
    <div use:template class="files-table files flex flex-row flex-wrap justify-start items-start">
      <PreviewTemplate />
    </div>
  </div>
</div>

<style>
  form {
    width: 100%;
    height: 100%;
  }
  form:not(.dz-started) {
    align-items: center;
    justify-content: center;
  }
  form :global(.button-upload) {
    position: absolute;
    bottom: -46px;
  }
  form :global(.progressbar) {
    position: absolute;
    bottom: -60px;
  }
  .content .content-inner {
    z-index: 6;
    position: relative;
  }
  .dz-message {
    z-index: -1;
    position: relative;
  }
  .hasFiles {
    display: none;
  }
  .files-table {
    position: absolute;
    top: 0;
    width: 100%;
    height: auto;
  }
</style>
