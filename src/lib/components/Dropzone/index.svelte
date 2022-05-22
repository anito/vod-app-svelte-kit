<script>
  import { onMount } from 'svelte';
  export let dropzoneEvents = {};
  export let options = { previewTemplate: '<div/>' };
  export let dropzoneClass = 'dropzone';
  export let style = '';
  export let hoveringClass = 'dropzone-hovering';
  export let id = 'dropId';
  export let autoDiscover = false;

  let DROPZONESSR;

  onMount(async () => {
    const dropzone = await import('./dropzone.svelte');
    DROPZONESSR = dropzone.default;
  });
</script>

<svelte:component
  this={DROPZONESSR}
  {dropzoneEvents}
  {options}
  {style}
  {dropzoneClass}
  {hoveringClass}
  {autoDiscover}
  {id}
>
  <slot {id}>
    <p class="dropzoneDefaultSentence">drop your file(s) here or click to add file</p>
  </slot>
</svelte:component>

<style>
  p.dropzoneDefaultSentence {
    font-size: 30px;
  }
</style>
