<script>
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;

  /** @type {HTMLIFrameElement} */
  let iframe;

  $: message = selection?.message;
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

  /** @param{string} m */
  const promise = (m) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(m), 50);
    });
</script>

{#if message}
  {#await promise(message) then}
    <iframe
      in:fade={{ delay: 200, duration: 300 }}
      out:fade={{ duration: 100 }}
      title="Sent Mail"
      style="width:100%; height: 100%;"
      bind:this={iframe}
    />
  {/await}
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
