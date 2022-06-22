<script context="module">
	import * as api from '$lib/api';

	let usersData = [];
	let videosData = [];
	let imagesData = [];
	export async function load({ session }) {
		const token = session.user?.jwt;
		await api
			.get('users', { token })
			.then((res) => {
				res.success && (usersData = res.data);
			})
			.catch(() => {});

		await api
			.get('videos', { token })
			.then((res) => {
				res.success && (videosData = res.data);
			})
			.catch(() => {});

		await api
			.get('images', { token })
			.then((res) => {
				res.success && (imagesData = res.data);
			})
			.catch(() => {});

		return {
			props: {
				usersData,
				videosData,
				imagesData
			}
		};
	}
</script>

<script>
	// @ts-nocheck

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Layout from './layout.svelte';
	import List from '@smui/list';
	import Textfield from '@smui/textfield';
	import { Icon } from '@smui/icon-button';
	import { Legal, PageBar, SimpleVideoCard } from '$lib/components';
	import { proxyEvent, sortByTitle } from '$lib/utils';
	import { images, videos, users } from '$lib/stores';
	import { _ } from 'svelte-i18n';

	export let usersData = [];
	export let videosData = [];
	export let imagesData = [];

	let selectedIndex;
	let search = '';

	$: users.update(usersData);
	$: videos.update(videosData);
	$: images.update(imagesData);
	$: sidebar = !!$page.params.slug;
	$: selectionVideoId = $page.params.slug;
	$: filteredVideos = $videos
		.filter((video) => video.title?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
		.sort(sortByTitle);

	function itemSelectedHandler(e) {
		let { video } = e.detail;

		if (video.id != selectionVideoId) {
			goto(`/videos/${video.id}`);
		}
	}
</script>

<Layout {sidebar}>
	<div class="flex flex-1" slot="pagebar">
		<PageBar />
	</div>
	<slot />
	<div class="sidebar" slot="side" style="flex: 1;">
		<div class="flex flex-col">
			<Textfield
				class="search"
				variant="filled"
				bind:value={search}
				label={$_('text.search-video')}
				input$aria-controls="helper-text"
				input$aria-describedby="helper-text"
			>
				<Icon
					role="button"
					class="material-icons-outlined cancel-search"
					slot="trailingIcon"
					on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
				>
			</Textfield>
		</div>
		<List class="video-list" twoLine avatarList singleSelection bind:selectedIndex>
			{#if filteredVideos.length}
				{#each filteredVideos as video (video.id)}
					<SimpleVideoCard
						class="video"
						selected={selectionVideoId === video.id}
						on:itemSelected={itemSelectedHandler}
						on:click={() => proxyEvent('ticker:extend')}
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
