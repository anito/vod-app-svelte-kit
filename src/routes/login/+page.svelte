<script lang="ts">
  import './_tabs.scss';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import { LoginForm } from '$lib/components';
  import { flash, session } from '$lib/stores';
  import { fade, fly } from 'svelte/transition';
  import { processRedirect, emit } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import { backOut, quartOut, quintOut, expoOut } from 'svelte/easing';

  export let data;

  let initialized: Promise<any>;

  const transitionParams = {
    delay: 100,
    duration: 600,
    easing: expoOut,
  };
  const dist = 40;
  const horizontally = (amount: number, options?: any) => ({
    ...transitionParams,
    ...options,
    x: amount,
  });
  const vertically = (amount: number, options?: any) => ({
    ...transitionParams,
    ...options,
    y: amount,
  });
  const left = (amount: number = dist, options?: any) =>
    horizontally(-amount, options);
  const right = (amount: number = dist, options?: any) =>
    horizontally(amount, options);
  const top = (amount: number = dist, options?: any) =>
    vertically(-amount, options);
  const bottom = (amount: number = dist, options?: any) =>
    vertically(amount, options);

  const { mounted }: any = getContext('mounted');

  type Message = {
    text: string;
    type: string;
  };

  onMount(() => void 0);

  $: $mounted && init();
  $: loggedin = !!$session.user;
  $: userStatus = new Promise((resolve, reject) => {
    if ($session.user)
      resolve({
        text: `${$session.salutation}, ${$session.user.name}`,
        type: 'success',
      });
    else
      reject({
        text: $page.url.searchParams.has('token')
          ? $_('text.one-moment')
          : $_('text.login-text'),
        type: 'success',
      });
  }) as Promise<Message>;

  // listeners are ready
  function init() {
    if (data.fromToken) {
      if (data.success) {
        emit('session:success', { data: data.data });
      } else {
        emit('session:error', { ...data.data, redirect: '/login' });
      }
    }
    initialized = new Promise((resolve) => setTimeout(() => resolve(1), 500));
  }

  // Redirects after successful login
  function introendHandler() {
    setTimeout(async () => {
      const location = processRedirect($page.url, $session);
      await goto(location);
    }, 1000);
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | Login</title>
</svelte:head>

{#await initialized then}
  <div in:fly={right()} class="flex flex-1 justify-center">
    <div class="wrapper">
      <div style="margin-top: calc(100vh / 6);">
        <div class="flyer flex">
          {#if $flash.message}
            <div
              class="flex justify-center items-center message {$flash.type}"
              in:fly={left()}
            >
              <h5 class="m-2 mdc-typography--headline5 headline">
                {$flash.message}
              </h5>
            </div>
          {:else}
            {#await userStatus then message}
              <div
                class="flex justify-center items-center message {message.type}"
                in:fly={left(40)}
                on:introend={introendHandler}
              >
                <h5 class="m-2 mdc-typography--headline5 headline">
                  {message.text}
                </h5>
              </div>
            {:catch reason}
              <div
                class="flex justify-center items-center message {reason.type}"
                in:fly={left()}
              >
                <h5 class="m-2 mdc-typography--headline5 headline">
                  {reason.text}
                </h5>
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
  }
  .message .headline {
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    white-space: nowrap;
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
