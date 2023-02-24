<script>
	// @ts-nocheck

	import { Heading } from '$lib/components';
	import { Table } from '$lib/components';
	import { sitename } from '$lib/stores';
</script>

<svelte:head>
	<title>{$page.data.config.Site?.name} | About</title>
</svelte:head>

<Heading h="4" mdc class="m-2 lg:m-5">About this site</Heading>
<div class="grid">
	<div class="cols-3">
		<Table />
	</div>
</div>
