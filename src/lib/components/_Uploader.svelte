<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte';
  import { session } from '$lib/stores';
  import PreviewTemplate from './_PreviewTemplate.svelte';
  import Button, { Label, Icon } from '@smui/button';
  import LinearProgress from '@smui/linear-progress';
  import { Dropzone } from '$lib/components';
  import { base, version } from '$lib/api';
  import { _ } from 'svelte-i18n';
  import type { DropzoneOptions } from '$lib/types';
  import { emit } from '$lib/utils';

  export { className as class };
  export let path;
  export let acceptedFiles = '';
  export let uploadMultiple = false;
  export let parallelUploads = 2;
  export let maxFiles = 2;
  export let maxFilesize = 1024; // Megabyte
  export let timeout = 180 * 1000; // 3min
  export let uid = '';

  const dispatch = createEventDispatcher();

  let dropzone: Dropzone;
  let className = '';
  let progress = 0;
  let previewTemplate: any;
  let count = 0;

  $: hasfiles = !!count;
  $: closed = !hasfiles;
  $: if (!hasfiles) progress = 0; // reset progress when removing last file

  const useTemplate = (el: HTMLDivElement) => {
    options.previewTemplate = el.innerHTML;
    el.remove();
  };

  const submit = function () {
    dropzone.processQueue();
  };

  const dropzoneEvents = {
    successmultiple: (files: Blob[], responseText: any, event: any) => {
      dispatch('uploader:successmultiple', { files, responseText, event });
    },
    success: (files: Blob[], responseText: any, event: Event) => {
      dispatch('uploader:success', { files, responseText, event });
    },
    error: (file: Blob, responseText: any, request: XMLHttpRequest) => {
      dispatch('uploader:error', { file, responseText, request });
    },
    addedfile: (file: Blob) => {
      ++count;
      dispatch('uploader:addedfile', { file });
    },
    removedfile: (file: Blob) => {
      --count;
      dispatch('uploader:removedfile', { file });
    },
    totaluploadprogress: (
      totalUploadProgress: number,
      totalBytes: any,
      totalBytesSent: any
    ) => {
      dispatch('uploader:totaluploadprogress', {
        totalUploadProgress,
        totalBytes,
        totalBytesSent,
      });
      progress = totalUploadProgress / 100;
    },
    complete: (file: Blob) => {
      dispatch('uploader:complete', { file });
      dropzone.removeFile(file);
    },
    maxfilesreached: (files: Blob[]) => {
      dispatch('uploader:maxfilesreached', { files });
    },
    processing: (file: Blob) => {
      dispatch('uploader:processing', { file });
    },
    processingmultiple: (files: Blob[]) => {
      dispatch('uploader:processingmultiple', { files });
    },
    queuecomplete: () => {
      dispatch('uploader:queuecomplete');
    },
  };

  const init = function (this: Dropzone) {
    dropzone = this;
    emit('dropzone:init', dropzone);
  };

  let options: DropzoneOptions = {
    url: `${base}/${version}/${path}?token=${$session.user?.jwt}&locale=${$session.locale}`,
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
    previewsContainer: '.previews-container',
    init,
  };
</script>

<div class="content {className}">
  <div class="content-inner relative">
    {#if options.previewTemplate}
      <Dropzone style="margin-bottom: 3em" let:id {options} {dropzoneEvents}>
        <form
          {id}
          class:hasfiles
          on:submit|preventDefault={submit}
          class="flex hasfiles"
          enctype="multipart/form-data"
          method="post"
        >
          <p class="dz-message">
            {$_('text.drop-your-files-here')}
          </p>
          <div
            class="previews-container"
            style:--thumbnail-w="{options.thumbnailWidth}px"
            style:--thumbnail-h="{options.thumbnailHeight}px"
          />
          <Button
            disabled={!hasfiles}
            variant="raised"
            color="primary"
            class="button-upload w-full"
          >
            <Label>Hochladen</Label>
            <Icon class="material-icons">cloud_upload</Icon>
          </Button>
          <input hidden name="user_id" type="hidden" value={uid} />
          <LinearProgress class="progressbar" {progress} {closed} />
        </form>
      </Dropzone>
    {/if}
    <div class="hidden" use:useTemplate>
      <PreviewTemplate showFileProgress showFileSize />
    </div>
  </div>
</div>

<style lang="scss">
  form {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: auto;
    &.hasfiles {
      .dz-message {
        display: none;
      }
      .previews-container {
        display: flex;
      }
    }
    .dz-message {
      z-index: -1;
      position: relative;
    }
    :global(.button-upload) {
      position: absolute;
      bottom: -46px;
    }
    &:not(.dz-started) {
      align-items: center;
      justify-content: center;
    }
    :global(.progressbar) {
      position: absolute;
      bottom: -60px;
    }
    .previews-container {
      display: none;
      flex-wrap: wrap;
      height: 100%;
      width: 100%;
    }
  }
</style>
