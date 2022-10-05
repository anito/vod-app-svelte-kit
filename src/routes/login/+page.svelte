<script>
  import './_tabs.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { LoginForm } from '$lib/components';
  import { flash, session, sitename, settings } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import { log, processRedirect, proxyEvent, randomItem } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  /** @type {import('./$types').PageData | any} */
  export let data;

  const transitionParams = {
    delay: 100,
    duration: 600
  };
  const textTransitionParams = { ...transitionParams, x: -80 };
  const { mounted } = getContext('mounted');
  const promise = new Promise((resolve) => {
    setTimeout(() => resolve(1), 500);
  });

  $: $mounted && init();
  $: loggedin = !!$session.user;
  $: salutation = randomItem($settings.Site.salutations);
  $: ({ message, type } = $session.user
    ? {
        message: $_('text.welcome-message', {
          values: { salutation, name: $session.user?.name }
        }),
        type: 'success'
      }
    : $page.url.searchParams.has('token')
    ? {
        message: $_('text.authenticating'),
        type: 'success'
      }
    : {
        message: $_('text.login-text'),
        type: 'success'
      });

  onMount(() => {});

  // listeners are ready
  function init() {
    if (data.fromToken) {
      loginFromToken();
    }
  }

  async function introendHandler() {
    if ($session.user) {
      const redirect = processRedirect($page.url, $session);
      setTimeout(() => goto(redirect), 1000);
    }
  }

  async function loginFromToken() {
    if (data.success) {
      proxyEvent('ticker:success', { ...data.data });
    } else {
      proxyEvent('ticker:error', { ...data.data, redirect: '/login' });
    }
  }
</script>

<svelte:head>
  <title>{$sitename} | Login</title>
</svelte:head>

<div in:fly={{ x: -200, duration: 800 }} out:fly={{ x: 200 }} class="flex flex-1 justify-center">
  {#await promise then}
    <div class="wrapper">
      <div style="margin-top: calc(100vh / 6);">
        <div class="flyer flex">
          {#if $flash.message}
            <div
              class="flex justify-center items-center message {$flash.type}"
              in:fly={textTransitionParams}
            >
              <h5 class="m-2 mdc-typography--headline5 headline">
                {$flash.message}
              </h5>
            </div>
          {:else}
            <div
              class="flex justify-center items-center message {type}"
              in:fly={textTransitionParams}
              on:introend={introendHandler}
            >
              <h5 class="m-2 mdc-typography--headline5 headline">{message}</h5>
            </div>
          {/if}
        </div>
        <div class="login-form loggedin" class:loggedin>
          <LoginForm />
        </div>
      </div>
    </div>
  {/await}
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
    height: 100px;
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
    text-align: center;
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
      width: 600px;
    }
    .message .headline {
      max-width: 100%;
      overflow: auto;
      white-space: normal;
      text-align: center;
    }
  }
</style>
