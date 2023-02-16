<script lang="ts">
	import { getDaysOfWeek, localeFormat } from '../utils';

	export let firstDayOfWeek: string;
	export let weekGuides: boolean;
	export let weekNumbers: boolean;

	$: daysOfWeek = getDaysOfWeek(firstDayOfWeek);
</script>

<div class="row" role="row">
	{#if weekGuides}
		<div class="cell" />
	{/if}
	{#each daysOfWeek as dayOfWeek}
		<small
			aria-label={localeFormat(dayOfWeek, 'EEEE')}
			class="days-of-week cell muted"
			role="gridcell"
		>
			{localeFormat(dayOfWeek, 'eeeeee')}
		</small>
	{/each}
	{#if weekNumbers}
		<div class="cell" />
	{/if}
</div>
