<script lang="ts">
    import type { WeekMeta } from '../types';
	import Day from './Day.svelte';

	export let monthIndicator: boolean;
	export let week: WeekMeta;
	export let weekGuides: boolean;
	export let weekNumbers: boolean;

	$: weeksFromToday = week.weeksFromToday > 0 ? `+${week.weeksFromToday}` : week.weeksFromToday;
</script>

<div class="row" role="row">
	{#if weekGuides}
		<small
			aria-label={`${week.weeksFromToday} weeks from today`}
			class="cell muted"
			title={`${week.weeksFromToday} weeks from today`}
		>
			{weeksFromToday}
		</small>
	{/if}
	{#each week.daysInWeek as day (day.date.toString())}
		<Day {day} {monthIndicator} on:apply on:cancel on:hover on:selection />
	{/each}
	{#if weekNumbers}
		<small
			aria-label={`Week ${week.weekNumber}`}
			class="cell muted"
			title={`Week ${week.weekNumber}`}
		>
			{week.weekNumber}
		</small>
	{/if}
</div>
