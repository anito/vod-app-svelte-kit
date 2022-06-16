<script>
	// @ts-nocheck

	import './_drawer.scss';
	import * as api from '$lib/api';
	import { onMount, tick, getContext } from 'svelte';
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fabs, users, sents, inboxes, templates } from '$lib/stores';
	import { slugify } from '$lib/utils';
	import MailViewer from './_MailViewer.svelte';
	import MailList from './_MailList.svelte';
	import MailToolbar from './_MailToolbar.svelte';
	import MailTemplateToolbar from './_MailTemplateToolbar.svelte';
	import MailTemplate from './_MailTemplate.svelte';
	import Badge from './_Badge.svelte';
	import BadgeGroup from './_BadgeGroup.svelte';
	import Dot from './_Dot.svelte';
	import { _ } from 'svelte-i18n';
	import Drawer, { AppContent, Content, Header, Title, Subtitle, Scrim } from '@smui/drawer';
	import Button, { Group, Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import List, {
		Item,
		Text,
		Graphic,
		Separator,
		PrimaryText,
		SecondaryText,
		Meta
	} from '@smui/list';
	import Fab, { Label, Icon as FabIcon } from '@smui/fab';
	import Dialog, {
		Title as DialogTitle,
		Content as DialogContent,
		Actions,
		InitialFocus
	} from '@smui/dialog';

	const { getSnackbar, configSnackbar } = getContext('snackbar');
	const { setFab } = getContext('fab');
	const sortAZProtected = (a, b) => {
		let ap = (a['protected'] && a['name'].toLowerCase()) || 'z';
		let bp = (b['protected'] && b['name'].toLowerCase()) || 'z';
		let an = a['name'].toLowerCase();
		let bn = b['name'].toLowerCase();
		if (ap < bp) return -1;
		if (ap > bp) return 1;
		if (an < bn) return -1;
		if (an > bn) return 1;
		return 0;
	};
	const templateSlugData = [
		{
			'magic-link': () => {
				return {
					validate: () => currentUser.active && isValidToken() && { href: getMagicLink() },
					label: $_('text.magic-link')
				};
			}
		},
		{
			welcome: () => {
				return {
					validate: () => currentUser.active && isValidToken() && { href: getMagicLink() },
					label: $_('text.welcome-link-label')
				};
			}
		}
	];

	const defaultActive = 'inboxes';

	let sort = 'DESC';
	let drawer;
	let snackbar;
	let drawerOpen;
	let drawerOpenOnMount = true;
	let selected;
	let unreadInboxes = 0;
	let activeTemplate = false;
	let canSave;
	let working;
	let templateComponent;
	let unsavedChangesDialog;
	let editable;
	let editor = {};
	let pendingActiveTemplate;
	let activeMailbox;
	let selectionIndex;

	export let selectionUserId = null;

	$: isAdmin = $session.role === 'Administrator';
	$: currentUser =
		((id) => $users.filter((usr) => usr.id === id))(selectionUserId)[0] || $session.user;
	$: selectionUserId && (selectionIndex = -1);
	$: username = currentUser && currentUser.name;
	$: totalMails = currentUser && $sents.length;
	$: totalInboxes = currentUser && $inboxes.length;
	$: unreadInboxes = currentUser && $inboxes.filter((mail) => !mail.read).length;
	$: email = currentUser && currentUser.email;
	$: currentUser && getInbox(currentUser);
	$: currentUser && getSent(currentUser);
	$: templateSlug = $page.url.searchParams.get('active') || defaultActive;
	$: setActiveList(templateSlug);
	$: activeTemplate = matchesTemplate(activeMailbox);
	$: dynamicTemplateData = currentUser && getTemplateData(activeTemplate);
	$: currentTemplate = $templates.find((tmpl) => tmpl.slug === activeTemplate) || null;
	$: currentTemplate && isAdmin ? setFab('send-mail') : setFab('');
	$: currentStore =
		activeMailbox === 'inboxes' ? inboxes : activeMailbox === 'sents' ? sents : inboxes;
	$: dynamicTemplatePath = currentUser && ((slug) => createTemplatePath(slug));
	$: data = dynamicTemplateData && {
		...dynamicTemplateData,
		...dynamicTemplateData.validate(currentTemplate)
	};

	onMount(async () => {
		snackbar = getSnackbar();
		getTemplates();

		drawerOpen = drawerOpenOnMount;
	});

	function createTemplatePath(target) {
		$page.url.searchParams.set('active', target);
		return `${validateUserPath($page.url.pathname)}?${$page.url.searchParams.toString()}`;
	}

	/**
	 * User ID comes from $page.params.slug
	 * Fix non-existent users (caused from from a redirect) in case there is no such
	 * @param path
	 *
	 * @returns (String) path
	 */
	function validateUserPath(path) {
		const user = currentUser;
		const regex = /(\/users\/)([\w-]+)/g;
		const subst = `$1${user.id}`;
		return path.replace(regex, subst);
	}

	async function gotoActiveBox(active) {
		if (!active) active = defaultActive;
		// fix falsy users and append mailbox path to url
		return await goto(createTemplatePath(active));
	}

	async function sendMail() {
		const res = await api.post(
			'sents/add/',
			{
				email: currentUser.email,
				...working,
				template: {
					slug: currentTemplate.slug,
					themeVars: [{ '--prime': '#ad1457' }],
					data
				}
			},
			$session.user?.jwt
		);
		if (res.success) {
			configSnackbar($_('text.message-sent-success'));
			reloadMails();
		} else {
			configSnackbar($_('text.message-sent-failed'));
		}
		snackbar.open();
	}

	async function getInbox(user) {
		let items = [],
			_users;
		const res = await api.get(`inboxes/get/${user.id}`, $session.user?.jwt);
		if (res.success) {
			res.data.map((mail) => {
				let message = JSON.parse(mail.message);
				items.push({
					id: mail.id,
					from:
						(_users = $users.filter((user) => user.email === mail._from)) && _users.length
							? _users
							: [mail._from],
					to: [user],
					message: message.message,
					subject: message.subject,
					read: mail._read,
					created: mail.created
				});
			});
			inboxes.update(items);
		}
	}

	async function getSent(user) {
		let items = [],
			_users;
		const res = await api.get(`sents/get/${user.id}`, $session.user?.jwt);
		if (res.success) {
			let _to;
			res.data.map((mail) => {
				let message = JSON.parse(mail.message);
				_to = mail._to.split(';');
				items.push({
					id: mail.id,
					from: [user],
					to:
						(_users = $users.filter((user) => _to.find((adr) => adr === user.email))) &&
						_users.length
							? _users
							: _to,
					message: message.message,
					subject: message.subject,
					read: true,
					created: mail.created
				});
			});
			sents.update(items);
		}
	}

	function setActiveList(value) {
		if (activeMailbox != matchesTemplate(value) && canSave) {
			pendingActiveTemplate = value;
			unsavedChangesDialog.setOpen(true);
		} else {
			activeMailbox = value;
		}
	}

	async function toggleRead(e) {
		let _selected, _read;
		_selected = e && e.detail.selected;
		_read = e && e.detail.read != void 0 ? e.detail.read : !_selected.read;
		const res = await api.put(`inboxes/${_selected.id}`, { _read }, $session.user?.jwt);
		if (res.success) {
			selected = { ..._selected, read: _read };
			inboxes.put(selected);
		}
	}

	async function deleteMail(e) {
		let _selected = e.detail.selected;
		const res = await api.del(`${activeMailbox}/${_selected.id}`, $session.user?.jwt);
		if (res.success) {
			currentStore.del(_selected.id);
		}
	}

	function reloadMails() {
		currentUser = currentUser;
	}

	function toggleSortByDate() {
		sort = sort === 'DESC' ? 'ASC' : 'DESC';
	}

	async function getTemplates() {
		const res = await api.get('templates', $session.user?.jwt);
		if (res.success) {
			templates.update(res.data);
		}
	}

	function resetTemplate() {
		templateComponent.resetTemplate();
	}

	async function addTemplate() {
		if (!$templates.length) return;
		let { name, slug } = generateName();
		let items = [];
		let template = $templates[0];
		template.items.map((item) => {
			items.push({
				content: '',
				field_id: item.field.id,
				field: item.field
			});
		});
		let newTemplate = { name, slug, items };
		const res = await api.post('templates', { ...newTemplate }, $session.user?.jwt);
		configSnackbar(res.message);
		if (res.success) {
			templates.add({ ...newTemplate, id: res.data.id, items: res.data.items });
			gotoActiveBox(templateStringFromSlug(slug));
		}
		snackbar.open();
	}

	async function saveTemplate() {
		let items = [];
		currentTemplate.items.map((item) => {
			let content = working[item.field.name];
			item.content = content;
			items.push({ id: item.id, content });
		});
		const res = await api.put(`templates/${currentTemplate.id}`, { items }, $session.user?.jwt);
		configSnackbar(res.message);
		if (res.success) {
			templates.put({ ...currentTemplate });
			templateComponent.createWorkingCopy();
		}
		snackbar.open();
	}

	async function duplicateTemplate() {
		let { name, slug } = generateName(currentTemplate.name);
		let items = [];
		currentTemplate.items.map((item) => {
			items.push({
				content: working[item.field.name],
				field_id: item.field.id,
				field: item.field
			});
		});

		let newTemplate = { name, slug, items };
		const res = await api.post('templates', { ...newTemplate }, $session.user?.jwt);
		configSnackbar(res.message);
		if (res.success) {
			templates.add({ ...newTemplate, id: res.data.id, items: res.data.items });
			gotoActiveBox(templateStringFromSlug(slug));
		}
		snackbar.open();
	}

	async function removeTemplate() {
		const res = await api.del(`templates/${currentTemplate.id}`, $session.user?.jwt);
		configSnackbar(res.message);
		if (res.success) {
			templates.del(currentTemplate.id);
		}
		snackbar.open();
	}

	function getTemplateData(slug) {
		let data;
		if ((data = templateSlugData.find((i) => i[slug])) && typeof data[slug] === 'function') {
			return data[slug]();
		}
		return false;
	}

	function unsavedChangesDialogCloseHandler(e) {
		if (e.detail.action === 'discard') {
			pendingActiveTemplate && (activeMailbox = pendingActiveTemplate);
			pendingActiveTemplate = void 0;
		}
	}

	function overEditable(e) {
		editable = e.currentTarget;
		editable && editable.classList.add('hover');
	}

	function leaveEditable(e) {
		if (editable && editable.getElementsByClassName('editor').length) return;
		editable && editable.classList.remove('hover');
	}

	function makeEditable(e, id) {
		cancelEvent(e);
		let range = document.createRange();
		let selection = window.getSelection();
		let children = editable.getElementsByClassName('editable');
		let node = children.length && children[0];

		editor.node && editor.node.classList.remove('editor');

		editor = { id, node, value: node.innerText, editable };
		editor.node.classList.add('editor');
		editor.node.setAttribute('contenteditable', 'true');
		editor.node.addEventListener('keydown', keyListener);
		editor.node.addEventListener('click', cancelEvent);
		editor.node.focus();
		range.selectNodeContents(editor.node);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	function keyListener(e) {
		e.stopPropagation();
		// console.log('code', e.code);
		// console.log('key', e.key);
		// console.log('keyCode', e.keyCode);

		const isEnter = e.key === 'Enter' || e.keyCode === 13;
		const isEscape = e.key === 'Escape' || e.keyCode === 27;
		if (isEnter) {
			saveEditable(e);
		}
		if (isEscape) {
			cancelEditable(e);
		}
	}

	function cancelEvent(e) {
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
	}

	async function saveEditable(e) {
		cancelEvent(e);
		let success;
		editor.node.classList.remove('editor');
		editor.node.setAttribute('contenteditable', 'false');
		editor.node.removeEventListener('keydown', keyListener);
		editor.node.removeEventListener('click', cancelEvent);
		editor.editable.classList.remove('hover');
		if (editor.value !== editor.node.innerText) {
			success = await saveTemplateName();
			!success && restoreTemplateName();
		}

		editor.id = void 0;
	}

	function cancelEditable(e) {
		cancelEvent(e);

		editor.node.classList.remove('editor');
		editor.node.setAttribute('contenteditable', 'false');
		editor.node.removeEventListener('keydown', keyListener);
		editor.node.removeEventListener('click', cancelEvent);
		editor.editable.classList.remove('hover');

		restoreTemplateName();

		editor.id = void 0;
	}

	async function restoreTemplateName() {
		let id = editor.id;
		let name = editor.value;
		let template = $templates.find((tmpl) => tmpl.id === id);

		if (!template) return;

		if (template) {
			templates.put({ ...template, name: '' });
			await tick();
			templates.put({ ...template, name });
		}
	}

	async function saveTemplateName() {
		let id = editor.id;
		let name = editor.node.innerText;
		let template = $templates.find((tmpl) => tmpl.id === id);

		if (!template) return;

		const res = await api.put(`templates/${id}`, { name }, $session.user?.jwt);
		if (res.success) {
			templates.put({ ...template, name });
			configSnackbar($_('text.template-renamed'));
		} else {
			configSnackbar($_('text.template-could-not-be-renamed'));
		}
		snackbar.open();
		return res.success;
	}

	function isValidToken() {
		let expires = currentUser.expires;
		if (!isNaN(expires)) return expires * 1000 > +new Date().getTime();
		return false;
	}

	function generateName(name) {
		let slug,
			newName = (name && name.concat($_('text.new-copy-label'))) || $_('text.new');
		if ($templates.find((tmpl) => tmpl.name === newName)) {
			return generateName(newName);
		}
		slug = generateSlug(newName);
		return { name: newName, slug };
	}

	function generateSlug(name) {
		let slug = slugify(name);
		if ($templates.find((tmpl) => tmpl.slug === slug)) {
			return generateSlug(slug.concat(' copy'));
		}
		return slug;
	}

	function matchesTemplate(value) {
		if (!value) return;
		let matches = value.match(/(template):([\w-:\d]+)/);
		if (matches) return matches[2];
	}

	function templateStringFromSlug(slug) {
		return `template:${slug}`;
	}

	function validateData(template) {
		let data = getTemplateData(template.slug);
		if (data) {
			return data.validate();
		}
		return true;
	}

	function getMagicLink() {
		if (currentUser?.jwt) {
			return `${$page.url.origin}/login?token=${currentUser.jwt}`;
		}
	}
</script>

{#if $session.user}
	<div class="grid-item mail">
		<div class="drawer-container">
			<Drawer variant="dismissible" bind:this={drawer} bind:open={drawerOpen}>
				<Header>
					<Title>{username}</Title>
					<Subtitle>{email}</Subtitle>
				</Header>
				<Content>
					<List>
						<Item
							sveltekit:prefetch
							href={dynamicTemplatePath('inboxes')}
							on:click={() => (selectionIndex = -1)}
							activated={activeMailbox === 'inboxes'}
						>
							<Graphic class="material-icons" aria-hidden="true">inbox</Graphic>
							<Text>{$_('text.inbox')}</Text>
							<BadgeGroup right>
								{#if totalInboxes}
									<Badge class="medium">{totalInboxes}</Badge>
								{/if}
								{#if totalInboxes && unreadInboxes > 0}
									<Badge class="medium flash">{unreadInboxes}</Badge>
								{/if}
							</BadgeGroup>
						</Item>
						<Item
							sveltekit:prefetch
							href={dynamicTemplatePath('sents')}
							on:click={() => (selectionIndex = -1)}
							activated={activeMailbox === 'sents'}
						>
							<Graphic class="material-icons" aria-hidden="true">send</Graphic>
							<Text>{$_('text.sent')}</Text>
							{#if totalMails}
								<Badge class="medium" right>{totalMails}</Badge>
							{/if}
						</Item>

						{#if $session.role === 'Administrator'}
							<Separator />
							<div class="flex justify-between">
								<SecondaryText>{$_('text.email-templates')}</SecondaryText>
								<Group>
									<IconButton
										class="material-icons"
										on:click={() => removeTemplate()}
										toggle
										aria-label={$_('text.template-remove')}
										title={$_('text.template-remove')}
										disabled={!currentTemplate || (currentTemplate && currentTemplate.protected)}
									>
										remove
									</IconButton>
									<IconButton
										class="material-icons"
										on:click={() => duplicateTemplate()}
										toggle
										aria-label={$_('text.template-duplicate')}
										title={$_('text.template-duplicate')}
										disabled={!currentTemplate}
									>
										file_copy
									</IconButton>
									<IconButton
										class="material-icons"
										on:click={() => addTemplate()}
										toggle
										aria-label={$_('text.template-add')}
										title={$_('text.template-add')}
									>
										add
									</IconButton>
								</Group>
							</div>

							{#each $templates.sort(sortAZProtected) as template (template.id)}
								<Item
									sveltekit:prefetch
									href={dynamicTemplatePath(templateStringFromSlug(template.slug))}
									activated={activeMailbox === `template:${template.slug}`}
									on:mouseover={(e) => overEditable(e)}
									on:mouseleave={(e) => leaveEditable(e)}
								>
									<Graphic class="material-icons" aria-hidden="true"
										>{template.protected ? 'lock' : 'bookmark'}</Graphic
									>
									<Text class={!template.protected && 'editable'}>{template.name}</Text>
									{#if !template.protected}
										{#if editor.id === template.id}
											<Meta on:click={(e) => cancelEditable(e)} class="material-icons-outlined edit"
												>cancel</Meta
											>
											<Meta on:click={(e) => saveEditable(e)} class="material-icons-outlined edit"
												>save</Meta
											>
										{:else}
											<Meta
												on:click={(e) => makeEditable(e, template.id)}
												class="material-icons-outlined edit">edit</Meta
											>
										{/if}
									{/if}
									{#if currentUser && !validateData(template)}
										<Meta>
											<Dot size="5" />
										</Meta>
									{/if}
								</Item>
							{/each}
						{/if}
					</List>
				</Content>
			</Drawer>

			<AppContent class="app-content">
				<Button
					class="white"
					on:click={() => (drawerOpen = !drawerOpen)}
					style="position: absolute; z-index: 1;"
				>
					<Icon class="material-icons">{drawerOpen ? 'menu_open' : 'view_sidebar'}</Icon>
				</Button>
				<main class="main-content">
					<div class="grid inner-grid">
						<div class="toolbar">
							{#if currentTemplate}
								<MailTemplateToolbar
									{canSave}
									on:template:reset={(e) => resetTemplate(e)}
									on:template:save={(e) => saveTemplate(e)}
								/>
							{:else}
								<MailToolbar
									bind:selected
									type={activeMailbox}
									on:mail:reload={(e) => reloadMails(e)}
									on:mail:toggleRead={(e) => toggleRead(e)}
									on:mail:delete={(e) => deleteMail(e)}
									on:mail:sort={(e) => toggleSortByDate(e)}
								/>
							{/if}
						</div>
						{#if activeTemplate}
							{#if currentTemplate}
								<div class="grid-item grid-full">
									<MailTemplate
										bind:this={templateComponent}
										bind:canSave
										bind:working
										template={{ ...currentTemplate, data }}
										user={currentUser}
									/>
								</div>
							{:else}
								<div class="grid-item grid-full">
									<div class="empty-selection">
										<span style="text-align: center;">{$_('text.empty-template-selection')}</span>
									</div>
								</div>
							{/if}
						{:else}
							<div class="grid-item grid-mail-list">
								<MailList
									on:mail:delete={(e) => deleteMail(e)}
									on:mail:toggleRead={(e) => toggleRead(e)}
									bind:selected
									bind:selectionIndex
									type={activeMailbox}
									{sort}
								/>
							</div>
							<div class="grid-item grid-mail-viewer">
								<MailViewer {selected} />
							</div>
						{/if}
					</div>
				</main>
			</AppContent>
		</div>
	</div>
{:else}
	<div class="empty-selection no-user-selection">
		<span style="text-align: center;">{$_('text.empty-user-selection')}</span>
	</div>
{/if}
<Dialog
	bind:this={unsavedChangesDialog}
	aria-labelledby="info-title"
	aria-describedby="info-content"
	on:SMUIDialog:closed={unsavedChangesDialogCloseHandler}
>
	<DialogTitle id="info-title">{$_('text.unsaved-changes')}</DialogTitle>
	<DialogContent id="info-content">
		<div class="item">
			{@html $_('messages.you-have-unsaved-changes')}
		</div>
	</DialogContent>
	<Actions>
		<Button action="cancel">
			<Label>{$_('text.cancel')}</Label>
		</Button>
		<Button action="discard" variant="unelevated" default use={[InitialFocus]}>
			<Label>{$_('text.discard-changes')}</Label>
		</Button>
	</Actions>
</Dialog>
{#if $fabs === 'send-mail'}
	<Fab class="floating-fab" color="primary" on:click={() => sendMail()} extended>
		<Label>{$_('text.send-mail')}</Label>
		<FabIcon class="material-icons">send</FabIcon>
	</Fab>
{/if}

<style>
	.mail {
		grid-area: one;
		overflow: auto;
	}
	.drawer-container {
		position: relative;
		display: flex;
		height: 100%;
		overflow: hidden;
		z-index: 0;
	}
	* :global(.app-content) {
		flex: auto;
		overflow: auto;
		position: relative;
		flex-grow: 1;
	}
	.main-content {
		overflow: auto;
		height: 100%;
		box-sizing: border-box;
	}
	.grid {
		grid-template-areas:
			'toolbar toolbar'
			'one two';
		grid-template-columns: 2fr 3fr;
		grid-template-rows: 38px auto;
		grid-gap: var(--grid-gap);
		height: 100%;
	}
	.toolbar {
		grid-area: toolbar;
		margin-left: 70px;
	}
	.grid-mail-list {
		grid-area: one;
		overflow: auto;
	}
	.grid-mail-viewer {
		grid-area: two;
		overflow: auto;
	}
	.grid-full {
		grid-column-start: one;
		grid-column-end: two;
		overflow: auto;
	}
	.grid-item {
		background: var(--back-grid-item);
		height: 100%;
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
	.empty-selection.no-user-selection {
		grid-column-start: 1;
		grid-column-end: 3;
	}
	:global(.edit) {
		pointer-events: all;
	}
	:global(.hover .edit) {
		visibility: visible;
		pointer-events: all;
	}
	:global(.editor[contenteditable]) {
		flex-basis: 55%;
		padding: 0.5em;
		border: 1px solid #eee;
		border-radius: 4px;
		overflow: auto;
		text-overflow: clip;
		pointer-events: all;
		cursor: initial;
	}
</style>
