<script lang="ts">
	import { launchConfetti } from '$lib';
	import Button from '$lib/common/Button.svelte';
	import Input from '$lib/common/Input.svelte';
	import { events, exit } from '$lib/store';
	import type { PricedRound } from '$lib/types';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let amount = 0;
	onMount(() => {
		const _events = get(events);
		const lastPricedRound = _events.filter((e) => e.type === 'priced') as PricedRound[];
		amount = lastPricedRound[lastPricedRound.length - 1].valuation * 2;
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
			width="200"
			onkeypress={(e) => {
				if (e.key === 'Enter') {
					$exit && ($exit.amount = amount);
				}
			}}
		/>
		<Button
			onclick={() => {
				$exit && ($exit.amount = amount);
				launchConfetti();
			}}
			class="mt-7 bg-primaryOrange text-white border-none rounded-lg py-2 px-3 primary-button"
			>Sell it!</Button
		>
	</div>
</div>
