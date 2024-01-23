<script lang="ts">
	import { cn } from '$lib';
	import {
		AVAILABLE_OPTIONS_LABEL,
		EMPLOYEE_OPTIONS_LABEL,
		getTableTotalShares
	} from '$lib/calculations';
	import { founders, tables } from '$lib/store';
	import { get } from 'svelte/store';

	export let position: number;

	$: lastTable = $tables[position];

	$: table = $tables[position + 1];

	$: getEquity = (shares: number) => {
		const total = getTableTotalShares(table);
		return (shares / total) * 100;
	};

	$: getDiff = (shares: number, previousShares: number) => {
		const total = getTableTotalShares(table);
		const previousTotal = getTableTotalShares(lastTable);
		return (shares / total) * 100 - (previousShares / previousTotal) * 100;
	};

	$: lines = Object.keys(table).map((k) => ({
		label: k,
		equity: getEquity(table[k]),
		diff: getDiff(table[k], lastTable[k] || 0),
		type: get(founders)
			.map((f) => f.name)
			.includes(k)
			? 'founder'
			: [AVAILABLE_OPTIONS_LABEL, EMPLOYEE_OPTIONS_LABEL].includes(k)
				? 'options'
				: 'other'
	}));

	$: foundersLines = lines.filter((l) => l.type === 'founder');
	$: investorsLines = lines.filter((l) => l.type === 'other');
	$: optionsLines = lines.filter((l) => l.type === 'options');
</script>

<div class="flex flex-col items-center z-[1] w-max bg-bg pl-4 -ml-4">
	<div class="flex flex-col text-sm rounded-lg border-[3px] p-3 border-borderLight">
		{#each foundersLines as line}
			<div
				class="group/line hover:bg-borderLight p-0.5 px-2 -mx-2 flex text-xs gap-6 justify-between border-borderLight last:border-none"
			>
				<div
					class={cn(
						'shrink-0 min-w-[70px]',
						line.label === 'You' ? 'text-primaryOrange' : 'text-textDark'
					)}
				>
					{line.label}
				</div>
				<div class={cn(line.label === 'You' ? 'text-primaryOrange' : 'text-textDark')}>
					{line.equity.toFixed(1)}%
				</div>

				<div
					class={cn(
						'w-[45px] text-right text-red-600 opacity-40 group-hover/line:opacity-100',
						line.diff > 0 && 'text-green-600',
						(line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0') &&
							'text-textLight text-center'
					)}
				>
					{#if line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0'}
						—
					{:else}
						{line.diff > 0 ? '+' : ''}{line.diff.toFixed(1)}%
					{/if}
				</div>
			</div>
		{/each}
		{#if investorsLines.length}
			<div
				class="relative w-full flex-1 text-[10px] uppercase [letter-spacing:0.5px] text-textLight"
			>
				<div class="absolute h-[2px] bg-borderDark w-full top-[50%] left-0" />

				<div class="mx-auto w-fit relative z-[2] bg-bg p-1">Investors</div>
			</div>
		{/if}
		{#each investorsLines as line}
			<div
				class="group/line hover:bg-borderLight p-0.5 px-2 -mx-2 flex text-xs gap-6 justify-between border-borderLight last:border-none"
			>
				<div class="shrink-0 min-w-[70px] text-textDark">
					{line.label}
				</div>
				<div class="text-textDark">
					{line.equity.toFixed(1)}%
				</div>

				<div
					class={cn(
						'w-[45px] text-right text-red-600 opacity-40 group-hover/line:opacity-100',
						line.diff > 0 && 'text-green-600',
						(line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0') &&
							'text-textLight text-center'
					)}
				>
					{#if line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0'}
						—
					{:else}
						{line.diff > 0 ? '+' : ''}{line.diff.toFixed(1)}%
					{/if}
				</div>
			</div>
		{/each}
		{#if optionsLines.length}
			<div
				class="relative w-full flex-1 text-[10px] uppercase [letter-spacing:0.5px] text-textLight"
			>
				<div class="absolute h-[2px] bg-borderDark w-full top-[50%] left-0" />

				<div class="mx-auto w-fit relative z-[2] bg-bg p-1">Options</div>
			</div>
		{/if}
		{#each optionsLines as line}
			<div
				class="group/line hover:bg-borderLight p-0.5 px-2 -mx-2 flex text-xs gap-6 justify-between border-borderLight last:border-none"
			>
				<div class="shrink-0 min-w-[70px] text-textDark">
					{line.label}
				</div>
				<div class="text-textDark">
					{line.equity.toFixed(1)}%
				</div>

				<div
					class={cn(
						'w-[45px] text-right text-red-600 opacity-40 group-hover/line:opacity-100',
						line.diff > 0 && 'text-green-600',
						(line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0') &&
							'text-textLight text-center'
					)}
				>
					{#if line.diff.toFixed(1) === '0.0' || line.diff.toFixed(1) === '-0.0'}
						—
					{:else}
						{line.diff > 0 ? '+' : ''}{line.diff.toFixed(1)}%
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
