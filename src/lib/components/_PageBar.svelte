<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Breadcrumb from './_Breadcrumb.svelte';
  import SessionTicker from './_SessionTicker.svelte';
</script>

<div class="pagebar">
  <div class="breadcrumb-container m-auto ml-0">
    <Breadcrumb simple />
  </div>
  <div class="ticker-container m-auto mr-0">
    <SessionTicker
      signalOnly
      leadTime={1}
      signalType="primary"
      on:MDCChip:interaction={() => invalidate('app:session')}
    />
  </div>
</div>

<style>
  .pagebar {
    display: flex;
    justify-content: space-between;
    flex: 1 1 auto;
    color: var(--text-grey);
    background: var(--background-100);
    height: var(--page-bar);
  }
</style>
