<script lang="ts">
  import { session } from '$lib/stores';
  import { Media } from '@smui/card';
  import { getExt, getMediaImage } from '$lib/utils';
  import type { Avatar, Image, Video } from '$lib/types';

  const posterUrl = `https://via.placeholder.com/320x180.png?text=`;

  export let media: Video | Image | Avatar;

  const settings = {
    width: 400,
    height: 400,
    square: 0
  };

  let id: string;
  let poster: string | undefined = (media && `${posterUrl}${getExt(media.src)}`) || posterUrl;

  $: media && (id = media.id);
  $: id && ((id) => getMediaImage(id, $session.user?.jwt, settings).then((v) => (poster = v)))(id);
</script>

<Media aspectRatio="16x9" style="background-image:url({poster})" />

<style>
</style>
