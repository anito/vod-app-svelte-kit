<script>
  // @ts-nocheck
  import * as api from '$lib/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { flash } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export let client_id;

  onMount(() => {
    (window.google && googleSignIn()) || window.addEventListener('load', googleSignIn);
  });

  function googleSignIn() {
    google.accounts.id.initialize({
      client_id,
      callback: googleHandleCredentialResponse
    });
    renderGoogleButton();
  }

  async function googleHandleCredentialResponse(response) {
    decodeJwtResponse(response.credential);
  }

  async function decodeJwtResponse(token) {
    flash.update({ message: $_('text.one-moment') });

    await api.post('users/google_login', { token }).then(async (res) => {
      if (res.success) {
        goto(`/login/redirect/?token=${res.data.token}`).then(() => {
          setTimeout(() => renderGoogleButton(), 500);
        });
      }
    });
  }

  function renderGoogleButton() {
    google.accounts.id.renderButton(
      document.getElementById('googleButton'),
      { theme: 'outline', size: 'large' } // customization attributes
    );
    google.accounts.id.prompt(); // display the One Tap dialog
  }
</script>

<div id="googleButton" class="flex-1 absolute" />
