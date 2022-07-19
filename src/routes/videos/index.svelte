<script>
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { images, sitename, videos } from '$lib/stores';
	import { ADMIN, SUPERUSER } from '$lib/utils';
	import Button, { Group, Label, Icon } from '@smui/button';
	import { VideoManager, ImageManager, Component } from '$lib/components';
	import { Header } from '$lib/components';
	import { _ } from 'svelte-i18n';

	const TABS = ['videos', 'images'];

	/**
	 * @type {never[]}
	 */
	let _videos = [];
	/**
	 * @type {never[]}
	 */
	let _images = [];

	export { _videos as videos };
	export { _images as images };

	$: tab = ((tab) => TABS.find((itm) => itm === tab))($page.url.searchParams.get('tab')) || TABS[0];
	$: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
	$: videos.update(_videos);
	$: images.update(_images);

	onMount(() => {});

	/**
	 * @param {string} tab
	 */
	async function changeTab(tab) {
		await goto(`/videos?tab=${tab}`);
		return false;
	}
</script>

<svelte:head>
	<title>{$sitename} | Video-Kurse</title>
</svelte:head>

{#if hasPrivileges}
	<div class="media-grid {tab} flex-1">
		<div class="grid-item one">
			<Group variant="unelevated">
				<Button
					class="focus:outline-none focus:shadow-outline"
					on:click={() => changeTab(TABS[0])}
					variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
				>
					<Icon class="material-icons">video_settings</Icon>
					<Label>Videos</Label>
				</Button>

				<Button
					class="focus:outline-none focus:shadow-outline"
					on:click={() => changeTab(TABS[1])}
					variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
				>
					<Icon class="material-icons">collections</Icon>
					<Label>Posters</Label>
				</Button>
			</Group>
		</div>

		<div class="grid-item two">
			{#if tab === TABS[0]}
				<VideoManager />
			{/if}
			{#if tab === TABS[1]}
				<ImageManager />
			{/if}
		</div>
	</div>
{:else}
	<Component variant="sm">
		<div slot="header">
			<div class="grid grid-cols-2">
				<span class="ml-2">
					<Header h="6" mdc>{$_('text.your-classes')}</Header>
				</span>
				<span class="justify-self-end mr-2">
					<Header h="5" mdc>
						{@html $session.user?.name || ''}
					</Header>
				</span>
			</div>
		</div>
		<div class="p-8">
			<VideoManager />
		</div>
	</Component>
{/if}

<style>
	.media-grid {
		display: grid;
		grid-template-rows: var(--toolbar-h) auto;
		grid-template-columns: 1fr;
		grid-gap: var(--grid-gap);
		align-items: initial;
		grid-template-areas:
			'one'
			'two';
		max-width: var(--page-w);
	}
	.grid-item {
		background: var(--back-grid-item);
	}
	.one {
		grid-area: one;
		display: flex;
		align-items: center;
		height: var(--toolbar-h);
	}
	.two {
		grid-area: two;
	}
</style>
