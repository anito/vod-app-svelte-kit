<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { flash, googleUser } from '$lib/stores';
  import { get, post, proxyEvent } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  export let client_id = '';

  /** @type {HTMLButtonElement}*/
  let signInButton;
  /** @type {string}*/
  let id;
  /** @type {string}*/
  let name;
  /** @type {string}*/
  let email;

  googleUser.subscribe(
    /** @param {import('$lib/types').GoogleUser} val*/ (val) => ({ id, name, email } = { ...val })
  );

  onMount(() => {
    (window.google && signIn()) || window.addEventListener('load', signIn);
  });

  function signIn() {
    google.accounts.id.initialize({
      client_id,
      auto_select: false,
      context: 'signin',
      callback: googleHandleCredentialResponse
    });
    renderButton();
  }

  async function googleHandleCredentialResponse(response) {
    decodeJwtResponse(response.credential);
  }

  async function decodeJwtResponse(token) {
    flash.update({ message: $_('text.authenticating'), permanent: true });
    await get(`/auth/login?token=${token}&type=google`, { token }).then(async (res) => {
      const { success, data } = { ...res };
      if (success) {
        googleUser.set(data.user);
        proxyEvent('ticker:success', { ...data });
      } else {
        proxyEvent('ticker:error', { ...data, redirect: '/login' });
      }
      setTimeout(() => renderButton(), 500);
    });
  }

  function renderButton() {
    google.accounts.id.renderButton(
      signInButton,
      {
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'right',
        width: '221'
      } // customization attributes
    );
    google.accounts.id.prompt(); // display the One Tap dialog
  }

  function signOut(id) {
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(id, (res) => {
      googleUser.set(null);
    });
  }
</script>

<div class="flex flex-col relative">
  <button bind:this={signInButton} />
  {#if id}
    <a href="." class="logout-link g_id_signout" on:click|preventDefault={() => signOut(id)}
      >{$_('text.revoke_app_from_user', { values: { name } })}</a
    >
  {/if}
</div>

<style>
  .logout-link {
    bottom: -7px;
    font-size: 0.6em;
    margin: 0 auto;
    line-height: 0.5em;
  }
</style>
