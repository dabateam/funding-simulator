<script lang="ts">
	import { cn } from '$lib';
	import { getTableTotalShares } from '$lib/calculations';
	import { tables } from '$lib/store';

	export let position: number;

	$: table = $tables[position + 1];

	$: getEquity = (shares: number) => {
		const total = getTableTotalShares(table);
		return ((shares / total) * 100).toFixed(1);
	};
</script>

<div class="flex flex-col items-center z-[1] w-max bg-bg">
	<div class="flex flex-col text-sm rounded-lg border-[3px] gap-1 p-3 border-borderLight">
		{#each Object.keys(table) as owner}
			<div class="flex text-xs gap-6 justify-between border-borderLight last:border-none">
				<div class={cn('shrink-0', owner === 'You' ? 'text-primaryOrange' : 'text-textDark')}>
					{owner}
				</div>
				<div class={cn(owner === 'You' ? 'text-primaryOrange' : 'text-textDark')}>
					{getEquity(table[owner])}%
				</div>
			</div>
		{/each}
	</div>
</div>
