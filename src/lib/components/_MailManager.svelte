<script>
  import './_drawer.scss';
  import './_list.scss';
  import * as api from '$lib/api';
  import { onMount, tick, getContext } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fabs, sents, inboxes, session, templates, users, slim } from '$lib/stores';
  import {
    MailViewer,
    MailList,
    MailToolbar,
    MailTemplateToolbar,
    MailTemplate,
    Badge,
    BadgeGroup,
    Dot
  } from '$lib/components';
  import { _ } from 'svelte-i18n';
  import Drawer, { AppContent, Content, Header, Title, Subtitle } from '@smui/drawer';
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
  import { INBOX, SENT, ADMIN, SUPERUSER } from '$lib/utils';
  import { get } from 'svelte/store';

  const sortAZProtected = (
    /** @type {{ [x: string]: string; }} */ a,
    /** @type {{ [x: string]: string; }} */ b
  ) => {
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
  const { setFab } = getContext('fab');
  const { getSIUX } = getContext('siux');
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const defaultActive = INBOX;
  const mailboxes = [INBOX, SENT];
  const getStoreByEndpoint = (/** @type {string | null} */ endpoint) =>
    endpoint === INBOX ? inboxes : endpoint === SENT ? sents : null;

  let sort = 'DESC';
  let drawer;
  /**
   * @type {{ open: () => void; }}
   */
  let snackbar;
  /**
   * @type {boolean | undefined}
   */
  let drawerOpen;
  let drawerOpenOnMount = true;
  /**
   * @type {null | undefined}
   */
  let selection;
  let unreadInboxes = 0;
  /**
   * @type {string}
   */
  let activeTemplate = '';
  /**
   * @type {boolean}
   */
  let canSave;

  /**
   * @type {{} | undefined}
   */
  let working;
  /**
   * @type {MailTemplate}
   */
  let mailTemplate;
  /**
   * @type {import("@smui/dialog").DialogComponentDev}
   */
  let unsavedChangesDialog;
  /**
   * @type {HTMLElement}
   */
  let editable;
  /**
   * @type {{id: any, node: HTMLElement | null, value: string, editable: HTMLElement | null} }
   */
  let editor = {
    id: '',
    node: null,
    value: '',
    editable: null
  };
  /**
   * @type {string | null | undefined}
   */
  let pendingActiveTemplate;
  /**
   * @type {string | null}
   */
  let activeListItem;
  /**
   * @type {number}
   */
  let selectionIndex;
  let totalInboxes = 0;
  let totalSents = 0;
  /**
   * @type {string}
   */
  let currentSlug;

  export /**
   * @type {string | null}
   */
  let selectionUserId = null;

  // $: session = $page.data.session;
  $: currentUser = ((id) => $users.filter((usr) => usr.id === id))(selectionUserId)[0];
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: selectionUserId && (selectionIndex = -1);
  $: username = currentUser?.name || $_('text.empty-user-selection');
  $: email = currentUser?.email || '';
  $: totalSents = $sents.length;
  $: totalInboxes = $inboxes.length;
  $: unreadInboxes = $inboxes.filter((mail) => !mail._read).length;
  $: activeItem = $page.url.searchParams.get('active');
  $: setActiveListItem(activeItem);
  $: activeTemplate = matchesTemplate(activeListItem);
  $: dynamicTemplateData = currentUser && getTemplateData(activeTemplate);
  $: currentTemplate = $templates.find((tmpl) => tmpl.slug === activeTemplate) || null;
  $: currentTemplate && hasPrivileges ? setFab('send-mail') : setFab('');
  $: dynamicTemplatePath = (/** @type {any} */ slug) => {
    currentUser;
    return createTemplatePath(slug);
  };
  $: data = dynamicTemplateData && {
    ...dynamicTemplateData,
    ...dynamicTemplateData.validate(currentTemplate)
  };
  $: currentStore = getStoreByEndpoint(/** @type {string} */ activeItem);
  $: currentSlug = (currentSlug !== $page.params.slug && $page.params.slug) || currentSlug; // because $page.param.slug triggers even on no obvious change!
  $: waitForData =
    currentSlug &&
    getSIUX()
      .then((/** @type {{ success: any; data: any; }} */ res) => {
        if (res.success) {
          slim.update(res.data);
          $slim; // doesn't work w/o subscribing
        }
        return getMail(mailboxes[0]);
      })
      .then(() => {
        return getMail(mailboxes[1]);
      })
      .then((/** @type {any} */ sents) => {
        return new Promise((resolve, reject) => {
          // Don't really need the data, at this point they are already in the store.
          // Just resolve the Promise after showing a little loading animation
          setTimeout(() => resolve(sents), 800);
        });
      });

  onMount(async () => {
    snackbar = getSnackbar();
    getTemplates();

    if (hasPrivileges) {
      activeTemplate && setFab('send-mail');
    } else {
      setFab();
    }

    drawerOpen = drawerOpenOnMount;
  });

  /**
   * @param {string} endpoint
   */
  async function getMail(endpoint) {
    const ep = validateMailboxName(endpoint);
    if (!ep)
      return new Promise((res, rej) => rej(`The mailbox "${ep}" doesn'nt exist`)).catch((reason) =>
        console.log(reason)
      );
    const id = validateUserId($page.params.slug);
    if (!id) return;

    return await api
      .get(`${ep}/get/${id}`, { token: $session.user?.jwt, fetch })
      .then((res) => {
        if (res.success) {
          let store = getStoreByEndpoint(ep);
          if (store) store.update(res.data);
          return res.data;
        }
      })
      .catch((reason) => console.log(reason));
  }

  async function sendMail() {
    const res = await api.post('sents/add/', {
      data: {
        email: currentUser.email,
        ...working,
        template: {
          slug: currentTemplate.slug,
          themeVars: [{ '--prime': '#ad1457' }],
          data
        }
      },
      token: $session.user?.jwt
    });
    if (res.success) {
      configSnackbar($_('text.message-sent-success'));
      refreshMailData();
    } else {
      configSnackbar($_('text.message-sent-failed'));
    }
    snackbar.open();
  }

  /**
   * @param {string} id
   */
  function validateUserId(id) {
    return $users.find((usr) => usr.id == id) ? id : false;
  }

  /**
   * @param {string} name
   */
  function validateMailboxName(name) {
    if (!name) return;
    const stripped = name.replace('template:', '');
    return mailboxes.find((box) => box === stripped);
  }

  /**
   * @param {string} slug
   */
  function createTemplatePath(slug) {
    // don't operate directly on $page since its reactive and causes infinite load requests!
    // instead stringify URLSearchParams before manipulating
    let params = new URLSearchParams($page.url.searchParams.toString());
    params.set('active', slug);
    return `${$page.url.pathname}?${params.toString()}`;
  }

  /**
   * @param {string} active
   */
  async function gotoActiveBox(active) {
    if (!active) active = defaultActive;
    // fix non-existing page slug and append mailbox path to url
    return await goto(createTemplatePath(active));
  }

  /**
   * @param {string | null} value
   */
  function setActiveListItem(value) {
    if (activeListItem != matchesTemplate(value) && canSave) {
      pendingActiveTemplate = value;
      unsavedChangesDialog.setOpen(true);
    } else {
      activeListItem = value;
    }
  }

  /**
   * @param {CustomEvent} e
   */
  async function toggleRead(e) {
    let selected = e.detail.selection;
    let _read = e.detail._read || !selected._read;
    await api
      .put(`${INBOX}/${selected.id}`, {
        data: { _read },
        token: $session.user?.jwt,
        fetch
      })
      .then((res) => {
        if (res.success) {
          updateStoreFromOtherItem(inboxes, { ...selected, _read }, '_read');
        }
      });
  }

  /**
   * @param {import("svelte/store").Readable<any>} store
   * @param {{ [x: string]: any; id: any; }} otherItem
   * @param {string | any[]} keys
   */
  function updateStoreFromOtherItem(store, otherItem, keys) {
    if (!keys) return;
    if (typeof keys === 'string') keys = [keys];
    /** @type {any} */
    const newItem = {};
    const storeItem = get(store).find(
      (/** @type {{ id: any; }} */ item) => item.id === otherItem.id
    );
    keys.forEach((key) => {
      newItem[key] = otherItem[key];
    });
    inboxes.put({ ...storeItem, ...newItem });
  }

  /**
   * @param {CustomEvent} e
   */
  async function deleteMail(e) {
    const id = e.detail.selection?.id;
    if (!id) return;
    await api.del(`${activeListItem}/${id}`, { token: $session.user?.jwt, fetch }).then((res) => {
      if (res.success) {
        currentStore?.del(id);
      }
    });
  }

  function refreshMailData() {
    currentSlug = '';
  }

  function toggleSortByDate() {
    sort = sort === 'DESC' ? 'ASC' : 'DESC';
  }

  async function getTemplates() {
    await api.get('templates', { token: $session.user?.jwt, fetch }).then((res) => {
      if (res.success) {
        templates.update(res.data);
      }
    });
  }

  function resetTemplate() {
    mailTemplate.resetTemplate();
  }

  async function addTemplate() {
    if (!$templates.length) return;
    const { name, slug } = generateName();
    /**
     * @type {{ content: string; field_id: any; field: any; }[]}
     */
    const items = [];
    let template = $templates[0];
    template.items.map((/** @type {{ field: { id: any; }; }} */ item) => {
      items.push({
        content: '',
        field_id: item.field.id,
        field: item.field
      });
    });
    let newTemplate = { name, slug, items };
    const res = await api.post('templates', {
      data: { ...newTemplate },
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res.success) {
      templates.add({ ...newTemplate, id: res.data.id, items: res.data.items });
      gotoActiveBox(templateStringFromSlug(slug));
    }
    snackbar.open();
  }

  async function saveTemplate() {
    /**
     * @type {{ id: any; content: any; }[]}
     */
    let items = [];
    currentTemplate.items.map(
      (/** @type {{ field: { name: string | number; }; content: any; id: any; }} */ item) => {
        // @ts-ignore
        let content = working[item.field.name];
        item.content = content;
        items.push({ id: item.id, content });
      }
    );
    const res = await api.put(`templates/${currentTemplate.id}`, {
      data: { items },
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res.success) {
      templates.put({ ...currentTemplate });
      mailTemplate.createWorkingCopy();
    }
    snackbar.open();
  }

  async function duplicateTemplate() {
    let { name, slug } = generateName(currentTemplate.name);
    /**
     * @type {{ content: any; field_id: any; field: any; }[]}
     */
    let items = [];
    currentTemplate.items.map(
      (/** @type {{ field: { name: string | number; id: any; }; }} */ item) => {
        items.push({
          // @ts-ignore
          content: working[item.field.name],
          field_id: item.field.id,
          field: item.field
        });
      }
    );

    let newTemplate = { name, slug, items };
    const res = await api.post('templates', {
      data: { ...newTemplate },
      token: $session.user?.jwt
    });
    configSnackbar(res.message);
    if (res.success) {
      templates.add({ ...newTemplate, id: res.data.id, items: res.data.items });
      gotoActiveBox(templateStringFromSlug(slug));
    }
    snackbar.open();
  }

  async function removeTemplate() {
    const res = await api.del(`templates/${currentTemplate.id}`, { token: $session.user?.jwt });
    configSnackbar(res.message);
    if (res.success) {
      templates.del(currentTemplate.id);
    }
    snackbar.open();
  }

  /**
   * @param {string} slug
   */
  function getTemplateData(slug) {
    let data;
    // @ts-ignore
    if ((data = templateSlugData.find((i) => i[slug])) && typeof data[slug] === 'function') {
      // @ts-ignore
      return data[slug]();
    }
    return false;
  }

  /**
   * @param {{ detail: { action: string; }; }} e
   */
  function unsavedChangesDialogCloseHandler(e) {
    if (e.detail.action === 'discard') {
      pendingActiveTemplate && (activeListItem = pendingActiveTemplate);
      pendingActiveTemplate = void 0;
    }
  }

  /**
   * @param {MouseEvent | CustomEvent} e
   */
  function overEditable(/** @type { {currentTarget: HTMLElement}  | any} */ e) {
    editable = e.currentTarget;
    editable?.classList.add('hover');
  }

  /**
   * @param {Event} e
   */
  function leaveEditable(e) {
    if (editable?.getElementsByClassName('editor').length) return;
    editable?.classList.remove('hover');
  }

  /**
   * @param {CustomEvent<any>} e
   * @param {any} id
   */
  function makeEditable(e, id) {
    cancelEvent(e);
    const range = document.createRange();
    const selection = window.getSelection();
    /** @type  {HTMLCollectionOf<HTMLElement> | HTMLCollectionOf<Element> } */
    const children = editable.getElementsByClassName('editable') || [];
    if (children.length) {
      /** @type {HTMLElement} */
      // @ts-ignore
      const node = children[0];
      editor.node?.classList.remove('editor');

      editor = { ...editor, id, node, value: node?.innerText, editable };
      editor?.node.classList.add('editor');
      editor?.node.setAttribute('contenteditable', 'true');
      editor?.node.addEventListener('keydown', keyListener);
      editor?.node.addEventListener('click', cancelEvent);
      editor?.node.focus();
      range.selectNodeContents(editor?.node);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
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

  /**
   * @param {MouseEvent | KeyboardEvent | CustomEvent} e
   */
  function cancelEvent(e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
  }

  /**
   * @param {MouseEvent | KeyboardEvent | CustomEvent} e
   */
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

  /**
   * @param {MouseEvent | KeyboardEvent | CustomEvent} e
   */
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

    templates.put({ ...template, name: '' });
    await tick();
    templates.put({ ...template, name });
  }

  async function saveTemplateName() {
    let id = editor.id;
    let name = editor.node.innerText;
    let template = $templates.find((tmpl) => tmpl.id === id);

    if (!template) return;

    const res = await api.put(`templates/${id}`, { data: { name }, token: $session.user?.jwt });
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

  /**
   * @param {string | any[] | undefined} [name]
   * @return {any}
   */
  function generateName(name) {
    let slug,
      newName = (name && name.concat($_('text.new-copy-label'))) || $_('text.new');
    if ($templates.find((tmpl) => tmpl.name === newName)) {
      return generateName(newName);
    }
    slug = generateSlug();
    return { name: newName, slug };
  }

  /**
   * @return {any}
   */
  function generateSlug() {
    let slug = crypto.randomUUID();
    if ($templates.find((tmpl) => tmpl.slug === slug)) {
      return generateSlug();
    }
    return slug;
  }

  /**
   * @param {string | null} [value]
   * @return {any}
   */
  function matchesTemplate(value) {
    if (!value) return;
    let matches = value.match(/(template):([\w-:\d]+)/);
    if (matches) return matches[2];
  }

  /**
   * @param {string} [slug]
   * @return {any}
   */
  function templateStringFromSlug(slug) {
    return `template:${slug}`;
  }

  /**
   * @param {any} [template]
   * @return {any}
   */
  function validateData(template) {
    let data = getTemplateData(template?.slug);
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

<div class="main-grid">
  {#if $session.user}
    <div class="grid-item mail">
      <div class="drawer-container">
        <Drawer variant="dismissible" bind:this={drawer} bind:open={drawerOpen}>
          <Header>
            <Title>{username}</Title>
            <Subtitle>{email}</Subtitle>
          </Header>
          <Content>
            <List class="mailbox-list" nonInteractive={!currentUser}>
              <Item
                href={dynamicTemplatePath(INBOX)}
                on:click={() => (selectionIndex = -1)}
                activated={activeListItem === INBOX}
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
                href={dynamicTemplatePath(SENT)}
                on:click={() => (selectionIndex = -1)}
                activated={activeListItem === SENT}
              >
                <Graphic class="material-icons" aria-hidden="true">send</Graphic>
                <Text>{$_('text.sent')}</Text>
                {#if totalSents}
                  <Badge class="medium" right>{totalSents}</Badge>
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
                    disabled={!currentUser}
                    class="template-list-item"
                    data-sveltekit-prefetch=""
                    href={dynamicTemplatePath(templateStringFromSlug(template.slug))}
                    activated={activeListItem === `template:${template.slug}`}
                    on:mouseover={(e) => overEditable(e)}
                    on:mouseleave={(e) => leaveEditable(e)}
                  >
                    <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
                    <Text class={!template.protected ? 'editable' : ''}>{template.name}</Text>
                    {#if !template.protected}
                      {#if editor.id === template.id}
                        <Meta
                          on:click={(e) => cancelEditable(e)}
                          class="material-icons-outlined edit">cancel</Meta
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
                    {:else}
                      <Meta class="material-icons-outlined">lock</Meta>
                    {/if}
                    {#if currentUser && !validateData(template)}
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
                    bind:selection
                    type={activeListItem}
                    {sort}
                    on:mail:reload={(e) => refreshMailData()}
                    on:mail:toggleRead={(e) => toggleRead(e)}
                    on:mail:delete={(e) => deleteMail(e)}
                    on:mail:sort={(e) => toggleSortByDate()}
                  />
                {/if}
              </div>
              {#if activeTemplate}
                {#if currentTemplate}
                  <div class="grid-item grid-full">
                    <MailTemplate
                      bind:this={mailTemplate}
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
                    on:mail:delete={deleteMail}
                    on:mail:toggleRead={toggleRead}
                    bind:selection
                    bind:selectionIndex
                    {waitForData}
                    {currentStore}
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
    <div class="empty-selection no-user-selection">
      <span style="text-align: center;">{$_('text.empty-user-selection')}</span>
    </div>
  {/if}
</div>
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
  .main-grid {
    grid-area: main;
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap);
    align-items: center;
    grid-template-areas: 'one one';
    grid-template-columns: 4fr 4fr;
    grid-template-rows: auto;
    align-items: initial;
    background-color: var(--back);
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
    grid-area: one;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
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
