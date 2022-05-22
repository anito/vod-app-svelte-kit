<script context="module">
	import * as api from '$lib/api';

	export async function load({ url }) {
		let token = url.searchParams.get('token');
		if (token) {
			const props = await api.get(`login/?token=${token}`);

			if (props) {
				return {
					props
				};
			}
		}
		return {};
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
	import { redirectPath, proxyEvent } from '$lib/utils';
	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import { _ } from 'svelte-i18n';

	/**
	 * For token logins:
	 * load function has received data from backend server
	 */
	export let success = false;
	export let data;

	const transitionParams = {
		delay: 0,
		duration: 200
	};
	const flyTransitionParams = { ...transitionParams, x: -80 };

	let errors = null;
	let message = '';
	let flashOutroEnded = false;

	$: message = ((user) => {
		return (
			(user && {
				text: $_('text.welcome-message', { values: { name: user.name } }),
				type: 'success'
			}) || {
				text: $_('text.login-text')
			}
		);
	})($session.user);

	onMount(() => {
		/**
		 * DISPLAY RESULT MESSAGES
		 * There are two steps:
		 *
		 * Message 1: The flashStore handles the timeout time the first message should stay visible until the servers result message appears
		 * after the timeout the message will be reset empty and will therefore be unmounted.
		 *
		 * Message 2: After specified timeout a second message will be triggered by the store.
		 * This second message will be either a welcome message (on success) or
		 * a default message (on first appearance)
		 */
		if (!data) {
			/**
			 * Form login
			 */
			flash.update({ message: message.text, timeout: -5 });
		} else {
			/**
			 * Token login
			 */
			if (success) {
				flash.update({ type: 'success', ...data });
				setTimeout(scheduleSession, 100, 'start', data);
			} else {
				setTimeout(scheduleSession, 100, 'end', { path: '/login' });
				flash.update({ type: 'warning', ...data, timeout: 5000 });
			}
		}
	});

	function scheduleSession(type, data) {
		proxyEvent(`ticker:${type}`, { data });
	}

	function redirectAfterIntroEnd(e) {
		if ($session.user) {
			goto(redirectPath($page, $session));
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
						on:outrostart={(e) => (flashOutroEnded = false)}
						on:outroend={(e) => (flashOutroEnded = true)}
					>
						<h5 class="m-2 mdc-typography--headline5 headline">
							{$flash.message}
						</h5>
					</div>
				{:else if flashOutroEnded}
					<div
						class="flex justify-center message {message.type}"
						in:fly={flyTransitionParams}
						on:introend={(e) => redirectAfterIntroEnd(e)}
					>
						<h5 class="m-2 mdc-typography--headline5 headline">
							{message.text}
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
