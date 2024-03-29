<script context="module">
  let loginAttempts = 0;
</script>

<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { emit } from '$lib/utils';
  import { flash, session } from '$lib/stores';
  import Button from '@smui/button';
  import TabBar from '@smui/tab-bar';
  import Tab, { Icon as TabIcon } from '@smui/tab';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import { Label } from '@smui/common';
  import Dialog, { Title as DialogTitle, Content, Actions } from '@smui/dialog';
  import { FacebookLoginButton, GoogleLoginButton } from '$lib/components';
  import { _ } from 'svelte-i18n';
  import type { ActionResult } from '@sveltejs/kit';

  const client_id = import.meta.env.VITE_CLIENT_ID; // Ggogle Client ID
  const appId = import.meta.env.VITE_APP_ID; // Facebook App ID
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
    ['Default', { rows: THREE, text: 'text.formular', icon: 'notes' }],
    ['Presets', { rows: TWO, text: 'text.presets', icon: 'people_alt' }],
    ['Social', { rows: TWO, text: 'text.social', icon: 'mood' }]
  ]);
  const tabs = {
    keys: () => [...tabMap.keys()],
    rows: (key: string) => tabMap.get(key)?.rows || ONE,
    text: (key: string) => tabMap.get(key)?.text || '',
    icon: (key: string) => tabMap.get(key)?.icon || ''
  };
  const tabNames = tabs.keys();

  let root: Element;
  let invalidTokenUserDialog: Dialog;
  let activeSignIn: string;
  let activeTab: string;
  let password = '';
  let email = '';

  $: rows = activeTab && tabs.rows(activeTab);
  $: activeTab && browser && localStorage.setItem('activeSignIn', activeTab);

  onMount(() => {
    root = document.documentElement;
    unblock();
    activeSignIn = localStorage.getItem('activeSignIn') || '';
    activeTab = (tabMap.has(activeSignIn) && activeSignIn) || defaultTab;

    return () => {
      unblock();
    };
  });

  const loginHandler = () => {
    flash.update({ message: $_('text.authenticating') });
    block();
    return ({ result }: { result: ActionResult }) => {
      if (result.type === 'success') {
        const { success, data }: any = { ...result.data };

        if (success) {
          emit('session:success', { data });
        } else {
          emit('session:error', { ...data });

          /**
           * Show dialog after 3 fails
           */
          if (++loginAttempts > 3) invalidTokenUserDialog?.setOpen(true);
        }
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
        <TabIcon class="material-icons">{tabs.icon(tab)}</TabIcon>
        <Label>{$_(tabs.text(tab))}</Label>
      </Tab>
    </TabBar>
  </div>
  {#if activeTab === tabNames[0]}
    <form
      use:enhance={loginHandler}
      method="POST"
      class="login-form flex justify-center flex"
      action="/auth?/login"
    >
      <div class="login-grid {rows}">
        <span class="one">
          <Textfield variant="outlined" bind:value={email} input$name="email" label="Email">
            <Icon class="material-icons" slot="leadingIcon">mail</Icon>
          </Textfield>
        </span>
        <span class="two">
          <Textfield
            variant="outlined"
            type="password"
            bind:value={password}
            input$name="password"
            label={$_('text.password')}
          >
            <Icon class="material-icons" slot="leadingIcon">login</Icon>
          </Textfield>
        </span>
        <span class="three flex">
          <Button
            disabled={!(email && password)}
            class="login-button"
            type="submit"
            variant="raised"
            style="flex: 0 0 100%;"
          >
            <Label>Login</Label>
          </Button>
        </span>
      </div>
    </form>
  {/if}
  {#if activeTab === tabNames[1]}
    <div class="login-grid {rows}">
      <div class="one flex justify-center">
        <form use:enhance={loginHandler} action="/auth?/login" method="POST">
          <Button type="submit" variant="raised" style="width: 221px;">
            <Icon class="material-icons">supervisor_account</Icon>
            <Label>Sample Admin</Label>
          </Button>
          <input type="hidden" name="email" value={ADMIN_EMAIL} />
          <input type="hidden" name="password" value={ADMIN_PASS} />
        </form>
      </div>
      <div class="two flex justify-center">
        <form use:enhance={loginHandler} action="/auth?/login" method="POST">
          <Button type="submit" variant="raised" style="width: 221px;">
            <Icon class="material-icons">person</Icon>
            <Label>Sample User</Label>
          </Button>
          <input type="hidden" name="email" value={USER_EMAIL} />
          <input type="hidden" name="password" value={USER_PASS} />
        </form>
      </div>
    </div>
  {/if}
  {#if activeTab === tabNames[2]}
    <div class="login-grid {rows}">
      <div class="one flex relative justify-center">
        <FacebookLoginButton {appId} />
      </div>
      <div class="two flex relative justify-center">
        <GoogleLoginButton {client_id} />
      </div>
    </div>
  {/if}
</div>
<Dialog
  bind:this={invalidTokenUserDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  surface$style="width: var(--dialog-w); max-width: var(--dialog-max-w);"
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
