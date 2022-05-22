<script>
	// @ts-nocheck

	import { Header } from '$lib/components';
	import { Table } from '$lib/components';
	import { sitename } from '$lib/stores';
</script>

<svelte:head>
	<title>{$sitename} | About</title>
</svelte:head>

<Header h="4" mdc class="m-2 lg:m-5">About this site</Header>
<div class="grid">
	<div class="cols-3">
		<Table />
	</div>
</div>
