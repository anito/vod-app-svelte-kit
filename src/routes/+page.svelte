<script>
  // @ts-nocheck

  import './_form.scss';
  import logo from 'assets/images/logo-type-vod.svg';
  import hero from 'assets/images/logo_hero_vod.svg';
  import * as api from '$lib/api';
  import { getContext, onMount } from 'svelte';
  import { sitename, session } from '$lib/stores';
  import Layout from './layout.svelte';
  import { Blurb, Hero } from '$lib/components';
  import Textfield from '@smui/textfield';
  import Select, { Option } from '@smui/select';
  import Button, { Icon } from '@smui/button';
  import { ADMIN, SUPERUSER, svg } from '$lib/utils';
  import { svg_manifest } from '$lib/svg_manifest';
  import { _ } from 'svelte-i18n';

  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const void0 = void 0;

  let root;
  let name = '';
  let email = '';
  let message = '';
  let invalidEmail = true;
  let selected;
  /** @type {import("@smui/snackbar").SnackbarComponentDev} */
  let snackbar;

  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: user = (({ name: _name, email: _email }) => {
    name = _name;
    email = _email;
    return { name, email };
  })({ name, email, ...$session.user });
  $: options = [
    { key: void0, label: '' },
    {
      key: 'send-more',
      label: $_('text.request-more-information'),
      subject: $_('text.request-more-information')
    },
    {
      key: 'message',
      label: $_('text.user-message'),
      subject: $_('text.new-message-from-user', { values: { name } })
    }
  ];
  $: content = selected === 'message' ? message : '';
  $: continueWith = $session.user
    ? { title: $_('text.yourCourses'), url: 'videos' }
    : { title: $_('text.login'), url: 'login' };
  $: formValid = selected !== void0 && name && email && !invalidEmail;
  $: canSend = selected === 'message' ? formValid && message.length >= 5 : formValid;

  onMount(() => {
    root = document.documentElement;
    snackbar = getSnackbar();
  });

  async function submit(e) {
    const data = {
      data: {
        user,
        subject: options.find((option) => option.key === selected).subject,
        content,
        template: 'from-user'
      },
      token: hasPrivileges && $session.user?.jwt
    };
    await api.post('sents/add', { ...data }).then((res) => {
      if (res?.success) {
        configSnackbar($_('text.thank-you-for-your-message'));
        reset();
      } else {
        configSnackbar($_('text.message-sent-failed'));
      }
      snackbar?.open();
    });
  }

  function reset() {
    selected = null;
    message = '';
    name = '';
    email = '';
  }
</script>

<svelte:head>
  <title>{$sitename} | Home</title>
</svelte:head>

<Layout>
  <Hero title="Immersive Studio" tagline="" outline={hero} logotype={logo} />

  <Blurb>
    <a href="/" class="" slot="one">
      <h2>{$_('blocks.p1.header')}</h2>
      <p>
        {$_('blocks.p1.text1')}
      </p>
    </a>

    <div class="flex flex-col flex-1 justify-between" slot="two">
      <h2>{$_('blocks.p2.header')}</h2>
      <div class="flex-1">
        {#if !selected}
          <p>{$_('blocks.p2.text')}</p>
          <a href="/{continueWith.url}" class="learn-more">{continueWith.title}</a>
        {:else}
          <p>{$_('blocks.p7.text')}</p>
        {/if}
      </div>
      <form
        method="post"
        on:submit|preventDefault={submit}
        class="user-info-form flex-col justify-between"
      >
        {#if selected}
          {#if selected === 'message'}
            <Textfield class="user-message" textarea bind:value={message} style="width:100%;  " />
          {/if}
          <div class="user-info flex justify-between" style="width: 100%;">
            <Textfield bind:value={name} disabled={!!$session.user} label="" style="flex: 0.49">
              <span slot="label">
                <Icon
                  class="material-icons"
                  style="font-size: 1em; line-height: normal; vertical-align: middle;">person</Icon
                >
                {$_('text.name')}
              </span>
            </Textfield>
            <Textfield
              bind:value={email}
              bind:invalid={invalidEmail}
              disabled={!!$session.user}
              type="email"
              label=""
              updateInvalid
              input$autocomplete="email"
              style="flex: 0.49"
            >
              <span slot="label">
                <Icon
                  class="material-icons"
                  style="font-size: 1em; line-height: normal; vertical-align: middle;">email</Icon
                >
                {$_('text.email')}
              </span>
            </Textfield>
          </div>
        {/if}
        <div class="" style="width: 100%;">
          <Select class="info-select" bind:value={selected} label={$_('text.are-you-interested')}>
            {#each options as option (option.key)}
              <Option value={option.key}>{option.label}</Option>
            {/each}
          </Select>
          <Button class="submit" disabled={!canSend}>
            <Icon class="material-icons">send</Icon>
          </Button>
        </div>
      </form>
    </div>

    <div class="description" slot="what">
      <p>{$_('blocks.p3.text')}</p>

      <p>{$_('blocks.p4.text')}</p>
    </div>

    <div style="grid-area: start; display: flex; flex-direction: column; min-width: 0" slot="how">
      <p style="margin: 0 0 1em 0; min-width: 0; min-height: 0">
        {$_('blocks.p3.text')}
      </p>
    </div>
  </Blurb>
</Layout>

<style>
</style>
