<script lang="ts">
  import { fade } from 'svelte/transition';
  import { FlexContainer } from '.';
  import { _ } from 'svelte-i18n';
  import type { Mail } from '$lib/types';

  export let selection: Mail | null | undefined;

  let message: string;
  let wait: Promise<any>;

  $: id = selection?.id; // don't rerender on read/unread
  $: wait = showMessage(id); // parameter id only used for reactivity

  function showMessage(id: string | undefined) {
    return new Promise((resolve) => resolve(selection?.message)).then((res) => (message = res as string));
  }

  function renderMail(iframe: HTMLIFrameElement) {
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
