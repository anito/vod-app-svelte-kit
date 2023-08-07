<script lang="ts">
  import './_drawer.scss';
  import './_icon-button.scss';
  import * as api from '$lib/api';
  import { onMount, getContext, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { goto, invalidate } from '$app/navigation';
  import { fabs, sents, inboxes, session, templates, users, usersFoundation } from '$lib/stores';
  import {
    MailViewer,
    MailList,
    MailToolbar,
    MailTemplateToolbar,
    MailTemplate,
    Badge as MailBadge,
    BadgeGroup,
    Dot,
    FlexContainer,
    UserGraphic,
    Heading
  } from '$lib/components';
  import { TextEditor } from '$lib/components/TextEditable';
  import { _ } from 'svelte-i18n';
  import Drawer, { AppContent, Content, Header, Subtitle } from '@smui/drawer';
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
  import { INBOX, SENT, ADMIN, SUPERUSER, DESC, ASC } from '$lib/utils';
  import type { Mail, Badge } from '$lib/types';
  import type Snackbar from '@smui/snackbar';
  import { browser } from '$app/environment';

  const sortAZProtected = (a: Record<string, any>, b: Record<string, any>) => {
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
          validate: () => selectedUser?.active && isValidToken() && { href: getMagicLink() },
          label: $_('text.magic-link')
        };
      }
    },
    {
      welcome: () => {
        return {
          validate: () => selectedUser?.active && isValidToken() && { href: getMagicLink() },
          label: $_('text.welcome-link-label')
        };
      }
    }
  ];
  const { setFab } = getContext('fab') as any;
  const { getSIUX } = getContext('siux') as any;
  const { getSnackbar, configSnackbar } = getContext('snackbar') as any;
  const defaultActive = INBOX;
  const mailboxes = [INBOX, SENT];
  const currentStore: any = writable();
  const avatarSize = 40;
  const drawerOpenOnMount = true;

  let sort = 'DESC';
  let drawer;

  let snackbar: Snackbar;
  let drawerOpen: boolean;
  let selection: Mail;
  let unreadInboxes = 0;
  let canSave: boolean;
  let working: { [x: string]: any } | undefined;
  let mailTemplate: MailTemplate;
  let unsavedChangesDialog: Dialog;
  let root: HTMLElement;
  let pendingActiveTemplate: string | null;
  let activeListItem: string | null;
  let selectionIndex: number;
  let totalInboxes = 0;
  let totalSents = 0;
  let currentSlug = $page.params.slug;

  export let selectionUserId: string;

  setContext('mail-store', {
    getMailStore: () => currentStore
  });

  $: selectedUser = ((id) => $users.find((usr) => usr.id === id))(selectionUserId) as any;
  $: hasSelectedUserPrivileges = selectedUser?.role === ADMIN || selectedUser?.role === SUPERUSER;
  $: badge = {
    icon: (hasSelectedUserPrivileges && 'admin_panel_settings') || '',
    color:
      selectedUser?.role === SUPERUSER
        ? 'rgb(26, 4, 4)'
        : selectedUser?.role === ADMIN
        ? 'rgb(206, 4, 4)'
        : '',
    position: 'TOP_RIGHT',
    size: 'small'
  } as Badge;
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: selectionUserId && (selectionIndex = -1);
  $: username = selectedUser?.name || $_('text.empty-user-selection');
  $: email = selectedUser?.email || '';
  $: totalSents = $sents.length;
  $: totalInboxes = $inboxes.length;
  $: unreadInboxes = $inboxes.filter((mail) => !mail._read).length;
  $: activeItem = $page.url.searchParams.get('active');
  $: setActiveListItem(activeItem);
  $: activeTemplate = matchesTemplate(activeListItem);
  $: dynamicTemplateData = selectedUser && getTemplateData(activeTemplate);
  $: currentTemplate = $templates.find((tmpl) => tmpl.slug === activeTemplate);
  $: currentTemplate && hasPrivileges ? setFab('send-mail') : setFab('');
  $: dynamicTemplatePath = (slug: any) => {
    selectedUser;
    return createTemplatePath(slug);
  };
  $: data = dynamicTemplateData && {
    ...dynamicTemplateData,
    ...dynamicTemplateData.validate(currentTemplate)
  };
  $: currentStore.update(() => getStoreByEndpoint(activeItem));
  /**
   * by changing this (to any arbitrary string different from $page.params.slug)
   * we're able to control whether mails should be reloaded
   */
  $: currentSlug = (currentSlug !== $page.params.slug && $page.params.slug) || currentSlug;
  $: isValidTemplate = selectedUser && validateData(currentTemplate?.slug);
  $: waitForData =
    currentSlug &&
    getSIUX()
      .then((res: { success: any; data: never[] }) => {
        if (res?.success) {
          usersFoundation.update(res.data);
          $usersFoundation; // subscribe to take effect
        }
      })
      .then(async () => {
        // fetching INBOXES
        const mailbox = mailboxes[0];
        const result = await getMail(mailbox);
        const store = getStoreByEndpoint(mailbox);
        if (result) {
          store?.update(result);
        } else {
          store?.set([]);
        }
      })
      .then(async () => {
        // fetching SENTS
        const mailbox = mailboxes[1];
        const result = await getMail(mailbox);
        const store = getStoreByEndpoint(mailbox);
        if (result) {
          store?.update(result);
        } else {
          store?.set([]);
        }
      })
      .then(async () => {
        // show loading spinner
        return new Promise(async (resolve, reject) => {
          setTimeout(() => resolve(1), 500);
        });
      });

  onMount(() => {
    root = document.documentElement;
    root.classList.add('mailmanager--open');
    snackbar = getSnackbar();
    getTemplates();

    if (hasPrivileges) {
      activeTemplate && setFab('send-mail');
    } else {
      setFab();
    }

    drawerOpen = drawerOpenOnMount;

    return () => {
      root.classList.remove('mailmanager--open');
    };
  });

  function getStoreByEndpoint(endpoint: string | null) {
    if (endpoint === INBOX) return inboxes;
    if (endpoint === SENT) return sents;
  }

  async function getMail(name: string | undefined) {
    const endpoint = validateMailboxName(name);
    // if (!endpoint) return new Promise((res, rej) => rej(`The mailbox "${endpoint}" doesn't exist`));
    if (!endpoint)
      return new Promise((res, rej) =>
        rej($_('text.mailbox-not-found', { values: { name: endpoint } }))
      );

    const validUser = validateUser();
    if (!validUser) return new Promise((res, rej) => rej($_('text.user-not-found')));

    return await api
      .get(`${endpoint}/get/${selectedUser?.id}`, { token: $session.user?.jwt })
      .then((res) => {
        if (res?.success) {
          return res.data;
        }
      });
  }

  async function sendMail() {
    await api
      .post('sents/add/', {
        data: {
          user: { email: selectedUser?.email },
          salutation: $session.salutation,
          ...working,
          template: {
            slug: currentTemplate?.slug,
            themeVars: [{ '--primary': '#ad1457' }],
            data
          }
        },
        token: $session.user?.jwt
      })
      .then((res) => {
        if (res?.success) {
          configSnackbar($_('text.message-sent-success'));
          refreshMailData();
        } else {
          configSnackbar($_('text.message-sent-failed'));
        }
      });
    snackbar?.forceOpen();
  }

  function validateUser() {
    if (!selectedUser) return false;

    const user = $users.find((usr) => usr.id === $page.params.slug);
    return !!user && selectedUser.id === user.id;
  }

  function validateMailboxName(name = '') {
    const stripped = name?.replace('template:', '');
    return mailboxes.find((box) => box === stripped);
  }

  function createTemplatePath(slug: string) {
    // don't operate directly on $page since its reactive
    let params = new URLSearchParams($page.url.search);
    params.set('active', slug);
    params.delete('mail_id');
    return `${$page.url.pathname}?${params.toString()}`;
  }

  async function gotoActiveBox(active: string) {
    if (!active) active = defaultActive;
    // fix non-existing page slug and append mailbox path to url
    return await goto(createTemplatePath(active));
  }

  function setActiveListItem(value: string | null) {
    if (activeListItem != matchesTemplate(value) && canSave) {
      pendingActiveTemplate = value;
      unsavedChangesDialog?.setOpen(true);
    } else {
      activeListItem = value;
    }
  }

  async function toggleRead({ detail }: CustomEvent) {
    const selection = detail.selection;
    const _read = !selection._read;
    await api
      .put(`${INBOX}/${selection.id}`, {
        data: { _read },
        token: $session.user?.jwt
      })
      .then((res) => {
        if (res?.success) {
          const inbox = $inboxes.find((item) => item.id === selection.id);
          if (inbox) inboxes.put({ ...inbox, _read });
        }
      });
  }

  async function deleteMail({ detail }: CustomEvent) {
    const id = detail.selection?.id;
    if (!id) return;
    await api
      .del(`${activeListItem}/${id}?locale=${$session.locale}`, { token: $session.user?.jwt })
      .then((res) => {
        if (res?.success) {
          $currentStore?.del(id);
        }
        configSnackbar(res.message);
        snackbar?.forceOpen();
      });
  }

  function refreshMailData() {
    currentSlug = '';
    invalidate('app:session');
  }

  function toggleSortByDate() {
    sort = sort === DESC ? ASC : DESC;
  }

  async function getTemplates() {
    await api.get('templates', { token: $session.user?.jwt }).then((res) => {
      if (res?.success) {
        templates.update(res.data);
      }
    });
  }

  function resetTemplate() {
    mailTemplate.resetTemplate?.();
  }

  async function addTemplate() {
    if (!$templates.length) return;
    const { name, slug }: { name: string; slug: string } = generateName();
    const items: any[] = [];
    let template = $templates[0];
    template.items?.map((item: { field: { id: any } }) => {
      items.push({
        content: '',
        field_id: item.field.id,
        field: item.field
      });
    });
    let newTemplate = { name, slug, items };
    const res = await api.post(`templates?locale=${$session.locale}`, {
      data: { ...newTemplate },
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res?.success) {
      templates.add({ ...newTemplate, id: res.data.id, items: res.data.items, protected: false });
      gotoActiveBox(templateStringFromSlug(slug));
    }
    snackbar?.forceOpen();
  }

  async function saveTemplate() {
    let items: { id: any; content: any }[] = [];
    currentTemplate?.items?.map(
      (item: { field: { name: string | number }; content: any; id: any }) => {
        let content = working?.[item.field.name];
        item.content = content;
        items.push({ id: item.id, content });
      }
    );
    const res = await api.put(
      `templates/${currentTemplate?.id}?locale=${$page.data.session.locale}`,
      {
        data: { items },
        token: $session.user?.jwt
      }
    );
    configSnackbar(res.message);
    if (res?.success) {
      if (currentTemplate) templates.put({ ...currentTemplate });
      mailTemplate.createWorkingCopy?.();
    }
    snackbar?.forceOpen();
  }

  async function duplicateTemplate() {
    let { name, slug } = generateName(currentTemplate?.name);
    let items: any[] = [];
    currentTemplate?.items?.map((item) => {
      items.push({
        content: working?.[item.field.name],
        field_id: item.field.id,
        field: item.field
      });
    });

    let newTemplate = { name, slug, items };
    const res = await api.post(`templates?locale=${$session.locale}`, {
      data: { ...newTemplate },
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res?.success) {
      templates.add({ ...newTemplate, id: res.data.id, items: res.data.items });
      gotoActiveBox(templateStringFromSlug(slug));
    }
    snackbar?.forceOpen();
  }

  async function removeTemplate() {
    const res = await api.del(`templates/${currentTemplate?.id}?locale=${$session.locale}`, {
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res?.success) {
      if (currentTemplate?.id) templates.del(currentTemplate?.id);
    }
    snackbar?.forceOpen();
  }

  function getTemplateData(slug?: any) {
    const item: any = templateSlugData.find((item) => slug in item);
    if (item) {
      if (typeof item[slug] === 'function') {
        return item[slug]();
      } else {
        return item[slug];
      }
    }
  }

  async function unsavedChangesDialogCloseHandler(event: CustomEvent) {
    if (event.detail.action === 'discard') {
      pendingActiveTemplate && (activeListItem = pendingActiveTemplate);
      pendingActiveTemplate = null;
    }
    if (event.detail.action === 'save-as') {
      duplicateTemplate().then((res) => {
        pendingActiveTemplate && (activeListItem = pendingActiveTemplate);
        pendingActiveTemplate = null;
      });
    }
  }

  async function saveEditableHandler({ detail }: CustomEvent) {
    const { id, value, onFailCallback, onSuccessCallback } = detail;
    const success = await saveTemplateName(id, value);
    if (success) {
      onSuccessCallback?.();
    } else {
      onFailCallback?.();
    }
  }

  async function saveTemplateName(id: any, name: any) {
    let template = $templates.find((tmpl) => tmpl.id === id);

    if (!template) return;

    const res = await api.put(`templates/${id}?locale=${$session.locale}`, {
      data: { name },
      token: $session.user?.jwt
    });
    if (res?.success) {
      templates.put({ ...template, name });
      configSnackbar($_('text.template-renamed'));
    } else {
      configSnackbar($_('text.template-could-not-be-renamed'));
    }
    snackbar?.forceOpen();
    return res.success;
  }

  function isValidToken() {
    let expires = selectedUser.expires;
    if (!isNaN(expires)) return expires * 1000 > +new Date().getTime();
    return false;
  }

  function generateName(name?: string): { name: string; slug: string } {
    let slug;
    let newName = (name && name.concat($_('text.new-copy-label'))) || $_('text.new');
    if ($templates.find((tmpl) => tmpl.name === newName)) {
      return generateName(newName);
    }
    slug = generateSlug();
    return { name: newName, slug };
  }

  function generateSlug(): string {
    let slug = crypto.randomUUID();
    if ($templates.find((tmpl) => tmpl.slug === slug)) {
      return generateSlug();
    }
    return slug;
  }

  function matchesTemplate(value: string | null) {
    if (!value) return;
    let matches = value.match(/(template):([\w-:\d]+)/);
    if (matches?.length === 3) {
      return matches[2];
    } else {
      working = undefined;
      return;
    }
  }

  function templateStringFromSlug(slug: any) {
    return `template:${slug}`;
  }

  function validateData(slug?: string) {
    let data = getTemplateData(slug);
    if (data) {
      return data.validate();
    }
    return true;
  }

  function getMagicLink() {
    if (selectedUser?.jwt) {
      return `${$page.url.origin}/login?token=${selectedUser.jwt}`;
    }
  }
</script>

<div class="main-grid">
  {#if $session.user}
    <div class="grid-item mail">
      <div class="drawer-container">
        <Drawer variant="dismissible" bind:this={drawer} bind:open={drawerOpen}>
          <Header style="padding-top: 1rem;">
            <div class="flex" style:--avatar-size={`${avatarSize}px`}>
              <UserGraphic
                size={avatarSize}
                user={selectedUser}
                badge={hasSelectedUserPrivileges ? badge : false}
                borderSize={1}
                borderColor="#c5c5c5"
                class="self-center mr-3"
                style="width: var(--avatar-size);"
              />
              <div class="flex flex-col">
                <Heading
                  mdc
                  h="6"
                  style="width: calc(var(--drawer-width) - var(--avatar-size) - 30px);"
                >
                  {username}
                </Heading>
                <Subtitle>{email}</Subtitle>
              </div>
            </div>
          </Header>
          <Content>
            <List class="mailbox-list" nonInteractive={!selectedUser}>
              <Item
                href={dynamicTemplatePath(INBOX)}
                on:click={() => (selectionIndex = -1)}
                activated={activeListItem === INBOX}
              >
                <Graphic class="material-icons" aria-hidden="true">inbox</Graphic>
                <Text>{$_('text.inbox')}</Text>
                <BadgeGroup right>
                  {#if totalInboxes}
                    <MailBadge class="medium">{totalInboxes}</MailBadge>
                  {/if}
                  {#if totalInboxes && unreadInboxes > 0}
                    <MailBadge class="medium flash">{unreadInboxes}</MailBadge>
                  {/if}
                </BadgeGroup>
              </Item>
              <Item
                href={dynamicTemplatePath(SENT)}
                on:click={() => (selectionIndex = -1)}
                activated={activeListItem === SENT}
              >
                <Graphic class="material-icons" aria-hidden="true">send</Graphic>
                <Text>{$_('text.sent')}</Text>
                {#if totalSents}
                  <MailBadge class="medium" right>{totalSents}</MailBadge>
                {/if}
              </Item>

              {#if hasPrivileges}
                <Separator />
                <div class="flex justify-center">
                  <SecondaryText class="p-3" style="align-self: center;"
                    >{$_('text.templates')}</SecondaryText
                  >
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
                      color="primary"
                      on:click={() => duplicateTemplate()}
                      toggle
                      aria-label={$_('text.template-duplicate')}
                      title={$_('text.template-duplicate')}
                      disabled={!currentTemplate}
                    >
                      file_copy
                    </IconButton>
                    <IconButton
                      color="primary"
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
                    class="template-list-item"
                    href={dynamicTemplatePath(templateStringFromSlug(template.slug))}
                    activated={activeListItem === `template:${template.slug}`}
                  >
                    <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
                    <TextEditor
                      id={template.id}
                      locked={template.protected}
                      on:save:editable={saveEditableHandler}
                      >{template.name}
                    </TextEditor>
                    {#if selectedUser && !validateData(template.slug)}
                      <Meta class="absolute" style="left: 0;">
                        <Dot size={5} />
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
                    on:template:reset={(e) => resetTemplate()}
                    on:template:save={(e) => saveTemplate()}
                  />
                {:else}
                  <MailToolbar
                    on:mail:reload={refreshMailData}
                    on:mail:toggleRead={toggleRead}
                    on:mail:delete={deleteMail}
                    on:mail:sort={toggleSortByDate}
                    bind:selection
                    type={activeListItem}
                    {sort}
                  />
                {/if}
              </div>
              {#if activeTemplate}
                <div class="grid-item grid-full">
                  {#if currentTemplate}
                    <MailTemplate
                      bind:this={mailTemplate}
                      bind:canSave
                      bind:working
                      template={{ ...currentTemplate, data }}
                      user={selectedUser}
                    />
                  {:else}
                    <FlexContainer>
                      {$_('text.empty-template-selection')}
                    </FlexContainer>
                  {/if}
                </div>
              {:else}
                <div class="grid-item grid-mail-list">
                  <MailList
                    on:mail:delete={deleteMail}
                    on:mail:toggleRead={toggleRead}
                    bind:selection
                    bind:selectionIndex
                    {waitForData}
                    {sort}
                  />
                </div>
                <div class="grid-item grid-mail-viewer">
                  <MailViewer {selection} />
                </div>
              {/if}
            </div>
          </main>
        </AppContent>
      </div>
    </div>
  {:else}
    <FlexContainer>
      {$_('text.empty-user-selection')}
    </FlexContainer>
  {/if}
</div>
<Dialog
  bind:this={unsavedChangesDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  surface$style="width: var(--dialog-w); max-width: var(--dialog-max-w);"
  on:SMUIDialog:closed={unsavedChangesDialogCloseHandler}
>
  <DialogTitle id="info-title">{$_('text.unsaved-changes')}</DialogTitle>
  <DialogContent id="info-content">
    <div class="item">
      {@html $_('messages.you-have-unsaved-changes')}
    </div>
  </DialogContent>
  <Actions class="button-overflow-ellipsis">
    <Button class="max-w-33" action="cancel">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button class="max-w-33" action="save-as" variant="outlined">
      <Label>{$_('text.save-as-new-template')}</Label>
    </Button>
    <Button class="max-w-33" action="discard" variant="unelevated" use={[InitialFocus]}>
      <Label>{$_('text.discard-changes')}</Label>
    </Button>
  </Actions>
</Dialog>
{#if $fabs === 'send-mail'}
  <Fab
    class="floating-fab"
    color="primary"
    on:click={() => sendMail()}
    extended
    disabled={!isValidTemplate}
  >
    <Label>{$_('text.send-mail')}</Label>
    <FabIcon class="material-icons">send</FabIcon>
  </Fab>
{/if}

<style>
  .main-grid {
    grid-area: main;
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap-sm);
    align-items: center;
    grid-template-areas: 'one one';
    grid-template-columns: 4fr 4fr;
    grid-template-rows: auto;
    align-items: initial;
    background-color: var(--background);
    overflow: auto;
  }
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
    grid-template-rows: 48px auto;
    grid-gap: var(--grid-gap-sm);
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
    background: var(--background-intense);
    height: 100%;
  }
  :global(.mailbox-list:not([class*='non-interactive']) .edit) {
    pointer-events: all;
    cursor: pointer;
  }
  :global(.hover .edit) {
    visibility: visible;
    pointer-events: all;
  }
  :global(.mailbox-list:not([class*='non-interactive']) .editor[contenteditable]) {
    flex-basis: 55%;
    padding: 0.5em;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: auto;
    text-overflow: clip;
    pointer-events: all;
    cursor: initial;
  }
  :global(.mailbox-list[class*='non-interactive']) {
    pointer-events: none;
  }
</style>
