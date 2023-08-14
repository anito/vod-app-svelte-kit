<script lang="ts">
  import { onMount } from 'svelte';
  import { flash, googleUser } from '$lib/stores';
  import { get, emit } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  export let client_id = '';

  let signInButton: HTMLButtonElement;
  let id: string | undefined;
  let name: string | undefined;
  let email: string | undefined;
  let globalGoogle: any;

  googleUser.subscribe((val) => ({ id, name, email } = { ...val }));

  onMount(() => {
    if ('google' in window) {
      globalGoogle = window['google'];
      signIn();
    } else {
      window.addEventListener('load', signIn);
    }
  });

  function signIn() {
    globalGoogle.accounts.id.initialize({
      client_id,
      auto_select: false,
      context: 'signin',
      callback: googleHandleCredentialResponse
    });
    renderButton();
  }

  async function googleHandleCredentialResponse({ credential }: any) {
    decodeJwtResponse(credential);
  }

  async function decodeJwtResponse(token: string) {
    flash.update({ message: $_('text.authenticating') });
    await get(`/auth/login?token=${token}&type=google`).then(async (res) => {
      const { success, data }: any = { ...res };
      if (success) {
        googleUser.set(data.user);
        console.log(data)
        emit('session:success', { data });
      } else {
        emit('session:error', { ...data, redirect: '/login' });
      }
    });
  }

  function renderButton() {
    globalGoogle.accounts.id.renderButton(
      signInButton,
      {
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'right',
        width: 221
      } // customization attributes
    );
    globalGoogle.accounts.id.prompt(); // display the One Tap dialog
  }

  function signOut(id: string | undefined) {
    globalGoogle.accounts.id.disableAutoSelect();
    globalGoogle.accounts.id.revoke(id, (res: any) => {
      googleUser.set({ id: undefined });
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
