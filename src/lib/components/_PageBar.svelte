<script>
  // @ts-nocheck

  import Breadcrumb from './_Breadcrumb.svelte';
  import SessionTicker from './_SessionTicker.svelte';
  import { proxyEvent } from '$lib/utils';
</script>

<div class="pagebar">
  <div class="breadcrumb-container m-auto ml-0">
    <Breadcrumb simple />
  </div>
  <div class="ticker-container m-auto mr-0">
    <SessionTicker
      class="light"
      warningOnly
      forceOnExtend="2"
      on:MDCChip:interaction={() => proxyEvent('session:extend')}
    />
  </div>
</div>

<style>
  .pagebar {
    display: flex;
    justify-content: space-between;
    flex: 1 1 auto;
    color: var(--text-grey);
    background: var(--background);
    height: var(--page-bar);
  }
</style>
