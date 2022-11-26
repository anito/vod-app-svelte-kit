<script>
  import { tick } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;

  /** @type {string} */
  let message;

  $: wait = showMessage(selection);

  /**
   * @param {import("$lib/types").Mail<Record<string, any>> | null | undefined} sel
   */
  function showMessage(sel) {
    return new Promise((resolve) => resolve(sel?.message)).then((res) => (message = res));
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
    <div class="empty-selection">
      <span style="text-align: center;">{$_('text.empty-email-selection')}</span>
    </div>
  {/if}
{/await}

<style>
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
</style>
