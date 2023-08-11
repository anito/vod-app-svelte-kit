<script lang="ts">
  import './_form.scss';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { getContext, onMount } from 'svelte';
  import logo from 'assets/images/logo-type.svg';
  import hero from 'assets/images/logo-hero-vod.svg';
  import { session } from '$lib/stores';
  import Layout from './layout.svelte';
  import { Blurb, Hero } from '$lib/components';
  import Textfield from '@smui/textfield';
  import Select, { Option } from '@smui/select';
  import Button, { Icon } from '@smui/button';
  import { Canvas } from '$lib/components';
  import TerrainScene from '$lib/components/scenes/SceneTerrain.svelte';
  import FilmgrainScene from '$lib/components/scenes/SceneFilmgrain.svelte';
  import { ADMIN, SUPERUSER } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';
  import type { ActionResult } from '@sveltejs/kit';

  const { showSnackbar }: any = getContext('snackbar');
  const void0 = void 0;
  const template = 'from-user';

  let name = '';
  let email = '';
  let message = '';
  let invalidEmail = true;
  let selected: string | null | undefined;

  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
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
  $: continueWith = $session.user
    ? { title: $_('text.yourCourses'), url: 'videos' }
    : { title: $_('text.login'), url: 'login' };
  $: formValid = selected !== void0;
  $: canSend = selected === 'message' ? formValid && message.length >= 5 : formValid;
  $: (({ _name, _email }) => {
    name = $session.user?.name || _name;
    email = $session.user?.email || _email;
  })({ _name: name, _email: email });
  $: subject = options.find((option) => option.key === selected)?.subject;

  /**
   * on the backend the following will be considered:
   * w/ token => sender is of type admin
   * w/o token => sender is of type user
   */
  $: token = hasPrivileges && $session.user?.jwt;

  onMount(() => void 0);

  const sendMail = () => {
    return ({ result }: { result: ActionResult }) => {
      let message;
      if (result.type === 'success') {
        const success = result.data?.success;
        if (success) {
          message = $_('text.thank-you-for-your-message');
          reset();
        } else {
          message = $_('text.message-sent-failed');
        }
      } else {
        message = $_('text.message-sent-failed');
      }
      showSnackbar(message);
    };
  };

  function reset() {
    selected = null;
    message = '';
    name = '';
    email = '';
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | Home</title>
</svelte:head>

<Layout>
  <Canvas class='bg-canvas'>
    <TerrainScene />
  </Canvas>
  <Canvas class='fg-canvas'>
    <FilmgrainScene />
  </Canvas>
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
        method="POST"
        action="/?/send"
        class="user-info-form flex-col justify-between"
        use:enhance={sendMail}
      >
        {#if selected}
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="token" value={token} />
          {#if !!$session.user}
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="email" value={email} />
          {/if}
          <div class="user-info-controls">
            {#if selected === 'message'}
              <Textfield
                class="message"
                textarea
                bind:value={message}
                style="width:100%;"
                input$name="message"
              />
            {/if}
            <div class="flex justify-between" style="width: 100%;">
              <Textfield
                bind:value={name}
                disabled={!!$session.user}
                label=""
                style="flex: 0.49"
                input$name="name"
              >
                <span slot="label">
                  <Icon
                    class="material-icons"
                    style="font-size: 1em; line-height: normal; vertical-align: middle;"
                    >person</Icon
                  >
                  {$_('text.name')}
                </span>
              </Textfield>
              <Textfield
                bind:value={email}
                bind:invalid={invalidEmail}
                input$name="email"
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
