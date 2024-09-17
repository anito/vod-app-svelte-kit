<script lang="ts">
  import { session } from '$lib/stores';
  import { Media } from '@smui/card';
  import { getExt, getMediaImage } from '$lib/utils';
  import type { Avatar, Image, Video } from '$lib/classes/repos/types';

  export let fallback = `https://placehold.co/100x100?text=`;
  export let media: Video | Image | Avatar | null;

  const settings = {
    width: 400,
    height: 400,
    square: 0
  };

  let poster: string | undefined = `${fallback}${getExt(media?.src || '')}`;

  $: (async (id) => {
    if (id) {
      const res = await getMediaImage(id, $session.user?.jwt, settings).then((res) => res);
      if (res) poster = res;
    }
  })(media?.id);
</script>

<Media aspectRatio="16x9" style="background-image:url({poster})" />

<style>
</style>
