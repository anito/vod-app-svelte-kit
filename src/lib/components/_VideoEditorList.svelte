<script>
  import { getContext, onMount } from 'svelte';
  import { videos, derivedCurrentVideo } from '$lib/stores';
  import { Modal, VideoCard } from '$lib/components';
  import {
    LOCALESTORE,
    posterCreatedHandler,
    posterRemoveHandler,
    posterSelectedHandler
  } from '$lib/utils';
  import { locale, _ } from 'svelte-i18n';

  const key = 'editor-uploader-modal';
  const { close } = getContext('editor-modal');

  /** @type {import('$lib/types').Video[]} */
  export let data = [];

  $: storeData = $videos.filter(
    (video) => video.id === data.find((item) => item.id === video.id)?.id
  );
  $: !storeData.length && close();

  onMount(() => {});
</script>

<Modal header={{ name: 'text.upload-type' }} {key}>
  <div class="mt-2">
    {#each storeData as video}
      <VideoCard
        class="mb-3"
        on:Video:posterCreated={(event) => posterCreatedHandler(event, $derivedCurrentVideo.id)}
        on:Video:selectedPoster={(event) =>
          posterSelectedHandler(event.detail, $derivedCurrentVideo.id)}
        on:Video:removePoster={() => posterRemoveHandler($derivedCurrentVideo.id)}
        {video}
        {key}
      />
    {/each}
  </div>
</Modal>
