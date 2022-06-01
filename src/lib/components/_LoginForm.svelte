<script context="module">
	let loginAttempts = 0;
</script>

<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { onMount, getContext } from 'svelte';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { post, proxyEvent } from '$lib/utils';
	import { flash, formGuard as frozen } from '$lib/stores';
	import Button from '@smui/button';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import { Label } from '@smui/common';
	import Dialog, { Title as DialogTitle, Content, Actions, InitialFocus } from '@smui/dialog';
	import { locale, _ } from 'svelte-i18n';
	import { dev } from '$app/env';

	const client_id = import.meta.env.VITE_CLIENT_ID;
	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const toplevel = dev ? 'dev' : 'de';

	// Fixtures
	const adminEmail = `sampleadmin@webpremiere.${toplevel}`;
	const adminPassword = 'Test@005';
	const userEmail = `sampleuser@webpremiere.${toplevel}`;
	const userPassword = 'Angela@005';

	let password = '';
	let email = '';
	let snackbar;
	let invalidTokenUserDialog;
	let timeout = 2000;

	onMount(() => {
		defreeze();
		snackbar = getSnackbar();

		(window.google && googleSignIn()) || window.addEventListener('load', googleSignIn);

		return () => defreeze();
	});

	async function submit() {
		freeze();
		flash.update({ message: $_('text.one-moment'), timeout: false });

		await post(`/auth/login?lang=${$locale}`, { email, password }).then((res) => {
			let type, wait;
			let message = res.message || res.data.message || res.statusText;

			defreeze();

			if (res.success) {
				type = 'success';
				proxyEvent('ticker:start', { ...res.data });
			} else {
				reset();
				type = 'warning';

				if (++loginAttempts > 3) invalidTokenUserDialog.setOpen(true);
			}

			flash.update({
				type,
				message,
				timeout
			});
			configSnackbar(message);
			snackbar.open();
		});

		// TODO handle network errors
		// errors = res.errors;
	}

	function reset() {
		email = '';
		password = '';
	}

	function freeze() {
		frozen.update('frozen');
	}

	function defreeze() {
		frozen.update(false);
	}

	function setFields(type) {
		switch (type) {
			case 'admin':
				email = adminEmail;
				password = adminPassword;
				break;
			case 'user':
				email = userEmail;
				password = userPassword;
		}
	}

	function invalidTokenDialogCloseHandler(e) {
		loginAttempts = 0;
	}

	function googleSignIn() {
		google.accounts.id.initialize({
			client_id,
			callback: handleCredentialResponse
		});
		renderGoogleButton();
	}

	async function handleCredentialResponse(response) {
		decodeJwtResponse(response.credential);
	}

	async function decodeJwtResponse(token) {
		flash.update({ message: $_('text.one-moment') });

		await api.post(`users/google_login?lang=${$locale}`, {}, token).then(async (res) => {
			if (res.success) {
				await goto(`/login/redirect/?token=${res.data.token}`);
			}
			setTimeout(() => renderGoogleButton(), 500);
		});
	}

	function renderGoogleButton() {
		google.accounts.id.renderButton(
			document.getElementById('googleButton'),
			{ theme: 'outline', size: 'large' } // customization attributes
		);
		google.accounts.id.prompt(); // also display the One Tap dialog
	}
</script>

<form on:submit|preventDefault={submit} method="post" class:frozen={$frozen}>
	<div class="login-grid">
		<span class="email-area lg:mr-2 flex flex-col">
			<Textfield
				variant="outlined"
				bind:value={email}
				label="Email"
				autocomplete="user-email"
				input$aria-controls="helper-text-outlined-email"
				input$aria-describedby="helper-text-outlined-email"
			>
				<Icon class="material-icons" slot="leadingIcon">mail</Icon>
			</Textfield>
		</span>
		<span class="pass-area lg:ml-2 flex flex-col">
			<Textfield
				variant="outlined"
				type="password"
				label={$_('text.password')}
				autocomplete="user-password"
				bind:value={password}
				input$aria-controls="helper-text-outlined-password"
				input$aria-describedby="helper-text-outlined-password"
			>
				<Icon class="material-icons" slot="leadingIcon">login</Icon>
			</Textfield>
		</span>
		<div class="button-area-one flex">
			<Button
				disabled={!(email && password)}
				class="login-button flex-1"
				type="submit"
				variant="raised"
			>
				<Label>Login</Label>
			</Button>
		</div>
		<div class="button-area-two flex">
			<Button
				on:click={() => setFields('admin')}
				color=""
				class="login-button flex-1"
				type="submit"
				variant="raised"
			>
				<Icon class="material-icons">supervisor_account</Icon>
				<Label>Sample Admin</Label>
			</Button>
		</div>
		<div class="button-area-three flex">
			<Button
				on:click={() => setFields('user')}
				color=""
				class="login-button flex-1"
				type="submit"
				variant="raised"
			>
				<Icon class="material-icons">person</Icon>
				<Label>Sample User</Label>
			</Button>
		</div>
		<div class="button-area-fore flex">
			<div id="googleButton" />
		</div>
		<div class="button-area-five flex">
			<div id="fbButton" />
		</div>
	</div>
</form>
<Dialog
	bind:this={invalidTokenUserDialog}
	aria-labelledby="info-title"
	aria-describedby="info-content"
	on:MDCDialog:closed={invalidTokenDialogCloseHandler}
>
	<DialogTitle id="info-title">{$_('text.login-issues')}</DialogTitle>
	<Content id="info-content">
		<div class="item">
			{@html $_('messages.should-contact-admin')}
		</div>
	</Content>
	<Actions>
		<Button action="none">
			<Label>{$_('text.close')}</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.login-grid {
		display: grid;
		grid-gap: 5px;
		grid-row-gap: 0.5rem;
		grid-template-columns: 1fr;
		grid-template-rows: repeat(2, 1fr);
		grid-template-areas:
			'email'
			'pass'
			'button1'
			'button2'
			'button3'
			'button4'
			'button5';
	}
	.email-area {
		grid-area: email;
	}
	.pass-area {
		grid-area: pass;
	}
	.button-area-one {
		grid-area: button1;
	}
	.button-area-two {
		grid-area: button2;
	}
	.button-area-three {
		grid-area: button3;
	}
	.button-area-fore {
		grid-area: button4;
	}
	.button-area-five {
		grid-area: button5;
	}

	@media screen and (min-width: 840px) {
		.login-grid {
			grid-template-areas:
				'email pass'
				'button1 button1'
				'button2 button3'
				'button4 button5';
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: 2fr 1fr 1fr 1fr;
			grid-row-gap: 1rem;
		}

		.button-area-two :global(.login-button:only-child) {
			margin: 0;
		}
		.button-area-two :global(.login-button:nth-child(even)) {
			margin-left: 10px;
		}
		.button-area-two :global(.login-button:nth-child(odd)) {
			margin-right: 10px;
		}
	}
</style>
