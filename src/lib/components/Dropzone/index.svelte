<script lang="ts">
  import { onMount } from 'svelte';
  import Dropzone from 'dropzone';

  export let dropzoneEvents = {};
  export let options: {
    previewTemplate?: string;
    dictDefaultMessage?: string;
    clickable?: boolean;
  } = {};
  export let style = '';
  export let dropzoneClass = 'dropzone';
  export let hoveringClass = 'dropzone-hovering';
  export let id = 'dropId';

  onMount(() => {
    const dropzoneElement = document.getElementById(id);
    if (!options.previewTemplate) {
      options.previewTemplate = '<div/>';
    }
    if (!options.dictDefaultMessage) {
      options.dictDefaultMessage = '';
    }

    let svDropzone = new Dropzone(`#${id}`, {
      ...options,
    });

    svDropzone.emit('dropzone::init');
    svDropzone.on('addedfile', () => {
      dropzoneElement?.classList.remove(hoveringClass);
    });
    svDropzone.on('dragenter', () => {
      dropzoneElement?.classList.toggle(hoveringClass);
    });
    svDropzone.on('dragleave', () => {
      dropzoneElement?.classList.toggle(hoveringClass);
    });
    svDropzone.on(
      'error',
      (file: Blob, errorMessage: any, request: XMLHttpRequest) => {
        // console.log('Error:', errorMessage, file, request);
      }
    );
    Object.entries(dropzoneEvents).map(([eventKey, eventFunc]: any[]) => {
      svDropzone.on(eventKey, eventFunc);
    });

    if (options.clickable !== false) {
      dropzoneElement && (dropzoneElement.style.cursor = 'pointer');
    }
  });
</script>

<div class={dropzoneClass} {style}>
  <slot {id} />
  <input hidden name="sites_data" type="file" />
</div>

<style>
  .dropzone {
    position: relative;
    z-index: 1;
    height: 200px;
    min-height: 200px;
    display: flex;
    align-items: flex-start;
    transition: all 300ms ease-out;
  }

  .dropzone.dropzone-hovering {
    border: 2px solid var(--primary);
    background: rgba(255, 62, 0, 0.05);
  }
</style>
