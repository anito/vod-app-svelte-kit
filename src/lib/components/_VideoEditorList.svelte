<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { videos, derivedCurrentVideo } from "$lib/stores";
  import { Modal, VideoCard } from "$lib/components";
  import {
    posterCreatedHandler,
    posterRemoveHandler,
    posterSaveHandler,
  } from "$lib/utils";
  import { _ } from "svelte-i18n";
  import type { Video } from "$lib/classes/repos/types";

  const key = "editor-uploader-modal";
  const { close }: any = getContext("editor-modal");

  export let data: any[] = [];

  $: storeData = $videos.filter(
    (video: Video) => video.id === data.find((item) => item.id === video.id)?.id
  );
  $: !storeData.length && close();

  onMount(() => {});
</script>

<Modal header={{ name: "text.upload-type" }} {key}>
  {#each storeData as video}
    <VideoCard
      class="mb-3"
      on:video:postercreated={(event) =>
        posterCreatedHandler(event, $derivedCurrentVideo.id)}
      on:video:saveposter={(event) =>
        posterSaveHandler(event.detail, $derivedCurrentVideo.id)}
      on:video:removeposter={() => posterRemoveHandler($derivedCurrentVideo.id)}
      {video}
      {key}
    />
  {/each}
</Modal>
