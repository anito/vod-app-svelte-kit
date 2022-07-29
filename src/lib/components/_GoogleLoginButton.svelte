<script>
  // @ts-nocheck
  import * as api from '$lib/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { flash, googleUser } from '$lib/stores';
  import { _ } from 'svelte-i18n';
  import { get } from 'svelte/store';

  export let client_id;

  let signInButton;
  let id;
  let name;
  let email;

  googleUser.subscribe((val) => ({ id, name, email } = { ...val }));

  onMount(() => {
    (window.google && googleSignIn()) || window.addEventListener('load', googleSignIn);
  });

  function googleSignIn() {
    google.accounts.id.initialize({
      client_id,
      auto_select: false,
      context: 'signin',
      callback: googleHandleCredentialResponse
    });
    renderSignIn();
  }

  async function googleHandleCredentialResponse(response) {
    decodeJwtResponse(response.credential);
  }

  async function decodeJwtResponse(token) {
    flash.update({ message: $_('text.one-moment') });

    await api.post('users/google_login', { token }).then(async (res) => {
      if (res.success) {
        googleUser.update(res.data.user);
        goto(`/login/redirect/?token=${res.data.token}`).then(() => {
          setTimeout(() => renderSignIn(), 500);
        });
      }
    });
  }

  function renderSignIn() {
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
    if (id) {
      google.accounts.id.revoke(id, (res) => {
        if (res.successful) {
          googleUser.set(null);
          goto(`/login/redirect/`).then(() => {
            setTimeout(() => renderSignIn(), 500);
          });
        }
      });
    }
  }
</script>

<div class="flex flex-col relative">
  <button bind:this={signInButton} />
  {#if id}
    <a href="#" class="logout-link g_id_signout" on:click={() => signOut(id)}
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
