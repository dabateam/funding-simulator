<script lang="ts">
	import { box_reverse, cn, formatAmount } from '$lib';
	import { events, tables } from '$lib/store';

	import type { PricedRound, Safe } from '$lib/types';

	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import { getTableTotalShares } from '$lib/calculations';

	export let data: PricedRound | Safe;
	export let index: number;
	const getOtherString = (data: PricedRound | Safe) => {
		if (data.type === 'safe') {
			if (data.mfn && !data.proRata) {
				return 'MFN';
			} else if (data.proRata && !data.mfn) {
				return 'Pro-rata';
			} else if (data.proRata && data.mfn) {
				return 'MFN, Pro-rata';
			}
		} else {
			if (data.proRata) {
				return 'Pro-rata';
			}
		}
		return '-';
	};

	$: sameNameError =
		$events.filter((e) => {
			if (e.type === 'options') return false;
			return e.name === data.name;
		}).length > 1;

	const deleteEvent = () => {
		$events = $events.filter((_, i) => i !== index);
	};

	$: includingSafes =
		(($events.filter((e) => e.type === 'priced') as PricedRound[])[0] || null)?.name ===
			data.name && $events.filter((e) => e.type === 'safe').length > 0;

	$: getDilutedBy = () => {
		const totalDilution =
			((getTableTotalShares($tables[index + 1]) - getTableTotalShares($tables[index])) /
				getTableTotalShares($tables[index + 1])) *
			100;
		return totalDilution.toFixed(0);
	};

	$: getIncludingMessage = (): string => {
		let included: string[] = [];
		if (data.type === 'priced') {
			includingSafes && included.push('Safes');
			data.options && included.push('options');
			data.participations.length > 0 && included.push('previous investors');
		}
		if (included.length === 1) {
			return `(including ${included[0]})`;
		} else if (included.length === 2) {
			return `(including ${included[0]} & ${included[1]})`;
		} else if (included.length === 3) {
			return `(including ${included[0]}, ${included[1]} & ${included[2]})`;
		}
		return '';
	};
</script>

<div
	transition:box_reverse
	class=" transition-none duration-0 flex flex-col align-center justify-center group px-11"
>
	<div class={cn('text-center text-xs text-textLight my-2', sameNameError && 'text-red-500')}>
		{sameNameError ? 'Error: Duplicate name' : data.type === 'priced' ? 'Priced round' : 'Safe'}
	</div>
	<div
		on:click
		class={cn(
			'cursor-pointer hover:border-borderDark active:border-borderDarkHover p-[10px] pr-5 text-sm flex gap-5 border-2 rounded-xl border-borderLight bg-white leading-[1.2]',
			sameNameError && 'border-red-200 hover:border-red-300 active:border-red-300'
		)}
	>
		<div class={cn('px-3 py-2 rounded-lg bg-bg')}>
			{data.name}
		</div>
		<div class="flex flex-col justify-between">
			<div class="text-[11px] text-textLight">Raised</div>
			<div class="text-primaryOrange">{formatAmount(data.amount)}</div>
		</div>
		{#if data.type === 'safe'}
			<div class="flex flex-col justify-between">
				<div class="text-[11px] text-textLight">ValCap</div>
				<div class="">{data.valCap ? formatAmount(data.valCap) : '-'}</div>
			</div>
		{/if}
		{#if data.type === 'priced' && data.valuation}
			<div class="flex flex-col justify-between">
				<div class="text-[11px] text-textLight">Val (post)</div>
				<div class="">{formatAmount(data.valuation)}</div>
			</div>
		{/if}

		{#if data.type === 'safe'}
			<div class="flex flex-col justify-between">
				<div class="text-[11px] text-textLight">Disc.</div>
				<div class="">{data.discount ? data.discount + '%' : '-'}</div>
			</div>
		{/if}
		{#if data.type === 'priced' && data.options}
			<div class="flex flex-col justify-between">
				<div class="text-[11px] text-textLight">Options</div>
				<div class="">{data.options}%</div>
			</div>
		{/if}
		<div class="flex flex-col justify-between">
			<div class="text-[11px] text-textLight">Other</div>
			<div class="">{getOtherString(data)}</div>
		</div>
	</div>
	<div class="text-xs p-3 text-center w-fit mx-auto text-textLight bg-bg">
		{#if data.type !== 'safe'}
			Diluted by {getDilutedBy()}% {getIncludingMessage()}
		{/if}
	</div>
	<button
		class="right-[0] text-textLight top-[40px] hover:bg-borderLight group-hover:opacity-100 opacity-0 active:bg-borderDark rounded-lg p-2.5 absolute"
		on:click={deleteEvent}><DeleteIcon /></button
	>
</div>
