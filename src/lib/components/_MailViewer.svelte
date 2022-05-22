<script>
  import { _, locale } from 'svelte-i18n';

  export let selected;

  let iframe;

  $: message = ((sel) => (sel && sel.message) || false)(selected);
  $: message && setTimeout(() => renderMail(message), 100);

  function renderMail(message = '') {
    if (iframe) {
      iframe.contentDocument.open();
      iframe.contentDocument.write(message);
      iframe.contentDocument.close();
    }
  }
</script>

{#if message}
  <iframe title="Sent Mail" class="" style="width:100%; height: 100%;" bind:this={iframe} />
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
