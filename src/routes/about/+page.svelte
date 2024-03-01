<script lang="ts">
  import { page } from '$app/stores';
  import { Heading } from '$lib/components';
  import { Table } from '$lib/components';
  import { _ } from 'svelte-i18n';
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | About</title>
</svelte:head>

<Heading h="4" mdc class="m-2 lg:m-5">{$_('text.about-header')}</Heading>
<div class="grid">
  <div class="cols-3">
    <Table />
  </div>
</div>
