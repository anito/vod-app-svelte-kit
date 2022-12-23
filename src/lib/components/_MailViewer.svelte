<script>
  import { fade } from 'svelte/transition';
  import { FlexContainer } from '.';
  import { _ } from 'svelte-i18n';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;

  /**
   * @type {string}
   */
  let message;
  /**
   * @type {Promise<any>}
   */
  let wait;

  $: id = selection?.id; // don't rerender on read/unread
  $: wait = showMessage(id); // parameter id only used for reactivity

  /**
   * @param {any} id
   */
  function showMessage(id) {
    return new Promise((resolve) => resolve(selection?.message)).then((res) => (message = res));
  }

  /**
   *
   * @param {HTMLIFrameElement} iframe
   */
  function renderMail(iframe) {
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(message);
    iframe.contentDocument?.close();
  }
</script>

{#await wait then}
  {#if message}
    <iframe
      in:fade={{ delay: 100, duration: 400 }}
      title="Sent Mail"
      style="width:100%; height: 100%;"
      use:renderMail
    />
  {:else}
    <FlexContainer>
      {$_('text.empty-email-selection')}
    </FlexContainer>
  {/if}
{/await}

<style>
</style>
