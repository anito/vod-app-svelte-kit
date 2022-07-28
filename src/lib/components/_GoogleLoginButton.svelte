<script>
  // @ts-nocheck
  import * as api from '$lib/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { flash } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export let client_id;

  let signInButton;

  onMount(() => {
    (window.google && googleSignIn()) || window.addEventListener('load', googleSignIn);
  });

  function googleSignIn() {
    google.accounts.id.initialize({
      client_id,
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
</script>

<button bind:this={signInButton} />
