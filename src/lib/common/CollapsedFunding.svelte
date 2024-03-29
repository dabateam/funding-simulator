<script lang="ts">
	import { box_reverse, cn, formatAmount } from '$lib';
	import { events, tables } from '$lib/store';

	import type { PricedRound, Safe } from '$lib/types';

	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import { getSafesValuations, getSafesWithMFN, getTableTotalShares } from '$lib/calculations';

	$: pricedRounds = $events.filter((e) => e.type === 'priced') as PricedRound[];
	$: firstPricedRound = pricedRounds[0] || null;

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
		$events = $events.map((e) => {
			if (e.type !== 'priced') return e;
			let participations = [...e.participations];
			participations = participations.filter((p) => p !== data.name);
			return {
				...e,
				participations
			};
		});
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

			const proRatas = data.participations.filter((i) =>
				($events.filter((e) => e.type !== 'options' && e.proRata) as (PricedRound | Safe)[])
					.map((e) => e.name)
					.includes(i)
			);

			proRatas.length > 0 &&
				(proRatas.length === 1
					? included.push(proRatas[0] + ' pro-rata')
					: included.push(proRatas.length + ' prev. investors'));
		}
		if (included.length === 1) {
			return `(including ${included[0]})`;
		} else if (included.length === 2) {
			return `(incl. ${included[0]} & ${included[1]})`;
		} else if (included.length === 3) {
			return `(incl. ${included[0]}, ${included[1]} & ${included[2]})`;
		}
		return '';
	};

	$: getSafeLabel = () => {
		if (data.type !== 'safe') return '';
		let res = '';

		if (data.discount && !data.valCap) {
			res += 'Discount';
		} else if (!data.discount && data.valCap) {
			res += 'Valuation cap';
		} else if (!data.discount && !data.valCap) {
			res += 'Uncapped';
		} else if (data.discount && data.valCap) {
			res += 'Valuation cap & discount';
		}
		if (data.mfn) {
			res += ' (MFN)';
		}
		return res;
	};

	$: effectiveValuation = firstPricedRound
		? getSafesWithMFN(getSafesValuations(firstPricedRound)).find((el) => el.name === data.name)
				?.valuation || null
		: null;
</script>

<div
	transition:box_reverse
	class="transition-none duration-0 flex flex-col align-center justify-center group px-11 max-sm:px-0"
>
	<div class="max-sm:flex max-sm:justify-between max-sm:items-center max-sm:mb-1 max-sm:-mt-8">
		<div class="pl-2 max-sm:block hidden">
			{data.name}
		</div>
		<div
			class={cn(
				'max-sm:pr-2 text-center text-xs text-textLight my-2',
				sameNameError && 'text-red-500'
			)}
		>
			{sameNameError
				? 'Error: Duplicate name'
				: data.type === 'priced'
					? 'Priced round'
					: 'Safe - ' + getSafeLabel()}
		</div>
	</div>
	<div
		on:click
		class={cn(
			'cursor-pointer hover:border-borderDark active:border-borderDarkHover p-[10px] pr-5 text-sm flex gap-5 border-2 rounded-xl border-borderLight bg-white leading-[1.2] max-sm:w-[350px] max-sm:justify-between max-sm:p-5 max-sm:py-3',
			sameNameError && 'border-red-200 hover:border-red-300 active:border-red-300'
		)}
	>
		<div class={cn('px-3 py-2 rounded-lg bg-bg max-sm:hidden')}>
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
			Diluted by {getDilutedBy()}% <span class="max-sm:hidden">{getIncludingMessage()}</span>
		{:else if effectiveValuation}
			Effective valuation: {formatAmount(effectiveValuation)}
		{/if}
	</div>
	<button
		class=" max-sm:opacity-70 block right-[0] text-textLight top-[40px] hover:bg-borderLight group-hover:opacity-100 opacity-0 active:bg-borderDark rounded-lg p-2.5 absolute max-sm:right-[50%] max-sm:translate-x-[50%] max-sm:top-[90px] max-sm:scale-90"
		on:click={deleteEvent}><DeleteIcon /></button
	>
</div>
