<script lang="ts">
  import { fade } from 'svelte/transition';
  import { FlexContainer } from '.';
  import { _ } from 'svelte-i18n';
  import type { Mail } from '$lib/types';

  export let selection: Mail | null;

  let message: string;
  let wait: Promise<any>;

  $: wait = ((_: string | undefined) =>
    new Promise((resolve) => selection && resolve(JSON.parse(selection.message).message)).then(
      (res) => (message = res as string)
    ) as Promise<any>)(selection?.id);

  function renderMail(iframe: HTMLIFrameElement) {
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(message);
    iframe.contentDocument?.close();
  }
</script>

{#await wait}
  <FlexContainer>
    {$_('text.empty-email-selection')}
  </FlexContainer>
{:then}
  <div in:fade={{ delay: 100, duration: 400 }} style="height: 100%;">
    <iframe title="Sent Mail" style="width:100%; height: 100%;" use:renderMail/>
  </div>
{/await}

<style>
</style>
