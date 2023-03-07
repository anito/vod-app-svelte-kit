<script lang="ts">
  import './_tabs.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import { LoginForm } from '$lib/components';
  import { flash, session } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import { processRedirect, emit } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import { browser } from '$app/environment';

  export let data: PageData;

  const transitionParams = {
    delay: 100,
    duration: 600
  };
  const textTransitionParams = { ...transitionParams, x: -80 };
  const { mounted }: any = getContext('mounted');
  let promise: Promise<any>;

  $: $mounted && init();
  $: loggedin = !!$session.user;
  $: ({ message, type } = $session.user
    ? {
        message: `${$session.salutation}, ${$session.user.name}`,
        type: 'success'
      }
    : $page.url.searchParams.has('token')
    ? {
        message: $_('text.authenticating'),
        type: 'success'
      }
    : {});
  $: userPromise =
    browser &&
    (new Promise((resolve, reject) => {
      if ($session.user)
        resolve({
          message: `${$session.salutation}, ${$session.user.name}`,
          type: 'success'
        });
      else
        reject({
          message: $_('text.login-text'),
          type: 'success'
        });
    }).catch() as Promise<{ message: string; type: string }>);

  // listeners are ready
  async function init() {
    if (data.hotswap) {
      setTimeout(async () => await goto(data.hotswap), 200);
      return;
    }
    if (data.fromToken) {
      fromToken();
    }
    promise = new Promise((resolve) => setTimeout(() => resolve(1), 500));
  }

  function introendHandler() {
    setTimeout(async () => {
      const location = processRedirect($page.url, $session);
      await goto(location);
    }, 1000);
  }

  async function fromToken() {
    if (data.success) {
      emit('session:success', { data: data.data });
    } else {
      emit('session:error', { ...data.data, redirect: '/login' });
    }
    return true;
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | Login</title>
</svelte:head>

{#await promise then resolved}
  {#if resolved}
    <div
      in:fly={{ x: -200, duration: 800 }}
      out:fly={{ x: 200 }}
      class="flex flex-1 justify-center"
    >
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
              {#await userPromise then promise}
                {#if promise}
                  <div
                    class="flex justify-center items-center message {promise.type}"
                    in:fly={textTransitionParams}
                    on:introend={introendHandler}
                  >
                    <h5 class="m-2 mdc-typography--headline5 headline">{promise.message}</h5>
                  </div>
                {/if}
              {:catch reason}
                <div
                  class="flex justify-center items-center message {reason.type}"
                  in:fly={textTransitionParams}
                >
                  <h5 class="m-2 mdc-typography--headline5 headline">{reason.message}</h5>
                </div>
              {/await}
            {/if}
          </div>
          <div class="login-form loggedin" class:loggedin>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  {/if}
{/await}

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
    color: var(--primary);
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
