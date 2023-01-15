<script lang="ts">
  import { writable } from 'svelte/store';

  export let storeData: any;
  export let store: any = writable();

  store.subscribe((data: any) => {
    storeData = data;
  });
</script>

<div class="wait">
  <h5 class="inner">{(!isNaN(storeData.percent) && storeData.percent) || '0'}<small>%</small></h5>
</div>

<style lang="scss">
  .wait {
    display: flex;
    justify-content: center;
    flex: 1 0 auto;
    height: 100%;
    font-size: 7em;
    text-shadow: 3px 10px 35px rgba(0, 0, 0, 0.5);
    small {
      font-size: 1.5rem;
    }
  }
  .wait .inner {
    display: flex;
    align-items: center;
  }
</style>
