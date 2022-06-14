<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import './_icon-button.scss';
	import './_date-range-picker.scss';
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import { createRedirectSlug } from '$lib/utils';
	import List, { Item, Graphic, Separator, Text } from '@smui/list';
	import Button, { Label, Icon as ButtonIcon } from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import { videos, videosAll, users, flash, infos } from '$lib/stores';
	import SimpleVideoCard from './SimpleVideoCard';
	import DateRangePicker from './DateRangePicker';
	import Header from './_Header.svelte';
	import Component from './_Component.svelte';
	import {
		startOfDay,
		endOfDay,
		startOfWeek,
		endOfWeek,
		startOfYear,
		endOfYear,
		addYears,
		subYears,
		parseISO
	} from 'date-fns';
	import * as locales from 'date-fns/locale/index.js';
	import { toISODate, proxyEvent, sortByEndDate, sortByTitle } from '$lib/utils';
	import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
	import Radio from '@smui/radio';
	import { _, locale } from 'svelte-i18n';

	export let selectionUserId;

	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const timespanSelections = [
		{ title: 'text.1-month', value: 30 },
		{ title: 'text.2-months', value: 60 },
		{ title: 'text.3-months', value: 90 },
		{ title: 'text.custom', value: 'self' }
	];
	const ADMIN = 'Administrator';

	let root;
	let schedulingVideoId;
	let scheduleDialog;
	let removeDialog;
	let timespanSelection = timespanSelections[0].value;
	let timespanSelected;
	let firstDayOfWeek = 'monday';
	let snackbar;
	let code;
	let message;
	let filtered;
	let group;
	let currentUser;
	let selectedIndex;
	let selectionVideoId;
	let selectedVideo;
	let readout;
	let schedulingVideo = '';
	let expires;
	let isExpired;

	$: user = $session.user;
	$: dateFormat = $locale.indexOf('de') != -1 ? 'dd. MMM yyyy' : 'yyyy-MM-dd';
	$: currentUserIndex = ((id) => $users.findIndex((usr) => usr.id === id))(selectionUserId);
	$: userVideos = ((idx) => {
		if ($session.role === ADMIN) {
			return $users[idx]?.videos.sort(sortByEndDate);
		} else {
			return $users[idx]?.videos
				.filter((v) => {
					return (
						new Date(v._joinData.start) <= new Date() && new Date(v._joinData.end) >= new Date()
					);
				})
				.sort(sortByEndDate);
		}
	})(currentUserIndex);
	$: (() => (selectionVideoId = null))(selectionUserId);
	$: currentUser =
		(filtered = ((id) => $users.filter((usr) => usr.id === id))(selectionUserId)) &&
		filtered.length &&
		filtered[0];
	$: username = (currentUser && currentUser.name) || '';
	$: currentRole =
		(group = ((usr) =>
			$session.groups && $session.groups.find((group) => group.id == usr.group_id))(currentUser)) &&
		group.name;
	$: joinData =
		(selectedVideo = currentUser && currentUser.videos.find((v) => v.id === selectionVideoId)) &&
		selectedVideo._joinData;
	$: startDate = (joinData && joinData.start && parseISO(joinData.start)) || endOfWeek(new Date(0));
	$: endDate = (joinData && joinData.end && parseISO(joinData.end)) || endOfWeek(new Date(0));
	$: expires = currentUser && currentUser.expires;
	$: isExpired = (expires && expires * 1000 < +new Date().getTime()) || false;
	$: noneUserVideos = ((role) => {
		if (role === ADMIN) return $videos.sort(sortByTitle);
		else
			return $videosAll
				.filter(
					(v) =>
						!userVideos?.find((uv) => {
							return (
								v.id === uv.id && (!uv._joinData.end || new Date(uv._joinData.end) > new Date())
							);
						})
				)
				.sort(sortByTitle);
	})(currentRole);
	$: isDatapickerOpen = ((id) => {
		if (!root) return;
		!id && root.classList.remove('datapicker--open');
		return root.classList.contains('datapicker--open');
	})(selectionVideoId);
	$: schedulingVideo = schedulingVideoId && $videos.find((video) => video.id === schedulingVideoId);
	$: schedulingVideoTitle = (schedulingVideo && schedulingVideo.title) || '';
	$: localeObject = ((l) => locales[l.slice(0, 2)])($locale);
	$: userIssues =
		($infos.has(selectionUserId) &&
			$infos.get(selectionUserId).params.filter((info) => info.type === 'issue')) ||
		[];

	onMount(() => {
		root = document.documentElement;
		root.classList.add('timemanager--open');

		snackbar = getSnackbar();
		return () => root.classList.remove('timemanager--open', 'datapicker--open');
	});

	function openScheduleDialog(video) {
		schedulingVideoId = video.id;
		scheduleDialog.setOpen(true);
	}
	function openRemoveDialog(e, video) {
		e.stopPropagation();
		schedulingVideoId = video.id;
		if (timeRemaining(video)) {
			removeDialog.setOpen(true);
		} else {
			removeVideo();
		}
	}

	async function removeDialogCloseHandler(e) {
		if (e.detail.action === 'approved') {
			removeVideo();
		}
		schedulingVideoId = null;
	}

	async function scheduleDialogCloseHandler(e) {
		if (e.detail.action === 'accept') {
			let start = null;
			let end = null;

			timespanSelected = timespanSelection;
			if (timespanSelected === 'self') {
				selectionVideoId = schedulingVideoId;
			} else {
				let now = new Date();
				let time = new Date(now.getTime() + timespanSelected * 24 * 60 * 60 * 1000);
				start = toISODate(now);
				end = toISODate(time, true);
			}
			saveTime(schedulingVideoId, start, end);
			timespanSelection = timespanSelections[0].value;
			schedulingVideoId = null;
		}
	}

	function itemSelectedHandler(e) {
		let { video } = e.detail;

		selectionVideoId = video.id == selectionVideoId ? null : video.id;
	}

	function onApplyHandler({ detail }) {
		const { startDate, endDate } = { ...detail };

		let isoStart = toISODate(startDate);
		let isoEnd = toISODate(endDate);

		saveTime(selectionVideoId, isoStart, isoEnd);
	}

	async function saveTime(id, start, end) {
		let associated = userVideos.filter((v) => v.id != id).map((v) => ({ id: v.id }));
		let currentVideo = userVideos.filter((v) => v.id == id);
		let joinData = (currentVideo.length && currentVideo[0]._joinData) || {};

		let data = {
			videos: [
				{
					id,
					_joinData: { ...joinData, start, end }
				},
				...associated
			]
		};

		await saveUser(data).then((res) => {
			if (res?.success) {
				handleSuccess(res, $_('text.time-slot-updated'));
			} else {
				startDate = startDate;
				handleError(res);
			}
		});
	}

	function timeRemaining(video) {
		if (!(video._joinData && video._joinData.end)) return 0;
		let end = new Date(video._joinData.end).toISOString();
		let now = new Date().toISOString();
		return Math.max(0, new Date(end) - new Date(now));
	}

	async function removeVideo() {
		let idx = userVideos.findIndex((itm) => itm.id === schedulingVideoId);
		let _userVideos = [...userVideos.slice(0, idx), ...userVideos.slice(idx + 1)];
		let ids = _userVideos.map((v) => v.id);

		let data = { videos: { _ids: [...ids] } };
		const res = await saveUser(data);

		if (res.success) {
			selectionVideoId === schedulingVideoId && (selectionVideoId = null);
			handleSuccess(res, $_('text.video-removed'));
		} else {
			handleError(res);
		}
	}

	function saveUser(data) {
		return api.put(`users/${selectionUserId}?locale=${$locale}`, data, user?.token);
	}

	function handleSuccess(res, msg) {
		snackbar.isOpen && snackbar.close();
		users.put(res.data);

		message = msg || res.message || res.data.message;
		configSnackbar(message);
		snackbar.open();
	}

	function handleError(res) {
		let path;
		snackbar.isOpen && snackbar.close();

		message = res?.message || res?.data?.message || res?.statusText;

		if (400 <= code && code < 500) {
			configSnackbar(message);
			snackbar.open();
		} else {
			flash.update({ type: 'error', message });
			path = `login${createRedirectSlug($page)}`;
			configSnackbar(message, path);
			snackbar.open();
		}
	}

	function onSelection(e) {
		//
	}

	function toggleDataPicker(id, open) {
		selectionVideoId = id && root.classList.toggle('datapicker--open', open);
	}
</script>

<div
	class="grid-item user-videos"
	class:no-user-selected={!currentUser}
	class:no-videos={!userVideos?.length || currentRole === ADMIN}
>
	<Component>
		<div slot="header">
			<Header mdc h="5">
				{#if currentUser}
					<div class="flex">
						<span><strong>{username}</strong></span>
						<span class="uppercase flex-auto" style="font-weight: 400; text-align: right;"
							>| {$_('text.booked-classes')}</span
						>
					</div>
				{/if}
			</Header>
		</div>
		<List class="video-list" threeLine avatarList singleSelection bind:selectedIndex>
			{#if ADMIN !== currentRole}
				{#if userVideos?.length}
					{#each userVideos as video (video.id)}
						<SimpleVideoCard
							isUserVideo
							threeLine
							class="user-video video-list-item"
							on:datapicker={(e) =>
								toggleDataPicker(
									e.detail.id,
									selectionVideoId != e.detail.id || !root.classList.contains('datapicker--open')
								)}
							on:itemSelected={itemSelectedHandler}
							selected={selectionVideoId === video.id}
							{video}
							{selectionUserId}
						>
							<IconButton
								class="self-center mr-2"
								color="primary"
								on:click={async () => await goto(`/videos/${video.id}`)}
							>
								<Icon class="material-icons">smart_display</Icon>
							</IconButton>
							{#if ADMIN === $session.role}
								<Button
									class="close-action-button button-shaped-round flex self-center"
									variant="unelevated"
									on:click={() =>
										toggleDataPicker(
											video.id,
											selectionVideoId != video.id || !root.classList.contains('datapicker--open')
										)}
								>
									<Icon class="material-icons">
										{isDatapickerOpen && selectionVideoId == video.id
											? 'close'
											: 'insert_invitation'}
									</Icon>
									<Label>{$_('text.scheduler')}</Label>
								</Button>
								<IconButton
									class="delete-action-button delete ml-2"
									on:click={(e) => openRemoveDialog(e, video)}
								>
									<Icon class="material-icons">remove_circle</Icon>
								</IconButton>
							{/if}
						</SimpleVideoCard>
					{/each}
				{:else if currentUser}
					<div class="flex flex-1 flex-col self-center text-center">
						<div class="m-5">
							{@html $_('text.user-has-no-videos', {
								values: { name: username }
							})}
						</div>
					</div>
				{:else}
					<li class="flex flex-1 flex-col self-center text-center">
						<div class="m-5">
							{$_('text.user-doesnt-exist')}
						</div>
					</li>
				{/if}
			{:else}
				<div class="flex flex-1 flex-col self-center text-center">
					<div class="m-5">{$_('text.admins-have-full-access')}</div>
				</div>
			{/if}
		</List>
	</Component>
</div>
{#if !isDatapickerOpen}
	<div class="grid-item videos" class:no-videos={!noneUserVideos.length}>
		<Component>
			<div slot="header">
				<Header mdc h="5">
					<div class="uppercase" style="font-weight: 400; text-align: right;">
						{$_('text.more-classes')}
					</div></Header
				>
			</div>
			<List class="video-list" twoLine avatarList singleSelection>
				{#if noneUserVideos?.length}
					{#each noneUserVideos as video (video.id)}
						<SimpleVideoCard
							let:unmanagable
							class="video"
							disabled={currentRole === ADMIN || $session.role !== ADMIN}
							{video}
							{selectionUserId}
						>
							{#if $session.role === ADMIN}
								<IconButton
									class="self-center mr-2"
									color="primary"
									style=""
									on:click={async () => await goto(`/videos/${video.id}`)}
								>
									<Icon class="material-icons">smart_display</Icon>
								</IconButton>
								<IconButton
									disabled={unmanagable || video.teaser}
									class="add-action-button add primary"
									on:click={() => openScheduleDialog(video)}
								>
									<Icon class="material-icons">add_circle</Icon>
								</IconButton>
							{/if}
						</SimpleVideoCard>
					{/each}
				{:else}
					<li class="flex flex-1 flex-col self-center text-center">
						<div class="m-5">{$_('text.no-more-videos-available')}</div>
					</li>
				{/if}
			</List>
		</Component>
	</div>
{:else}
	<div class="grid-item time">
		<Component>
			<div slot="header">
				<div class="">
					<Header mdc h="5">{readout}</Header>
					<button
						on:click={() => toggleDataPicker(selectionVideoId, false)}
						class="button-close"
						variant="unelevated"
					>
						<Icon class="material-icons" style="vertical-align: middle;">close</Icon>
					</button>
				</div>
			</div>
			<DateRangePicker
				on:apply={onApplyHandler}
				on:selection={onSelection}
				bind:readout
				{firstDayOfWeek}
				{startDate}
				{endDate}
				minDate={subYears(startOfYear(new Date()), 2)}
				maxDate={addYears(endOfYear(new Date()), 2)}
				{dateFormat}
				{localeObject}
				customHeaderHeight
				class="sm-header"
				disabled={!selectionVideoId}
				resetTrigger={selectionVideoId}
				monthDropdown={true}
				weekGuides
				weekNumbers
				todayBtn
				twoPages
				resetViewBtn
				timePicker
				timePickerSeconds
				timePickerControls
				todayBtnText={$_('text.today')}
				cancelBtnText={$_('text.reset')}
				applyBtnText={$_('text.apply')}
				actionBtnClass="picker-btn mdc-button mdc-ripple-upgraded mdc-button--unelevated"
			/>
		</Component>
	</div>
{/if}
<Dialog
	bind:this={scheduleDialog}
	aria-labelledby="list-selection-title"
	aria-describedby="list-selection-content"
	on:SMUIDialog:closed={scheduleDialogCloseHandler}
>
	<Title id="list-selection-title">{$_('text.select-time-slot')}</Title>
	<Content id="list-selection-content">
		<List radioList>
			{#each timespanSelections as timespan, i}
				<Item use={(i === 0 && [InitialFocus]) || []}>
					<Graphic>
						<Radio bind:group={timespanSelection} value={timespan.value} />
					</Graphic>
					<Text>{$_(timespan.title)}</Text>
				</Item>
			{/each}
			{#if !currentUser.token || isExpired || !currentUser.active}
				<div class="mt-3">
					<Icon class="material-icons leading">warning</Icon>
					<p>
						{$_('text.account-inactive')}
					</p>
					<div class="reasons">
						{#each userIssues as issue}
							<Button
								variant="raised"
								on:click={() => proxyEvent(issue.eventType, { silent: true })}
							>
								<Label>{$_(issue.label)}</Label>
							</Button>
						{/each}
					</div>
				</div>
			{/if}
		</List>
	</Content>
	<Actions>
		<Button>
			<Label>{$_('text.cancel')}</Label>
		</Button>
		<Button action="accept" variant="unelevated">
			<Label>Ok</Label>
		</Button>
	</Actions>
</Dialog>
<Dialog
	bind:this={removeDialog}
	aria-labelledby="event-title"
	aria-describedby="event-content"
	on:SMUIDialog:closed={removeDialogCloseHandler}
>
	<Title id="event-title">
		{$_('text.video-is-active')}
	</Title>
	<Content id="event-content">
		<p>
			{@html $_('messages.class-has-active-time-slot', {
				values: { title: schedulingVideoTitle }
			})}
		</p>
	</Content>
	<Actions>
		<Button action="none">
			<Label>{$_('text.cancel')}</Label>
		</Button>
		<Button action="approved" default use={[InitialFocus]} variant="unelevated">
			<Label>{$_('text.remove-class')}</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.grid-item {
		background: var(--back-grid-item);
	}
	.user-videos {
		grid-area: one;
		overflow: auto;
	}
	.time,
	.videos {
		grid-area: two;
		overflow: auto;
	}
	.time {
		background: #fff;
	}
	.no-user-selected {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.item > label) {
		width: 100%;
	}
	.button-close {
		position: absolute;
		right: 20px;
		top: 50%;
		transform: translate(50%, -50%);
	}
	.reasons > :global(*) {
		display: block;
		margin: 1em 0;
	}
</style>
