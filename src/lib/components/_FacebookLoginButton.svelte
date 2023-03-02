<script lang="ts">
  import './_fbButton.scss';
  import transparent from 'assets/images/transparent.png';
  import Button from '@smui/button';
  import { onMount } from 'svelte';
  import SvgIcon from './_SvgIcon.svelte';
  import { post, dispatch } from '$lib/utils';
  import { flash } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  type FbResponse = {
    authResponse: AuthResponse;
    status: string;
  }
  type AuthResponse = {
    userID: string;
  }
  type FbUser = {
    id: string;
    email: string;
    name: string;
  }

  export let appId: string;

  let authResponse: AuthResponse | null = null;
  let src: null | string = null;
  let status: string | null = '';
  let id: string | null = '';
  let name: string | null = '';
  let email: string | null = '';

  $: connected = status === 'connected';

  onMount(() => {
    init();
  });

  const init = () => {
    window.FB.init({
      appId,
      cookie: true, // Enable cookies to allow the server to access the session.
      xfbml: true, // Parse social plugins on this webpage.
      version: 'v14.0'
    });

    window.FB.getLoginStatus((response: FbResponse) => {
      statusChangeHandler(response);
    });
  };

  function statusChangeHandler(response: FbResponse) {
    ({ authResponse, status } = response);
    authResponse && fbAPI({ ...authResponse, redirect: connected });
  }

  function fbAPI({ userID, redirect }: any) {
    window.FB.api(`/${userID}?fields=id,name,email`, async (user: FbUser) => {
      ({ email, id, name } = user); // User attributes
      window.FB.api(`/${userID}/picture`, 'GET', { type: 'large', redirect: false }, async ({ data }: {data: {url: string}}) => {
        ({ url: src } = data); // The src attribute for login buttton
        if (id && redirect) {
          flash.update({ message: $_('text.authenticating') });
          await post(`/auth/login?type=facebook`, {
            id,
            email,
            name,
            picture: { ...data }
          }).then(async (res) => {
            const { success, data }: any = { ...res };
            if (success) {
              dispatch('session:success', { data });
            } else {
              dispatch('session:error', { ...data, redirect: '/login' });
            }
          });
        }
      });
    });
  }

  function handleLogin(e: CustomEvent) {
    e.preventDefault();
    e.stopPropagation();
    fbAPI({ ...authResponse, redirect: true });
    if (!connected) login();
  }

  function login() {
    window.FB.login(
      (response: FbResponse) => {
        ({ authResponse, status } = { ...response });
        fbAPI({ ...authResponse, redirect: true });
      },
      { scope: 'public_profile,email' }
    );
  }

  function logout() {
    window.FB.logout((response: FbResponse) => {
      ({ status } = { ...response });
      src = null;
      name = null;
      email = null;
    });
  }
</script>

<div class="relative flex flex-col">
  <Button
    class="min-w-full fb-button flex overflow-clip justify-between {connected
      ? 'connected'
      : 'flex-row-reverse'}"
    style="height: 41px;"
    on:click={handleLogin}
  >
    <div class="flex justify-center" style="width: 80%;">
      {#if connected}
        <div class="image-wrapper self-center">
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            alt={$_('text.profile_image', { values: { name } })}
            class="relative image"
            src={src ?? transparent}
          />
        </div>
      {/if}
      <div class="label-wrapper flex flex-col overflow-hidden">
        <div class="first-line connected" class:connected>
          {$_('text.login-with-facebook')}
        </div>
        {#if email}
          <div class="email-line">{email}</div>
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
    <a href="." class="logout-link" on:click|preventDefault={() => logout()}
      >{$_('text.logout-from-facebook')}</a
    >
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
