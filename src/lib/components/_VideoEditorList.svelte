<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { videos, derivedCurrentVideo } from '$lib/stores';
  import { Modal, VideoCard } from '$lib/components';
  import { posterCreatedHandler, posterRemoveHandler, posterSelectedHandler } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { Video } from '$lib/types';

  const key = 'editor-uploader-modal';
  const { close }: any = getContext('editor-modal');

  export let data: any[] = [];

  $: storeData = $videos.filter(
    (video: Video) => video.id === data.find((item) => item.id === video.id)?.id
  );
  $: !storeData.length && close();

  onMount(() => {});
</script>

<Modal header={{ name: 'text.upload-type' }} {key}>
  <div class="mt-2">
    {#each storeData as video}
      <VideoCard
        class="mb-3"
        on:video:posterCreated={(event) => posterCreatedHandler(event, $derivedCurrentVideo.id)}
        on:video:selectedPoster={(event) =>
          posterSelectedHandler(event.detail, $derivedCurrentVideo.id)}
        on:video:removePoster={() => posterRemoveHandler($derivedCurrentVideo.id)}
        {video}
        {key}
      />
    {/each}
  </div>
</Modal>
