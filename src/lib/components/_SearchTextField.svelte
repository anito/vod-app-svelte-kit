<script lang="ts">
  import './_textfield-search.scss';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';

  export let search = '';
  export let label = 'Search';
  export let infoLabel = 'Type to search';
  export { className as class };
  export let style = '';

  let className = '';
</script>

<Textfield class="textfield-search {className}" bind:value={search} {label} {style}>
  <Icon
    role="button"
    class="material-icons cancel-search"
    slot="trailingIcon"
    on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
  >
  {#if infoLabel}
    <span class="info-label">{infoLabel}</span>
  {/if}
</Textfield>
