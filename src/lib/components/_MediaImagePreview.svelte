<script>
  import { session } from '$lib/stores';
  import { Media } from '@smui/card';
  import { getExt, getMediaImage } from '$lib/utils';

  const posterUrl = `https://via.placeholder.com/320x180.png?text=`;

  /**
   * @type {import('$lib/types').Video | import('$lib/types').Image | import('$lib/types').Avatar}
   */
  export let media;

  const settings = {
    width: 400,
    height: 400,
    square: 0
  };

  /**
   * @type {string}
   */
  let id;
  /**
   * @type {string | undefined}
   */
  let poster = (media && `${posterUrl}${getExt(media.src)}`) || posterUrl;

  $: media && (id = media.id);
  $: id && ((id) => getMediaImage(id, $session.user?.jwt, settings).then((v) => (poster = v)))(id);
</script>

<Media aspectRatio="16x9" style="background-image:url({poster})" />

<style>
</style>
