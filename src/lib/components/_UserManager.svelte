<script>
	// @ts-nocheck

	import './_switch.scss';
	import './_button.scss';
	import * as api from '$lib/api';
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import Header from './_Header.svelte';
	import { fly } from 'svelte/transition';
	import { users, flash, theme } from '$lib/stores';
	import { post, createRedirectSlug, proxyEvent, svg } from '$lib/utils';
	import Textfield from '@smui/textfield';
	import TextfieldIcon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import Button, { Group, Label, Icon } from '@smui/button';
	import FormField from '@smui/form-field';
	import Switch from '@smui/switch';
	import Select, { Option } from '@smui/select';
	import SelectIcon from '@smui/select/icon';
	import Paper, { Title } from '@smui/paper';
	import Menu from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, { Item, Separator, Text } from '@smui/list';
	import Component from './_Component.svelte';
	import InfoChips from './_InfoChips.svelte';
	import TokenInfo from './_TokenInfo.svelte';
	import MediaUploader from './_MediaUploader.svelte';
	import UserGraphic from './_UserGraphic.svelte';
	import { _ } from 'svelte-i18n';

	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const { open } = getContext('simple-modal');
	const adminActions = ['edit', 'pass', 'del'];
	const userActions = ['edit', 'pass'];

	export let selectionUserId = null;
	export let selectedMode = 'edit';

	let code;
	let root;
	let currentUser;
	let group;
	let invalidEmail = false;
	let password = '';
	let repeatedPassword = '';
	let snackbar;
	let message;
	let avatarMenu;
	let avatarMenuAnchor;
	let token = '';
	let activeLabel;
	let textAreaMagicLink;
	let copyTimeoutId;
	let copyButton = (node) => console.log(node);
	let setCopyButton = (node) => (copyButton = node);
	let group_id;
	let name = '';
	let email = '';
	let active = false;

	$: user = $session.user;
	$: groups = $session.groups || [];
	$: currentUser = ((id) => {
		const user = $users.filter((usr) => usr?.id === id)[0];
		if (user) copy(user);
		return user;
	})(selectionUserId);
	$: userNotFound = selectionUserId && undefined === $users.find((u) => u.id === selectionUserId);
	$: _name = ((usr) => usr?.name || '')(selectedMode !== 'add' ? currentUser : false);
	$: _active = ((usr) => usr?.active || false)(selectedMode !== 'add' ? currentUser : false);
	$: _email = ((usr) => usr?.email || '')(selectedMode !== 'add' ? currentUser : false);
	$: _group_id = ((usr) => usr?.group_id || '')(selectedMode !== 'add' ? currentUser : false);
	$: group = ((usr) => usr?.group || '')(selectedMode !== 'add' ? currentUser : false);
	$: invalidPassword = password.length < 8;
	$: invalidRepeatedPassword = password !== repeatedPassword || invalidPassword;
	$: canSave =
		selectedMode === 'add'
			? name && group_id && !invalidEmail && !invalidRepeatedPassword
			: active !== _active ||
			  name !== _name ||
			  group_id != _group_id ||
			  (email !== _email && !invalidEmail);
	$: canReset =
		active !== _active ||
		name !== _name ||
		email !== _email ||
		group_id != _group_id ||
		password ||
		repeatedPassword;
	$: (() => resetPassword())(selectionUserId);
	$: isAdmin = $session.role === 'Administrator';
	$: actions = isAdmin ? adminActions : userActions;
	$: userCan = ((userActions) =>
		[...actionsLookup].filter((s) => userActions.find((u) => s.action === u)))(actions);
	$: ((user) => {
		token = user?.jwt || '';
		activeLabel = (active && $_('text.deactivate-user')) || $_('text.activate-user');
	})(currentUser);
	$: magicLink = (token && `http://${$page.url.host}/login?token=${token}`) || '';
	$: actionsLookup = new Set([
		{ action: 'edit', name: 'text.edit-user' },
		{ action: 'pass', name: 'text.edit-password' },
		{ action: 'del', name: 'text.delete-user' }
	]);

	onMount(() => {
		root = document.documentElement;
		root.classList.add('profiledata--open');

		snackbar = getSnackbar();

		return () => {
			root.classList.remove('profiledata--open');
		};
	});

	let openUploader = () => {
		open(
			MediaUploader,
			{
				type: 'avatar',
				uid: currentUser.id,
				options: {
					parallelUploads: 1,
					maxFiles: 1
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

	async function uploadDone(e) {
		let detail = e.detail;
		let message;

		message = detail.message || detail.data.message;
		if (detail.success) {
			const user = detail.data;
			users.put(user);

			// also reflect the change in the session cookie
			if ($session.user.id === detail.data.id) {
				$session.user = detail.data;

				await post('/auth/save', { user });
			}
		}
		configSnackbar(message);
		snackbar.open();
	}

	async function deleteAvatar() {
		const res = await api.del(`avatars/${currentUser.avatar.id}`, { token: user?.jwt });
		message = res.message || res.data.message;
		if (res.success) {
			users.put(res.data);

			// also reflect the change in the session cookie
			if ($session.user.id === currentUser.id) {
				await post('/auth/save', {
					user: currentUser
				});
			}
		}
		configSnackbar(message);
		snackbar.open();
	}

	async function activateUser() {
		await api
			.put(`users/${selectionUserId}`, { data: { active }, token: user?.jwt })
			.then((res) => {
				if (res) {
					message = res.message || res.data.message || res.statusText;
					code = (res.data && res.data.code) || res.status;

					if (res.success) {
						users.put({ ...currentUser, active });
					} else if (200 < code && code < 500) {
						// Sample Users are protected
						reset();
					}

					configSnackbar(message);
					snackbar.isOpen && snackbar.close();
					snackbar.open();
				}
			});
	}

	function copy(user) {
		({ name, email, active, group_id } = { ...user });
	}

	async function submit(event) {
		let res, data, path, action;
		snackbar.isOpen && snackbar.close();
		let mode = selectedMode;

		switch (mode) {
			case 'add':
				data = { active, email, name, password, group_id };
				res = await api.post(`users/add`, { data, token: user?.jwt });
				break;
			case 'edit':
				data = { active, email, name, group_id };
			case 'pass':
				data = data || { password, token };
				res = await api.put(`users/${selectionUserId}`, { data, token: user?.jwt });
				break;
			case 'del':
				if (!confirm($_('messages.permanently-remove-user', { values: { name } }))) return;
				res = await api.del(`users/${selectionUserId}`, { token: user?.jwt });
				break;
			default:
				return;
		}

		// TODO handle network errors

		if (res) {
			message = res.message || res.data.message || res.statusText;
			code = res.data?.code || res.status;

			if (res.success) {
				switch (selectedMode) {
					case 'add':
						// fetch users and offer to jump to new user
						const resUsers = await api.get('users', { token: user?.jwt });
						if (resUsers.success) {
							users.update(resUsers.data);
							reset();

							path = `users/${res.data.id}?tab=user`;
							action = $_('text.reveal-user');
							configSnackbar(message, { path, action });
							snackbar.open();
						}
						break;
					case 'pass':
						resetPassword();
					case 'edit':
						users.put(({ ...data } = { ...res.data }));

						configSnackbar(message);
						snackbar.open();
						break;
					case 'del':
						users.del(selectionUserId);
						selectionUserId = null;

						configSnackbar(message, 'users');
						snackbar.open();
				}
			} else if (200 < code && code < 500) {
				// Sample Users are protected
				reset();
				configSnackbar(message);
				snackbar.open();
			} else {
				flash.update({ type: 'error', message });

				path = `login${createRedirectSlug($page.url)}`;
				configSnackbar(message, path);
				snackbar.open();
			}
		}
	}

	function reset() {
		active = _active;
		email = _email;
		name = _name;
		group_id = _group_id;
		resetPassword();
	}

	function resetPassword() {
		password = repeatedPassword = '';
	}

	function copyToClipBoard(e) {
		if (textAreaMagicLink) {
			let didCopy,
				inputEl,
				label = copyButton && copyButton.getElementsByClassName('token-button-label').item(0);
			inputEl = textAreaMagicLink.getElementsByTagName('input').item(0);
			inputEl.focus();
			inputEl.select();
			didCopy = document.execCommand('copy');
			if (didCopy) {
				label.innerText = $_('text.copied');
				clearTimeout(copyTimeoutId);
				copyTimeoutId = setTimeout(() => (label.innerText = $_('text.copy')), 4000);
			}
		}
	}
</script>

{#if $session.user}
	<div class="grid-item user" style="height: 100%;">
		<Component extended>
			<div slot="header">
				<div class="">
					<Header h="5" mdc>
						<span>
							{#if currentUser}
								{currentUser.name}
							{:else if selectedMode === 'add'}{$_('text.create-new-user')}{/if}
						</span>
					</Header>
					<button on:click={() => goto('/users')} class="button-close" variant="outlined">
						<Icon class="material-icons" style="vertical-align: middle;">close</Icon>
					</button>
				</div>
			</div>
			<div class="flex flex-shrink flex-wrap">
				{#if userNotFound}
					<div class="exception user-not-found">
						<div class="flex justify-center items-center flex-1">
							<div class="empty-selection">
								<span style="text-align: center;">{$_('text.empty-user-selection')}</span>
							</div>
						</div>
					</div>
				{:else}
					{#if selectionUserId}
						<div class="avatar-container" on:click={() => avatarMenu.setOpen(true)}>
							<div bind:this={avatarMenuAnchor} use:Anchor>
								<UserGraphic
									size="100"
									user={currentUser}
									borderSize="4"
									borderColor="--prime"
									extendedBorderColor="--back-grid-item"
									extendedBorderSize="10"
									badge={currentUser?.role === 'Administrator' && {
										icon: 'admin_panel_settings',
										color: 'rgb(206, 4, 4)',
										position: 'BOTTOM_RIGHT',
										size: 'large'
									}}
								/>
								<Menu
									bind:this={avatarMenu}
									anchor={false}
									bind:anchorElement={avatarMenuAnchor}
									anchorCorner="TOP_END"
								>
									<List>
										<Item on:click={() => openUploader()}>
											<Text
												>{currentUser.avatar
													? $_('text.change-avatar')
													: $_('text.add-avatar')}</Text
											>
										</Item>
										<Item disabled={!currentUser.avatar} on:click={() => deleteAvatar()}>
											<Text>{$_('text.remove-avatar')}</Text>
										</Item>
									</List>
								</Menu>
							</div>
						</div>
					{/if}
					<form on:submit|preventDefault={submit} method="post" class="table">
						<div class="user-items">
							{#if selectedMode !== 'add'}
								<div class="flex justify-between flex-wrap">
									<div class="select-item item">
										<Select
											bind:value={selectedMode}
											label={$_('text.select-mode')}
											class="select-width"
											menu$class="select-width"
											variant="filled"
										>
											{#each userCan as can}
												<Option value={can.action} selected={selectedMode === can.action}>
													{$_(can.name)}
												</Option>
											{/each}
										</Select>
									</div>
									{#if isAdmin && selectedMode === 'edit'}
										<div class="item flex items-center">
											<div class="ml-3" style="flex: 0.5;">
												<FormField>
													<Switch
														class="user-activation"
														bind:checked={active}
														on:SMUISwitch:change={() => activateUser()}
													/>
													<span slot="label" class="switch-label">{activeLabel}</span>
												</FormField>
											</div>
										</div>
									{/if}
								</div>
							{/if}
							{#if selectedMode === 'add' || selectedMode === 'edit'}
								<div class="item">
									<Textfield
										bind:value={name}
										label="Name"
										type="text"
										input$aria-controls="helper-text-name"
										input$aria-describedby="helper-text-name"
									>
										<TextfieldIcon slot="leadingIcon" class="material-icons"
											>contact_page</TextfieldIcon
										>
										<HelperText slot="helper" id="helper-text-name"
											>{$_('text.your-name')}</HelperText
										>
									</Textfield>
								</div>
								<div class="item">
									<Textfield
										class="w-full"
										bind:value={email}
										bind:invalid={invalidEmail}
										label="Email"
										type="email"
										updateInvalid
										input$autocomplete="email"
									>
										<TextfieldIcon
											slot="leadingIcon"
											class="material-icons"
											style="font-size: 1em; line-height: normal; vertical-align: middle;"
											>email</TextfieldIcon
										>
										<HelperText slot="helper" id="helper-text-email" validationMsg
											>{$_('text.invalid-email')}</HelperText
										>
									</Textfield>
								</div>

								<div class="item">
									<Select
										disabled={!isAdmin}
										bind:value={group_id}
										label={$_('text.user-role')}
										class="select-width"
									>
										<SelectIcon slot="leadingIcon" class="material-icons">contact_page</SelectIcon>
										{#each groups as group}
											<Option value={group.id} selected={group_id === group.id}>
												{$_(group.name)}
											</Option>
										{/each}
									</Select>
								</div>
							{/if}
							{#if selectedMode === 'add' || selectedMode === 'pass'}
								<div class="item">
									<Textfield
										type="password"
										bind:invalid={invalidPassword}
										bind:value={password}
										label={$_('text.password')}
										input$aria-controls="helper-password"
										input$aria-describedby="helper-password"
										style="min-width: 250px;"
									>
										<TextfieldIcon slot="leadingIcon" class="material-icons"
											>fingerprint</TextfieldIcon
										>
										<HelperText slot="helper" id="helper-password"
											>{$_('text.password-hint')}</HelperText
										>
									</Textfield>
								</div>
								<div class="item">
									<Textfield
										type="password"
										disabled={invalidPassword}
										bind:invalid={invalidRepeatedPassword}
										bind:value={repeatedPassword}
										label={$_('text.repeat-password')}
										input$aria-controls="helper-password-repeat"
										input$aria-describedby="helper-password-repeat"
									>
										<TextfieldIcon slot="leadingIcon" class="material-icons"
											>fingerprint</TextfieldIcon
										>
										<HelperText slot="helper" id="helper-password-repeat">
											{$_('text.invalid-password')}
										</HelperText>
									</Textfield>
								</div>
							{/if}
							{#if selectedMode === 'add' || selectedMode === 'edit' || selectedMode === 'pass'}
								<div class="item">
									<div class="button-group">
										<Group>
											{#if selectedMode !== 'pass'}
												<Button disabled={!canSave} color="primary" variant="unelevated">
													<Label>{$_('text.save')}</Label>
													<Icon class="material-icons">save</Icon>
												</Button>
											{:else}
												<Button
													disabled={invalidRepeatedPassword}
													color="primary"
													variant="unelevated"
												>
													<Label>{$_('text.save')}</Label>
													<Icon class="material-icons">save</Icon>
												</Button>
											{/if}
											<Button
												disabled={!canReset}
												type="reset"
												color="primary"
												on:click={reset}
												variant="unelevated"
											>
												<Label>{$_('text.reset')}</Label>
												<Icon class="material-icons">settings_backup_restore</Icon>
											</Button>
										</Group>
									</div>
								</div>
							{/if}
							{#if selectedMode === 'del'}
								<div class="item">
									<div class="alert" role="alert">
										<div class="mdc-theme-error-bg rounded-t px-4 py-2">
											{$_('text.attention')}
										</div>
										<div
											class="border border-t-0 rounded-b bg-warning-100 px-4 py-3 mdc-theme-error-color"
										>
											<p>{$_('text.you-cant-revert-deletion-of-user')}</p>
											<Button class="error mt-5" variant="unelevated">
												<Label>{$_('text.delete-user')}</Label>
												<Icon class="material-icons">delete</Icon>
											</Button>
										</div>
									</div>
								</div>
							{/if}
							{#if !selectedMode}
								<div class="exception no-selection">
									<Paper color="primary">
										<Title style="color: var(--text-light)">
											{$_('text.select-edit-mode')}
											{selectedMode}
										</Title>
									</Paper>
								</div>
							{/if}
						</div>
					</form>
				{/if}
				{#if currentUser && isAdmin}
					<div class="table-wrapper">
						<div class="token-factory" class:no-token={!token}>
							<div class="main-info">
								<div class="button-group token-action-buttons flex mt-1 mb-3">
									<Group>
										<Button
											class="magic-link"
											variant="raised"
											on:click={() => proxyEvent('INFO:token:Generate', { open: !!token })}
										>
											<Icon class="material-icons">link</Icon>
											<Label class="token-button-label">
												{$_('text.generate-token')}
											</Label>
										</Button>
										<Button
											disabled={(group && group.name) === 'Administrator' ||
												!token ||
												currentUser.protected}
											label={$_('text.can-not-remove-admin-token')}
											variant="raised"
											on:click={() => proxyEvent('INFO:token:Remove', { open: true })}
										>
											<Icon class="material-icons">link_off</Icon>
											<Label class="token-button-label">{$_('text.remove-token')}</Label>
										</Button>
									</Group>
								</div>
								<div class="item ">
									<TokenInfo {selectionUserId} />
								</div>
								<div class="item info-section">
									<InfoChips {selectionUserId} />
								</div>
								<div class="item">
									{#if token}
										<div class="button-group magic-link-group token-action-buttons flex">
											<Group style="max-width: 100%;">
												<Button
													class="action-magic-link"
													on:click={() => proxyEvent('INFO:token:Redirect')}
													variant="outlined"
												>
													<Icon class="material-icons">link</Icon>
													<Label class="token-button-label">Magic Link</Label>
												</Button>
												<Button
													href={`${$page.url.pathname}?tab=mail&active=template:magic-link`}
													class="action-email"
													disabled={!token}
													variant="unelevated"
												>
													<Icon class="material-icons">send</Icon>
													<Label class="token-button-label">
														{$_('text.email')}
													</Label>
												</Button>
												<Button
													class="input"
													use={[(node) => (textAreaMagicLink = node)]}
													disabled={!token}
													variant="outlined"
												>
													<input type="text" value={magicLink} />
												</Button>
												<Button
													use={[setCopyButton]}
													class="action-copy"
													disabled={!token}
													variant="unelevated"
													on:click={(e) => copyToClipBoard(e)}
												>
													<Icon class="material-icons">file_copy</Icon>
													<Label class="token-button-label">
														{$_('text.copy')}
													</Label>
												</Button>
											</Group>
										</div>
									{/if}
								</div>
							</div>
							<div class="additional-info">
								{#if token}
									<div class="item">
										<h5 class="mb-4">{$_('text.next-steps')}</h5>
										<details>
											<summary>{$_('summary.test-magic-link.header')}</summary>
											<p>
												{@html $_('summary.test-magic-link.text', {
													values: {
														currentUserName: currentUser.name,
														sessionUserName: $session.user?.name
													}
												})}
											</p>
										</details>
										<details>
											<summary>{$_('summary.send-email.header')}</summary>
											<p>
												{@html $_('summary.send-link.text')}
											</p>
										</details>
										<details>
											<summary>{@html $_('summary.copy-link.header')}</summary>
											<p>{@html $_('summary.copy-link.text')}</p>
										</details>
									</div>
								{/if}
							</div>
							<div class="item">
								<span>
									<Icon class="material-icons">info</Icon>
									<a
										href="."
										class="item"
										on:click|preventDefault={() => proxyEvent('INFO:open:InfoDialog')}
									>
										{$_('summary.howDoesItWork.text')}
									</a>
								</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</Component>
	</div>
{:else}
	<div class="empty-selection no-user-selection">
		<span style="text-align: center;">{$_('text.empty-user-selection')}</span>
	</div>
{/if}

<style>
	form {
		position: relative;
		flex: 1;
	}
	.grid-item {
		background: var(--back-grid-item);
	}
	.user {
		grid-area: one;
		overflow: auto;
	}
	.user-items {
		display: flex;
		flex-direction: column;
	}
	.item {
		margin-bottom: 1.1rem;
	}
	:global(.item > label) {
		width: 100%;
	}
	.exception {
		display: flex;
		text-align: center;
		flex: 1 0 0%;
		justify-content: center;
	}
	.alert {
		display: table;
		margin-bottom: 1em;
	}
	.avatar-container {
		display: flex;
		justify-content: flex-end;
		position: absolute;
		right: 50px;
		top: 20px;
		z-index: 1;
	}
	.avatar-container :global(img) {
		cursor: pointer;
	}
	.table-wrapper {
		flex: 1;
		background: #fff;
		border: 1px solid #dcdcdc;
		margin-left: 3rem;
		border-radius: 2px;
		padding: 30px;
	}
	.token-factory > *:nth-child(1) {
		padding-bottom: 0;
	}
	.token-factory > *:nth-child(2) {
		padding-top: 0;
	}
	.token-factory.no-token :global(button.magic-link) {
		background-color: var(--error);
	}
	.token-factory .additional-info {
		overflow: auto;
	}
	.item :global(.material-icons.mdc-button__icon) {
		vertical-align: middle;
	}
	.token-factory .item {
		font-size: 0.8rem;
	}
	.token-action-buttons :global(.token-button-label) {
		font-size: 0.6rem;
		max-width: 130px;
	}
	.button-group :global(.smui-button__group) {
		flex: 1;
	}
	.button-group :global(button) {
		flex: 1;
	}
	.magic-link-group > :global(.smui-button__group > button.action-magic-link) {
		flex: 0 1 33.3333%;
	}
	.magic-link-group > :global(.smui-button__group > button.action-email) {
		flex: 0 1 33.3333%;
	}
	.magic-link-group > :global(.smui-button__group > button.input) {
		position: absolute;
		right: 9999999px;
		font-size: 0.1em;
		width: 1px;
		height: 1px;
	}
	.magic-link-group > :global(.smui-button__group > button.action-copy) {
		flex: 0 1 33.3333%;
	}
	.button-close {
		display: none;
	}
	.switch-label {
		display: block;
		max-width: 90px;
		width: 90px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.item.info-section {
		padding: 10px;
		min-height: 90px;
		align-items: center;
		font-size: 0.9em;
		border: 1px solid #ddf9ff;
		background: aliceblue;
		color: #c4e3ff;
	}
	:global(.add-user-view--open) .button-close {
		display: block;
		position: absolute;
		right: 20px;
		top: 50%;
		transform: translate(50%, -50%);
	}
	.mdc-theme-error-bg {
		background-color: var(--mdc-theme-error);
		color: var(--mdc-theme-surface);
	}
	.mdc-theme-error-color {
		color: var(--mdc-theme-error);
		border-color: var(--mdc-theme-error);
	}
	.empty-selection {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 2em;
		font-weight: 600;
		color: #d8d8d8;
	}
</style>
