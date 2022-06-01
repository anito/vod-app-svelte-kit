<script context="module">
	export async function load({ status, error }) {
		return {
			props: { title: `${status} | ${error.message}` }
		};
	}
</script>

<script>
	// @ts-nocheck

	import { page, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { flash } from '$lib/stores';
	import { del, createRedirectSlug } from '$lib/utils';
	import Paper, { Title } from '@smui/paper';
	import { _ } from 'svelte-i18n';
	import { dev } from '$app/env';

	const WAIT = 3;
	let update, timer, sec, word, unsubscribe, interval;

	export let title;

	$: $page.status === 401 && ($page.error.message = $_('error.error401'));
	$: $page.status === 403 && ($page.error.message = $_('error.error403'));
	$: $page.status === 404 && ($page.error.message = $_('error.error404'));

	onMount(async () => {
		createTimer();
		startTimer();
		flash.update({
			type: 'error',
			message: $page.error.message || $page.error,
			status: $page.status
		});
		if ($page.error.message?.toLowerCase() === 'expired token') {
			$page.status = 401;
		}
		if ($session.user && 401 === $page.status) {
			await del(`/auth/logout`).then((res) => {
				res.success && (($session.user = null), ($session.role = null), ($session.groups = null));
			});
		}
	});

	async function gotoLogin() {
		goto(`/login${createRedirectSlug($page.url)}`);
	}

	function createTimer() {
		timer = { update } = writable(WAIT, () => {
			interval = setInterval(() => {
				update((val) => --val);
			}, 1000);

			return () => {
				clearInterval(interval);
				gotoLogin();
			};
		});
	}

	function startTimer() {
		unsubscribe = timer.subscribe((val) => {
			sec = val;
			word = sec === 1 ? $_('text.second') : $_('text.seconds');
			val === 0 && unsubscribe();
		});
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="wrapper">
	<h1>{title}</h1>
	<Paper color="primary" style="align-self: center;">
		<Title style="color: var(--text-light);">
			{$page.error.message}
		</Title>
		<div class="">
			{@html $_('text.you_will_be_redirected', { values: { sec, word } })}
		</div>
	</Paper>
</div>

{#if dev && $page.error.stack}
	<pre>{$page.error.stack}</pre>
{/if}

<style>
	h1 {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	.wrapper {
		padding-top: var(--nav-h);
		margin: 0 3rem;
		display: flex;
		flex-direction: column;
	}
	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>
