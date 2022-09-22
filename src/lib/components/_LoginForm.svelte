<script context="module">
  let loginAttempts = 0;
</script>

<script>
  // @ts-nocheck

  import { browser, dev } from '$app/environment';
  import { invalidate } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { post, proxyEvent } from '$lib/utils';
  import { flash } from '$lib/stores';
  import Button from '@smui/button';
  import TabBar from '@smui/tab-bar';
  import Tab, { Label as TabLabel, Icon as LabelIcon } from '@smui/tab';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import { Label } from '@smui/common';
  import Dialog, { Title as DialogTitle, Content, Actions, InitialFocus } from '@smui/dialog';
  import { FacebookLoginButton, GoogleLoginButton, Header } from '$lib/components';
  import { _ } from 'svelte-i18n';

  const client_id = import.meta.env.VITE_CLIENT_ID; // Ggogle Client ID
  const appId = import.meta.env.VITE_APP_ID; // Facebook App ID

  const { getSnackbar } = getContext('snackbar');
  const toplevel = dev ? 'dev' : 'de';

  // Fixtures
  const adminEmail = `sampleadmin@webpremiere.${toplevel}`;
  const adminPassword = 'Test@005';
  // const userEmail = `sampleuser@webpremiere.${toplevel}`;
  const userEmail = `sampleuser@webpremiere.${toplevel}`;
  const userPassword = 'Angela@005';
  const ONE = 'one-row';
  const TWO = 'two-rows';
  const THREE = 'three-rows';
  const DefaultTab = 'Presets';

  let root;
  let password = '';
  let email = '';
  let snackbar;
  let invalidTokenUserDialog;
  let foundActive;
  let active;

  $: tabMap = new Map([
    ['Default', { rows: THREE, text: $_('text.formular'), icon: 'notes' }],
    ['Presets', { rows: TWO, text: $_('text.presets'), icon: 'people_alt' }],
    ['Social', { rows: TWO, text: $_('text.social'), icon: 'mood' }]
  ]);
  $: tabs = {
    names: () => {
      const names = [];
      tabMap.forEach((val, key) => {
        names.push(key);
      });
      return names;
    },
    rows: (key) => tabMap.get(key).rows,
    text: (key) => tabMap.get(key).text,
    icon: (key) => tabMap.get(key).icon
  };
  $: tabNames = tabs.names();
  $: rows = active && tabs.rows(active);
  $: active && browser && localStorage.setItem('activeSignIn', active);

  onMount(() => {
    root = document.documentElement;
    unblock();
    foundActive = localStorage.getItem('activeSignIn');
    active = (tabMap.has(foundActive) && foundActive) || DefaultTab;
    snackbar = getSnackbar();

    return () => {
      unblock();
    };
  });

  /**
   * see https://svelte.dev/repl/a153f60d46374c1eb3da1678f9337fea?version=3.50.1
   * for progressivly enhanced forms
   * @param node
   * @param options
   */
  function submit(node, options) {
    let submitting = false;

    async function submitHandler(e) {
      e.preventDefault();

      const form = e.target;
      const data = {};

      if (submitting) return;
      flash.update({ message: $_('text.one-moment'), permanent: true });
      submitting = true;
      block();

      // new FormData(form).forEach((value, key) => (data[key] = value));

      await post(form.action, { email, password }).then(async (res) => {
        const { success, data } = { ...res };

        if (success) {
          proxyEvent('ticker:success', { ...data });
        } else {
          proxyEvent('ticker:error', { ...data });

          /**
           * Show dialog after 3 login fails
           */
          if (++loginAttempts > 3) invalidTokenUserDialog.setOpen(true);
        }
        submitting = false;
        reset();
        unblock();
      });
    }

    node.addEventListener('submit', submitHandler);

    return () => node.removeEventListener('submit', submitHandler);

    // TODO handle network errors
    // errors = res.errors;
  }

  function reset() {
    email = '';
    password = '';
  }

  function block() {
    root.classList.add('signing-in');
  }

  function unblock() {
    root.classList.remove('signing-in');
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
</script>

<div class="flex flex-col">
  <div class="mb-5 flex self-center justify-center sign-in-hint">
    {$_('text.select-signin-mode')}
  </div>
</div>
<div class="flex flex-col form-wrapper">
  <div class="mb-5">
    <TabBar tabs={tabNames} let:tab bind:active>
      <Tab {tab}>
        <LabelIcon class="material-icons">{tabs.icon(tab)}</LabelIcon>
        <Label>{tabs.text(tab)}</Label>
      </Tab>
    </TabBar>
  </div>
  <form
    use:submit={{
      start: () => {},
      error: () => {},
      end: () => {}
    }}
    method="POST"
    class="login-form flex justify-center"
    action="/auth/login"
  >
    <div class="login-grid {rows}">
      {#if active === tabNames[0]}
        <span class="one flex flex-col">
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
        <span class="two flex flex-col">
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
        <div class="three flex">
          <Button
            disabled={!(email && password)}
            class="login-button"
            type="submit"
            variant="raised"
            style="flex: 0 0 221px;"
          >
            <Label>Login</Label>
          </Button>
        </div>
      {/if}
      {#if active === tabNames[1]}
        <div class="one flex justify-center">
          <Button
            on:click={() => setFields('admin')}
            color=""
            class="login-button"
            type="submit"
            variant="raised"
            style="flex: 0 0 221px;"
          >
            <Icon class="material-icons">supervisor_account</Icon>
            <Label>Sample Admin</Label>
          </Button>
        </div>
        <div class="two flex justify-center">
          <Button
            on:click={() => setFields('user')}
            color=""
            class="login-button flex-1"
            type="submit"
            variant="raised"
            style="flex: 0 0 221px;"
          >
            <Icon class="material-icons">person</Icon>
            <Label>Sample User</Label>
          </Button>
        </div>
      {/if}
      {#if active === tabNames[2]}
        <div class="one flex relative justify-center">
          <FacebookLoginButton {appId} />
        </div>
        <div class="two flex relative justify-center">
          <GoogleLoginButton {client_id} />
        </div>
      {/if}
    </div>
  </form>
</div>
<Dialog
  bind:this={invalidTokenUserDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={invalidTokenDialogCloseHandler}
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
  .form-wrapper {
    padding-top: 10px;
    border-top: 1px solid rgb(173 20 87 / 5%);
  }
  .login-grid {
    display: grid;
    grid-row-gap: 0.5rem;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-template-areas:
      'one'
      'two'
      'three';
  }
  .one {
    grid-area: one;
  }
  .two {
    grid-area: two;
  }
  .three {
    grid-area: three;
  }

  @media (min-width: 868px) {
    .login-grid {
      grid-template-areas:
        'one one'
        'two two';
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr;
      grid-row-gap: 1rem;
    }
    .login-grid.one-row {
      grid-template-rows: 1fr;
      grid-template-areas: 'one two';
      grid-gap: 15px;
    }
    .login-grid.two-rows {
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas:
        'one one'
        'two two';
    }
    .login-grid.three-rows {
      grid-template-rows: repeat(3, 1fr);
      grid-template-areas:
        'one one'
        'two two'
        'three three';
    }
  }
  .sign-in-hint {
    background-color: rgb(173 20 87 / 10%);
    padding: 6px 8px;
    line-height: 1em;
    text-align: center;
    height: 30px;
    border-radius: 15px;
    color: var(--prime);
    font-size: 12px;
    flex-basis: 20%;
    width: 50%;
  }
</style>
