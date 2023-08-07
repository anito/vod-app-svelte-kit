<script lang="ts">
  import Layout from './layout.svelte';
  import { Info, Legal } from '$lib/components';
  import { session } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { ADMIN, SUPERUSER } from '$lib/utils';
  import { getContext } from 'svelte';

  const { getSegment }: any = getContext('segment');
  const segment = getSegment();

  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
</script>

<Layout segment={$segment}>
  {#if hasPrivileges}
    <slot />
  {:else}
    <div class="paper-container">
      <div class="vcentered">
        <Info title="Unauthorized" let:href>
          <a {href} on:click|preventDefault={() => goto(href)}>Login</a>
        </Info>
      </div>
    </div>
  {/if}
  <div slot="ad">
    <div class="m-auto ml-0"><Legal /></div>
  </div>
  <div slot="footer" />
</Layout>

<style>
  .paper-container {
    display: flex;
    flex: 1;
    justify-content: center;
  }
  .vcentered {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
