<script lang="ts">
	import { cn, formatAmount, launchConfetti } from '$lib';
	import Button from '$lib/common/Button.svelte';
	import Input from '$lib/common/Input.svelte';
	import { events, exit } from '$lib/store';
	import type { PricedRound } from '$lib/types';
	import { onMount } from 'svelte';

	let amount = 0;
	$: pricedRounds = $events.filter((e) => e.type === 'priced') as PricedRound[];
	$: lastPricedRound = pricedRounds[pricedRounds.length - 1];

	onMount(() => {
		amount = lastPricedRound.valuation * 2;
	});
</script>

<div class="rounded-xl bg-white border-[3px] border-borderLight">
	<div class="p-3 text-center border-b-2 border-borderLight text-lg text-primaryOrange">Exit</div>
	<div class="px-10 pt-7 pb-8 flex flex-col items-center">
		<div class="text-sm mb-3">Sell the startup for ...</div>
		<Input
			autofocus
			value={amount}
			onchange={(val) => {
				amount = parseInt(val);
			}}
			preventEmpty
			width="200"
			onkeypress={(e, val) => {
				if (e.key === 'Enter') {
					$exit && parseInt(val) >= lastPricedRound.valuation && ($exit.amount = parseInt(val));
					e.currentTarget.blur();
				}
			}}
		/>
		<Button
			onclick={() => {
				$exit && amount >= lastPricedRound.valuation && ($exit.amount = amount);
				launchConfetti();
			}}
			class={cn(
				'mt-7 bg-primaryOrange text-white border-none rounded-lg py-2 px-3 primary-button',
				amount < lastPricedRound.valuation && 'opacity-50 pointer-events-none'
			)}>Sell it!</Button
		>
		{#if amount < lastPricedRound.valuation}
			<div class="text-[11px] text-red-500 mt-3 -mb-3 text-center w-[190px]">
				Sale price must be higher than last valuation ({formatAmount(lastPricedRound.valuation)}).
				<br />Down rounds not supported (yet).
			</div>
		{/if}
	</div>
</div>
