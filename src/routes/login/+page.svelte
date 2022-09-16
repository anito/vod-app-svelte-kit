<script>
  // @ts-nocheck

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ListMessages, ListErrors, LoginForm } from '$lib/components';
  import { flash, session } from '$lib/stores';
  import { sitename } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import { processRedirect, proxyEvent } from '$lib/utils';
  import Paper, { Content } from '@smui/paper';
  import { _ } from 'svelte-i18n';
  import { getContext } from 'svelte';

  export let data;

  const transitionParams = {
    delay: 0,
    duration: 200
  };
  const textTransitionParams = { ...transitionParams, x: -80 };
  const { mounted } = getContext('mounted');

  let errors = null;

  $: $mounted && init();
  $: loggedin = !!$session.user;
  $: outroended = loggedin;
  $: message = $session.user
    ? $_('text.welcome-message', { values: { name: $session.user.name } })
    : $page.url.searchParams.has('token')
    ? $_('text.one-moment')
    : $_('text.login-text');
  $: if (!loggedin) {
    flash.update({
      message,
      type: 'success'
    });
  }

  onMount(() => {});

  function init() {
    if (data.hasToken) {
      const { success, data: serverData } = { ...data };
      console.log(success, serverData);
      if (success) {
        proxyEvent('ticker:start', serverData);
        flash.update({ ...serverData, type: 'success', timeout: 2000 });
      } else {
        flash.update({ ...serverData, type: 'error', timeout: 2000 });
      }
    }
  }

  async function introendHandler() {
    console.log('introend', !!$session.user);
    if ($session.user) {
      setTimeout(() => goto(processRedirect($page.url.searchParams, $session)), 1000);
    } else {
      // setTimeout(() => goto('/login'), 1000);
    }
  }
</script>

<svelte:head>
  <title>{$sitename} | Login</title>
</svelte:head>

<div
  in:fly={{ x: -200, duration: 800 }}
  out:fly={{ x: 200 }}
  class="flex flex-1 justify-center paper-wrapper"
>
  <div class="wrapper">
    <Paper elevation="20" style="margin-top: calc(100vh / 6);">
      <div class="flyer">
        {#if $flash.message}
          <div
            class="flex justify-center message {$flash.type}"
            transition:fly={textTransitionParams}
            on:outrostart={(e) => (outroended = false)}
            on:outroend={(e) => (outroended = true)}
          >
            <h5 class="m-2 mdc-typography--headline5 headline">
              {$flash.message}
            </h5>
          </div>
        {:else if outroended}
          <div
            class="flex justify-center message success"
            in:fly={{ ...textTransitionParams }}
            on:introend={() => introendHandler()}
          >
            <h5 class="m-2 mdc-typography--headline5 headline">{message}</h5>
          </div>
        {/if}
      </div>
      <div class="login-form loggedin" class:loggedin>
        <Paper elevation="0" style="padding-top: 0;">
          <Content>
            <LoginForm />
          </Content>
        </Paper>
      </div>
    </Paper>
  </div>
</div>

<div class="hidden">
  <ListErrors {errors} />
  <ListMessages {message} />
</div>

<style>
  .login-form {
    transition: opacity 0.4s ease-in;
    opacity: 1;
  }
  .login-form.loggedin {
    transition: opacity 0.4s ease-in;
    opacity: 0.5;
    pointer-events: none;
  }
  .flyer {
    height: 50px;
    overflow: hidden;
    position: relative;
  }
  .message {
    margin: 0 auto;
    color: var(--prime);
  }
  .message .headline {
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :global(.error).message {
    color: var(--error) !important;
  }
  :global(.info).message {
    color: var(--info) !important;
  }
  :global(.warning).message {
    color: var(--warning) !important;
  }
  :global(.success).message {
    color: var(--success) !important;
  }
  @media (min-width: 768px) {
    .wrapper {
      width: 522px;
    }
  }
</style>