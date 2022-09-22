<script>
  // @ts-nocheck

  import './_fbButton.scss';
  import { invalidate } from '$app/navigation';
  import Button, { Icon, Label } from '@smui/button';
  import { onMount } from 'svelte';
  import SvgIcon from './_SvgIcon.svelte';
  import { _ } from 'svelte-i18n';
  import { post, proxyEvent } from '$lib/utils';

  export let appId;

  let status;
  let _name = '';
  let _email = '';
  let defaultSrc = 'favicon.png';
  let src = defaultSrc;
  let authResponse = null;

  $: connected = status === 'connected';

  onMount(() => {
    init();
    window.fbAsyncInit();
  });

  function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    if (connected) {
      authResponse && fbAPI({ ...authResponse, redirect: true });
    } else {
      login();
    }
  }

  function login() {
    FB.login(
      ({ authResponse, status: _status }) => {
        status = _status;
        authResponse && fbAPI({ ...authResponse, redirect: true });
      },
      { scope: 'public_profile,email' }
    );
  }

  function logout() {
    FB.logout(({ status: _status, authResponse }) => {
      src = null;
      _name = null;
      _email = null;
      status = _status;
    });
  }

  function statusChangeHandler({ authResponse: _authResponse, status: _status }) {
    authResponse = _authResponse;
    status = _status;
    if (connected) {
      // Logged into your webpage and Facebook.
      authResponse && fbAPI({ ...authResponse, redirect: false });
    }
  }

  const init = () => {
    window.fbAsyncInit = () => {
      FB.init({
        appId,
        cookie: true, // Enable cookies to allow the server to access the session.
        xfbml: true, // Parse social plugins on this webpage.
        version: 'v14.0'
      });

      FB.getLoginStatus((response) => {
        statusChangeHandler(response);
      });
    };
  };

  function fbAPI({ userID, redirect }) {
    FB.api(`/${userID}?fields=id,name,email`, async ({ email, id, name }) => {
      _name = name;
      _email = email;
      FB.api(`/${userID}/picture`, 'GET', { type: 'large', redirect: false }, async ({ data }) => {
        src = data?.url || defaultSrc;
        if (id && redirect) {
          await post(`/auth/login?type=facebook`, {
            id,
            email,
            name,
            picture: { ...data }
          }).then(async (res) => {
            const { success, data } = { ...res };
            if (success) {
              proxyEvent('ticker:success', { ...data });
            } else {
              proxyEvent('ticker:error', { ...data, redirect: '/login' });
            }
          });
        }
      });
    });
  }
</script>

<div class="relative flex flex-col">
  <Button
    class="min-w-full fb-button flex overflow-clip justify-between {connected
      ? 'connected'
      : 'flex-row-reverse'}"
    style="height: 41px;"
    on:click={(e) => handleLogin(e)}
  >
    <div class="flex justify-center" style="width: 80%;">
      {#if connected}
        <div class="image-wrapper self-center">
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            alt={$_('text.profile_image', { values: { name: _name } })}
            class="relative image"
            {src}
          />
        </div>
      {/if}
      <div class="label-wrapper flex flex-col overflow-hidden">
        <div class="first-line connected" class:connected>{$_('text.login-with-facebook')}</div>
        {#if _email}
          <div class="email-line">{_email}</div>
        {/if}
      </div>
    </div>
    <div class="logo-wrapper" style="width: 41px;">
      <div class="logo flex items-center justify-center">
        <SvgIcon name="facebook" class="mr-1" fillColor="#3578E5" />
      </div>
    </div>
  </Button>
  {#if connected}
    <a href="." class="logout-link" on:click={() => logout()}>{$_('text.logout-from-facebook')}</a>
  {/if}
</div>

<div class="absolute hidden" style="bottom: -90px;">{status}</div>

<style>
  .label-wrapper {
    line-height: 1.2em;
    font-family: Roboto;
    text-transform: initial;
    letter-spacing: 0.25px;
    text-align: start;
  }
  .label-wrapper > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .first-line:not(.connected) {
    font-size: 14px;
  }
  .first-line {
    font-weight: 500;
  }
  .email-line {
    font-weight: 400;
    font-size: 11px;
    color: #eeeeee;
  }
  .image-wrapper {
    margin-left: 4px;
    margin-right: 4px;
  }
  .image {
    -webkit-border-radius: 50%;
    border-radius: 50%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    height: 20px;
    margin-left: -4px;
    margin-right: 8px;
    min-width: 20px;
    width: 20px;
  }
  .logo {
    border-radius: 18px;
    background-color: #ffffff;
    height: 36px;
    width: 36px;
    min-width: 36px;
    align-self: center;
    margin-left: -6px;
    margin-right: 5px;
    line-height: 2.3em;
  }
  :global(.connected) .logo {
    margin-left: 11px;
  }
  .logout-link {
    bottom: -7px;
    font-size: 0.6em;
    margin: 0 auto;
    line-height: 0.5em;
  }
</style>
