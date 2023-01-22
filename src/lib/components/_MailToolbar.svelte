<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Group } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import type { Mail } from '$lib/types';

  export let selection: Mail | null | undefined = null;
  export let type: string | null;
  export let sort: string;

  const dispatch = createEventDispatcher();
</script>

<div class="toolbar flex justify-between">
  <Group variant="outlined">
    <IconButton
      class="material-icons"
      on:click={() => dispatch('mail:reload', { selection })}
      color="primary"
    >
      sync
    </IconButton>
    <IconButton class="material-icons" on:click={() => dispatch('mail:sort')} disabled={!type}>
      {sort === 'DESC' ? 'sort' : sort === 'ASC' ? 'sort' : 'sort'}
    </IconButton>
  </Group>
  <Group variant="outlined">
    <IconButton
      class="material-icons"
      on:click={() => dispatch('mail:toggleRead', { selection })}
      color="primary"
      disabled={!selection || type === 'sents'}
      >{type === 'sents'
        ? 'mail'
        : type === 'inboxes'
        ? selection?._read
          ? 'mark_email_unread'
          : 'mark_email_read'
        : ''}
    </IconButton>
    <IconButton
      class="material-icons"
      on:click={() => dispatch('mail:delete', { selection })}
      color="primary"
      disabled={!selection}
      >delete
    </IconButton>
  </Group>
</div>

<style></style>
