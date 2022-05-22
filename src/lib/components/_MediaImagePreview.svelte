<script>
	import { session } from '$app/stores';
	import { Media } from '@smui/card';
	import { getExt, getMediaImage } from '$lib/utils';

	const posterUrl = `https://via.placeholder.com/320x180.png?text=`;

	export let media;

	const settings = {
		width: 400,
		height: 400,
		square: 0
	};

	let id;
	let poster = (media && `${posterUrl}${getExt(media.src)}`) || posterUrl;

	$: media && (id = media.id);
	$: id && ((id) => getMediaImage(id, $session.user, settings).then((v) => (poster = v)))(id);
</script>

<Media aspectRatio="16x9" style="background-image:url({poster})" />

<style>
</style>
