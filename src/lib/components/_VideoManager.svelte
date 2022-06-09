<script>
	// @ts-nocheck

	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import { fly } from 'svelte/transition';
	import Fab, { Label, Icon } from '@smui/fab';
	import MediaUploader from './_MediaUploader.svelte';
	import VideoCard from './_VideoCard.svelte';
	import Info from './_Info.svelte';
	import { videos, images, fabs, currentVideo, videoEmitter, settings } from '$lib/stores';
	import { _ } from 'svelte-i18n';

	const { open } = getContext('simple-modal');
	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const { setFab } = getContext('fab');
	const transitionParams = {
		delay: 0,
		duration: 200
	};
	const flyTransitionParams = { ...transitionParams, x: -80 };
	const sortAZ = (a, b) => {
		let _a, _b;
		a = (_a = a.title || a.src) && _a.toLowerCase();
		b = (_b = b.title || b.src) && _b.toLowerCase();
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	let snackbar;

	let openUploader = (type) => {
		open(
			MediaUploader,
			{
				type,
				options: {
					// acceptedFiles: '.mov .mp4 .m4a .m4v .3gp .3g2 .webm',
					uploadMultiple: true,
					parallelUploads: 2,
					maxFiles: 2,
					timeout: 3600 * 1000, // 60min
					maxFilesize: 1024 // Megabyte
				},
				events: { uploadDone }
			},
			{
				transitionWindow: fly,
				transitionWindowProps: {
					y: -200,
					duration: 500
				}
			}
		);
	};

	onMount(() => {
		snackbar = getSnackbar();

		if ($session.role === 'Administrator') {
			setFab('upload-video');
		}
	});

	function uploadDone(e) {
		let detail = e.detail;
		let data, video, message;

		message = detail.message;
		if (detail.success) {
			data = detail.data;
			videos.add(data);
		}
		if (message) {
			configSnackbar(message);
			snackbar.open();
		}

		if (!(video = $currentVideo)) return;

		// take the last element for our poster
		let image_id = data.slice(-1)[0].id;
		video.image_id = image_id;

		videoEmitter.dispatch({
			method: 'put',
			data: video,
			show: true
		});
	}

	function posterCreatedHandler(e) {
		let uploads = e.detail.data;
		let newPosterId = uploads.length && uploads[0].id;
		newPosterId && images.add(uploads), selectPoster(newPosterId);
	}

	function selectPosterHandler(e) {
		selectPoster(e.detail);
	}

	function removePosterHandler() {
		let video;
		if ((video = $currentVideo)) {
			video.image_id = null;
			videoEmitter.dispatch({
				method: 'put',
				data: video,
				show: true
			});
		}
	}

	function selectPoster(id) {
		let video;
		if ((video = $currentVideo)) {
			video.image_id != id &&
				(video.image_id = id) &&
				videoEmitter.dispatch({
					method: 'put',
					data: video,
					show: true
				});
		}
	}
</script>

{#if $session.user}
	{#if $videos.length}
		<div class="flex flex-wrap flex-row lg:justify-start justify-center">
			{#each $videos.sort(sortAZ) as video (video.id)}
				<div class="flex mx-1 my-2">
					<div>
						<VideoCard
							on:Video:posterCreated={posterCreatedHandler}
							on:Video:selectPoster={selectPosterHandler}
							on:Video:removePoster={removePosterHandler}
							{video}
						/>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="paper-container flex justify-center">
			<div class="flyer" transition:fly={flyTransitionParams}>
				<Info class="flex justify-center" title={$_('text.no-content-available')} />
			</div>
		</div>
	{/if}
	{#if $fabs === 'upload-video'}
		<Fab class="floating-fab" color="primary" on:click={() => openUploader('video')} extended>
			<Label>{$_('text.new-class')}</Label>
			<Icon class="material-icons">add</Icon>
		</Fab>
	{/if}
{:else}
	<div class="paper-container flex justify-center m-8">
		<div class="flyer" transition:fly={flyTransitionParams}>
			<Info title={$_('text.authentication-required')} let:href>
				<a {href} on:click|preventDefault={() => goto(href)}>{$_('text.sign-in-now')}</a>
			</Info>
		</div>
	</div>
{/if}

<style>
	.flyer {
		min-width: 50%;
		position: relative;
	}
</style>
