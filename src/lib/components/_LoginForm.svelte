<script context="module">
  let loginAttempts = 0;
</script>

<script>
  import { browser, dev } from '$app/environment';
  import { onMount, getContext } from 'svelte';
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
  import { enhance } from '$app/forms';

  const client_id = import.meta.env.VITE_CLIENT_ID; // Ggogle Client ID
  const appId = import.meta.env.VITE_APP_ID; // Facebook App ID

  const { getSnackbar } = getContext('snackbar');
  const toplevel = dev ? 'dev' : 'de';

  const ADMIN_EMAIL = `sampleadmin@webpremiere.${toplevel}`;
  const ADMIN_PASS = 'Test@005';
  const USER_EMAIL = `sampleuser@webpremiere.${toplevel}`;
  const USER_PASS = 'Angela@005';
  const ONE = 'one-row';
  const TWO = 'two-rows';
  const THREE = 'three-rows';
  const defaultTab = 'Presets';

  const tabMap = new Map([
    ['Default', { rows: THREE, text: $_('text.formular'), icon: 'notes' }],
    ['Presets', { rows: TWO, text: $_('text.presets'), icon: 'people_alt' }],
    ['Social', { rows: TWO, text: $_('text.social'), icon: 'mood' }]
  ]);
  const tabs = {
    names: () => {
      /** @type {string[]}*/
      const names = [];
      tabMap.forEach((val, key) => {
        names.push(key);
      });
      return names;
    },
    /** @param {string} key */
    rows: (key) => tabMap.get(key)?.rows,
    /** @param {string} key */
    text: (key) => tabMap.get(key)?.text,
    /** @param {string} key */
    icon: (key) => tabMap.get(key)?.icon
  };
  const tabNames = tabs.names();

  /** @type {Element}*/
  let root;
  let password = '';
  let email = '';
  /** @type {import("@smui/snackbar").SnackbarComponentDev} */
  let snackbar;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let invalidTokenUserDialog;
  /** @type {string} */
  let activeSignIn;
  /** @type {string} */
  let activeTab;

  $: rows = activeTab && tabs.rows(activeTab);
  $: activeTab && browser && localStorage.setItem('activeSignIn', activeTab);

  onMount(() => {
    root = document.documentElement;
    unblock();
    activeSignIn = localStorage.getItem('activeSignIn') || '';
    activeTab = (tabMap.has(activeSignIn) && activeSignIn) || defaultTab;
    snackbar = getSnackbar();

    return () => {
      unblock();
    };
  });

  const loginHandler = () => {
    flash.update({ message: $_('text.authenticating'), permanent: true });
    block();
    return /** @param {{result: import('@sveltejs/kit').ActionResult | any}} param */ ({
      result
    }) => {
      /** @type {{success: boolean, data: any}}*/
      const { success, data } = { ...result.data };
      if (success) {
        proxyEvent('ticker:success', { ...data });
      } else {
        proxyEvent('ticker:error', { ...data });

        /**
         * Show dialog after 3 fails
         */
        if (++loginAttempts > 3) invalidTokenUserDialog.setOpen(true);
      }
      reset();
      unblock();
    };
  };

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

  function invalidTokenDialogCloseHandler() {
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
    <TabBar tabs={tabNames} let:tab bind:active={activeTab}>
      <Tab {tab}>
        <LabelIcon class="material-icons">{tabs.icon(tab)}</LabelIcon>
        <Label>{tabs.text(tab)}</Label>
      </Tab>
    </TabBar>
  </div>
  <form
    use:enhance={loginHandler}
    method="POST"
    class="login-form flex justify-center"
    action="/auth?/login"
  >
    <div class="login-grid {rows}">
      {#if activeTab === tabNames[0]}
        <span class="one flex flex-col">
          <Textfield
            variant="outlined"
            bind:value={email}
            bind:input$name={email}
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
            bind:value={password}
            bind:input$name={password}
            label={$_('text.password')}
            autocomplete="user-password"
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
      {#if activeTab === tabNames[1]}
        <span class="one flex flex-col">
          <form use:enhance={loginHandler} action="/auth?/login">
            <div class="one flex justify-center">
              <Button
                color={undefined}
                class="login-button"
                type="submit"
                variant="raised"
                style="flex: 0 0 221px;"
              >
                <Icon class="material-icons">supervisor_account</Icon>
                <Label>Sample Admin</Label>
              </Button>
            </div>
            <input type="hidden" name="email" value={ADMIN_EMAIL} />
            <input type="hidden" name="password" value={ADMIN_PASS} />
          </form>
        </span>
        <span class="two flex flex-col">
          <form use:enhance={loginHandler} action="/auth?/login">
            <div class="two flex justify-center">
              <Button
                color={undefined}
                class="login-button flex-1"
                type="submit"
                variant="raised"
                style="flex: 0 0 221px;"
              >
                <Icon class="material-icons">person</Icon>
                <Label>Sample User</Label>
              </Button>
            </div>
            <input type="hidden" name="email" value={USER_EMAIL} />
            <input type="hidden" name="password" value={USER_PASS} />
          </form>
        </span>
      {/if}
      {#if activeTab === tabNames[2]}
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
    color: var(--primary);
    font-size: 12px;
    flex-basis: 20%;
    width: 50%;
  }
</style>
