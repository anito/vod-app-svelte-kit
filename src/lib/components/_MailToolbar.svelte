<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { inboxes } from '$lib/stores';
  import { Group } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { ASC, INBOX } from '$lib/utils';
  import type { Mail } from '$lib/types';

  export let selection: Mail | null | undefined = null;
  export let type: string | null;
  export let sort: string;
  export let loading = false;

  const dispatch = createEventDispatcher();
  const {getActiveMailStore}: any = getContext('mail-store');
  const currentStore = getActiveMailStore();


  $: mailStore = $currentStore;
  $: mail = $mailStore?.find((item: Mail) => item.id === selection?.id)
</script>

<div class="toolbar flex justify-between">
  <Group variant="outlined">
    <IconButton
      class="material-icons {loading ? 'animate-spin' : ''}"
      on:click={() => dispatch('mail:reload', { selection })}
      color="primary"
    >
      sync
    </IconButton>
    <IconButton class="material-icons transition-all {sort === ASC ? 'rotate-180' : ''}" on:click={() => dispatch('mail:sort')} disabled={!type}>
      sort
    </IconButton>
  </Group>
  <Group variant="outlined">
    {#if type === INBOX}
      <IconButton
        class="material-icons"
        on:click={() => dispatch('mail:toggleRead', { id: selection?.id })}
        color="primary"
        disabled={!selection}
        >{mail?._read ? 'mark_email_unread' : 'mark_email_read'}
      </IconButton>
    {/if}
    <IconButton
      class="material-icons"
      on:click={() => dispatch('mail:delete', { id: selection?.id })}
      color="primary"
      disabled={!selection}
      >delete
    </IconButton>
  </Group>
</div>

<style></style>
