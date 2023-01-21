<script lang="ts">
  import Dropzone from './index.svelte';
  export let dropzoneEvents = {};
  export let options = { previewTemplate: '<div/>' };
  export let dropzoneClass = 'dropzone';
  export let style = '';
  export let hoveringClass = 'dropzone-hovering';
  export let id = 'dropId';
  export let autoDiscover = false;

  console.log('dropzoneevents', dropzoneEvents);
  let props = {
    dropzoneEvents,
    options,
    style,
    dropzoneClass,
    hoveringClass,
    autoDiscover,
    id
  };
</script>

<Dropzone {...props}>
  <slot {id}>
    <p class="dropzoneDefaultSentence">drop your file(s) here or click to add file</p>
  </slot>
</Dropzone>

<style>
  p.dropzoneDefaultSentence {
    font-size: 30px;
  }
</style>
