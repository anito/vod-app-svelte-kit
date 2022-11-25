<script>
  import { tick } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;

  const fadeoutDuration = 100;

  /** @type {HTMLIFrameElement} */
  let iframe;
  /** @type {string | undefined} */
  let message;

  $: (async (sel) => {
    message = undefined;
    if (sel) {
      setTimeout(() => (message = sel.message), fadeoutDuration);
    }
  })(selection);
  $: iframe && message && renderMail(message);

  /**
   *
   * @param {string} message
   */
  function renderMail(message) {
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(message);
    iframe.contentDocument?.close();
  }
</script>

{#if message}
  <iframe
    in:fade={{ duration: 300 }}
    title="Sent Mail"
    style="width:100%; height: 100%;"
    bind:this={iframe}
  />
{:else}
  <div class="empty-selection">
    <span style="text-align: center;">{$_('text.empty-email-selection')}</span>
  </div>
{/if}

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
