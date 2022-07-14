<script context="module">
	import { browser } from '$app/env';
	import { post } from '$lib/utils';

	export async function load({ url, session }) {
		const token = url.searchParams.get('token');
		if (browser && token) {
			return await post(`/auth/login`, { token }).then((res) => {
				return {
					props: { ...res }
				};
			});
		}
		return {
			props: {
				sessionExists: !!session.user
			}
		};
	}
</script>

<script>
	// @ts-nocheck

	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ListMessages, ListErrors, LoginForm } from '$lib/components';
	import { flash } from '$lib/stores';
	import { sitename } from '$lib/stores';
	import { fly } from 'svelte/transition';
	import { processRedirect, proxyEvent } from '$lib/utils';
	import Paper, { Content } from '@smui/paper';
	import { _ } from 'svelte-i18n';

	/**
	 * For token logins:
	 * load function has received data from backend server
	 */
	export let data = null;
	export let success = false;
	export let sessionExists = null;

	const transitionParams = {
		delay: 0,
		duration: 200
	};
	const flyTransitionParams = { ...transitionParams, x: -80 };

	let errors = null;
	let message = '';
	let outroended = false;

	$: message = $session.user
		? $_('text.welcome-message', { values: { name: $session.user.name } })
		: $page.url.searchParams.has('token')
		? $_('text.one-moment')
		: $_('text.login-text');
	// ensure reactivity of splash scrren to reflect locale change
	$: !$session.user &&
		flash.update({
			message,
			type: 'success'
		});

	onMount(() => {
		/**
		 * DISPLAYING RESULT MESSAGES
		 * There are two steps:
		 *
		 * Message 1: The flashStore handles the timeout time the first message should stay visible until the servers result message appears
		 * after the timeout the message will be reset empty and will therefore be unmounted.
		 *
		 * Message 2: After specified timeout a second message will be triggered by the store.
		 * This second message will be either a welcome message (on success) or
		 * a default message (on first appearance)
		 */
		if (sessionExists) {
			// valid session already exists, jump straight to outroend message
			outroended = true;
		} else if (data) {
			// Token login
			// (for Form login logic is in LoginForm component)
			if (success) {
				// start session before flash store has updated (and redirects)
				setTimeout(dispatcher, 100, { type: 'start', data });
				flash.update({ type: 'success', ...data, timeout: 2000 });
			} else {
				setTimeout(dispatcher, 4000, { type: 'end', data: { path: '/login' } });
				flash.update({ type: 'error', ...data, timeout: 5000 });
			}
		}
		return () => {};
	});

	function dispatcher({ type, data }) {
		proxyEvent(`ticker:${type}`, { ...data });
	}

	async function introendHandler() {
		if ($session.user) {
			setTimeout(() => goto(processRedirect($page.url.searchParams, $session)), 1000);
		}
	}
</script>

<svelte:head>
	<title>{$sitename} | Login</title>
</svelte:head>

<div
	in:fly={{ x: -200, duration: 800 }}
	out:fly={{ x: 200 }}
	class="flex flex-1 justify-center m-8"
>
	<div class="flex flex-col justify-center">
		<Paper elevation="20">
			<div class="flyer">
				{#if $flash.message}
					<div
						class="flex justify-center message {$flash.type}"
						transition:fly={flyTransitionParams}
						on:outrostart={(e) => (outroended = false)}
						on:outroend={(e) => (outroended = true)}
					>
						<h5 class="m-2 mdc-typography--headline5 headline">
							{$flash.message}
						</h5>
					</div>
				{:else if outroended}
					<div
						class="flex justify-center message {message.type}"
						in:fly={flyTransitionParams}
						on:introend={() => introendHandler()}
					>
						<h5 class="m-2 mdc-typography--headline5 headline">
							{message}
						</h5>
					</div>
				{:else}
					<div class="flex justify-center message">
						<h5 class="m-2 mdc-typography--headline5 headline">
							{$_('text.one-moment')}
						</h5>
					</div>
				{/if}
			</div>
			<Paper elevation="0">
				<Content>
					<LoginForm />
				</Content>
			</Paper>
		</Paper>
	</div>
</div>

<div class="hidden">
	<ListErrors {errors} />
	<ListMessages {message} />
</div>

<style>
	.flyer {
		height: 50px;
		overflow: hidden;
		position: relative;
	}
	.message {
		margin: 0 auto;
		color: var(--prime);
	}
	.message .headline {
		max-width: 400px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global(.error).message {
		color: var(--error) !important;
	}
	:global(.info).message {
		color: var(--info) !important;
	}
	:global(.warning).message {
		color: var(--warning) !important;
	}
	:global(.success).message {
		color: var(--success) !important;
	}
</style>
