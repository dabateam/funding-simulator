<script lang="ts">
	import { formatAmount } from '$lib';
	import Input from '$lib/common/Input.svelte';
	import { exit, finalYouShares } from '$lib/store';
</script>

<div class="flex flex-col items-center group bg-bg">
	<div class="pt-10 pb-0 rounded-3xl border-[4px] border-borderLight overflow-hidden">
		<div class="px-16 flex flex-col items-center">
			<div class="text-2xl text-primaryOrange relative">Congratulations!</div>
			<div class="mt-8 mb-2 text-sm">You just sold your startup for</div>
			<Input
				value={$exit?.amount}
				onchange={(val) => {
					$exit && ($exit.amount = parseFloat(val));
				}}
				width="220"
				white
			/>
			<div class=" my-10 border-2 border-borderDark p-3 px-5 rounded-xl">
				You kept <span class="text-primaryOrange">{parseFloat($finalYouShares.toFixed(1))}%</span> equity
				in your company after the sale.
			</div>
			<div class="text-sm">Long term capital gains tax</div>
			<Input
				value={$exit?.tax}
				onchange={(val) => {
					$exit && ($exit.tax = parseFloat(val));
				}}
				class="my-3"
				width="100"
				type="percent"
				white
			/>
			<div class="text-xs text-textLight">Additional taxes might apply.</div>
		</div>
		<div class=" text-center border-t-[3px] border-borderLight text-2xl mt-10 bg-white p-6 flex-1">
			<div class="text-sm mb-2 text-textLight">After all investors get paid ...</div>
			You go home with&nbsp;<span class="text-primaryOrange"
				>{formatAmount((($exit?.amount || 0) * $finalYouShares) / 100)}</span
			>
		</div>
	</div>
	<button
		on:click={() => {
			$exit = null;
		}}
		class="p-2 px-3 rounded-lg hover:bg-borderLight mt-2 active:bg-borderDark text-textLight text-sm opacity-0 group-hover:opacity-100"
	>
		Cancel exit
	</button>
</div>
