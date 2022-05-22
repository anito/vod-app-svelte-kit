<script context="module">
	import { images, videos, users } from '$lib/stores';
	import * as api from '$lib/api';

	export async function load({ session }) {
		let usersData = [],
			videosData = [],
			imagesData = [];

		const resUsers = await api.get('users', session.user?.token);
		if (resUsers?.success) {
			usersData = resUsers.data;
			users.update(usersData);
		}

		const resVideos = await api.get('videos', session.user?.token);
		if (resVideos?.success) {
			videosData = resVideos.data;
			videos.update(videosData);
		}

		const resImages = await api.get('images', session.user?.token);
		if (resImages?.success) {
			imagesData = resImages.data;
			images.update(imagesData);
		}

		return {};
	}
</script>

<script>
	// @ts-nocheck

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Layout from './layout.svelte';
	import List from '@smui/list';
	import { Legal, PageBar, SimpleVideoCard } from '$lib/components';
	import { _, locale } from 'svelte-i18n';

	let selectedIndex;

	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
	$: sidebar = !!$page.params.slug;
	$: selectionVideoId = $page.params.slug;
	$: dateFormat = $locale.indexOf('de') != -1 ? 'dd. MMM yyyy' : 'yyyy-MM-dd';

	function itemSelectedHandler(e) {
		let { video } = e.detail;

		if (video.id != selectionVideoId) {
			goto(`/videos/${video.id}`);
		}
	}
</script>

<Layout {sidebar} {segment}>
	<div class="flex flex-1" slot="pagebar">
		<PageBar />
	</div>
	<slot />
	<div class="sidebar" slot="side" style="flex: 1;">
		<List class="video-list" twoLine avatarList singleSelection bind:selectedIndex>
			{#if $videos.length}
				{#each $videos as video (video.id)}
					<SimpleVideoCard
						class="video"
						selected={selectionVideoId === video.id}
						on:itemSelected={itemSelectedHandler}
						{video}
					/>
				{/each}
			{:else}
				<li class="flex flex-1 flex-col self-center text-center">
					<div class="m-5">{$_('text.no-videos')}</div>
				</li>
			{/if}
		</List>
	</div>
	<div slot="ad"><Legal /></div>
	<div slot="footer" class="flex justify-between">
		<div class="m-auto ml-0" />
		<div class="m-auto mr-0" />
	</div>
</Layout>
