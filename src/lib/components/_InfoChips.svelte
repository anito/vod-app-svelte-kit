<script lang="ts">
  import './_chip.scss';
  import { emit } from '$lib/utils';
  import { infos } from '$lib/stores';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import { _ } from 'svelte-i18n';

  export let selectionUserId = '';
  export { className as class };
  export let staggered = false;

  const defaultIcon = 'circle_notifications';

  let className = '';

  $: chips = $infos.get(selectionUserId)?.issues || [];
  $: promise = Promise.resolve(chips);

  function getIcon(flag: string) {
    let icon;
    switch (flag) {
      case 'info':
        icon = 'info';
        break;
      case 'warning':
        icon = 'error';
        break;
      default:
        icon = defaultIcon;
    }
    return icon;
  }
</script>

{#await promise then chips}
  {#if chips.length}
    <div class:staggered>
      <Set class="info {className}" {chips} let:chip>
        <Chip
          color="primary"
          {chip}
          class={chip.flag}
          on:click={() => emit(chip.eventType, { ...chip, userId: selectionUserId })}
        >
          <LeadingIcon class="material-icons">{getIcon(chip.flag)}</LeadingIcon>
          <Text>{$_(chip.label)}</Text>
        </Chip>
      </Set>
    </div>
  {:else}
    <div class="empty">
      <div class="">{$_('text.no-messages')}</div>
    </div>
  {/if}
{/await}

<style>
  .staggered :global(.mdc-chip-set > #account-inaccessible) {
    padding-right: 30px;
  }
  .staggered :global(.mdc-chip-set > #account-inaccessible ~ .mdc-chip) {
    margin-left: -30px;
  }
  .staggered :global(.mdc-chip-set > #account-inaccessible ~ .mdc-chip:not(:last-child)) {
    padding-right: 30px;
  }
  .staggered :global(.mdc-chip-set > #account-inaccessible ~ .mdc-chip) {
    box-shadow: 0 0 1px rgb(0 0 0 / 68%);
  }
</style>
