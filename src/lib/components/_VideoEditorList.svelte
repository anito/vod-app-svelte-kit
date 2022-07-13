<script>
	// @ts-nocheck

	import { getContext, onMount } from 'svelte';
	import { videos } from '../stores';
	import { Modal, VideoCard } from '$lib/components';
	import { posterCreatedHandler, posterRemoveHandler, posterSelectedHandler } from '$lib/utils';
	import { _ } from 'svelte-i18n';

	const key = 'editor-uploader-modal';
	const { close } = getContext('editor-modal');

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
				on:Video:posterCreated={posterCreatedHandler}
				on:Video:selectedPoster={posterSelectedHandler}
				on:Video:removePoster={posterRemoveHandler}
				{video}
				{key}
			/>
		{/each}
	</div>
</Modal>
