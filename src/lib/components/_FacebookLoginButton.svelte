<script>
  // @ts-nocheck

  import './_fbButton.scss';
  import * as api from '$lib/api';
  import { goto } from '$app/navigation';
  import Button, { Icon, Label } from '@smui/button';
  import { onMount } from 'svelte';
  import SvgIcon from './_SvgIcon.svelte';
  import { _ } from 'svelte-i18n';

  export let appId;

  let status;
  let src;
  let authResponse = null;

  onMount(() => {
    init();
    window.fbAsyncInit();
  });

  function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'connected') {
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
      status = _status;
    });
  }

  function statusChangeHandler({ authResponse: _authResponse, status: _status }) {
    authResponse = _authResponse;
    status = _status;
    if (status === 'connected') {
      // Logged into your webpage and Facebook.
      authResponse && fbAPI({ ...authResponse, redirect: false });
    }
  }

  const init = () => {
    window.fbAsyncInit = function () {
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
      FB.api(`/${userID}/picture`, 'GET', { type: 'large', redirect: false }, async ({ data }) => {
        src = data.url;
        await api
          .post(`users/facebook_login/${id}`, { data: { email, name, picture: { ...data } } })
          .then(async (res) => {
            if (res.success && redirect) {
              setTimeout(async () => {
                await goto(`/login/redirect/?token=${res.data.token}`);
              }, 200);
            }
          });
      });
    });
  }
</script>

<Button
  class="absolute min-w-full fb-button flex justify-start overflow-clip"
  on:click={(e) => handleLogin(e)}
>
  <SvgIcon name="facebook" class="mr-1" />
  <Label style="font-weight: 600;">{$_('text.login-with-facebook')}</Label>
  {#if status === 'connected'}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img width="36" height="36" class="relative" style="right: -8px;" {src} />
  {/if}
</Button>

<div class="absolute hidden" style="bottom: -90px;">{status}</div>
