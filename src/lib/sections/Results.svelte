<script lang="ts">
	import { cn, formatAmount } from '$lib';
	import Input from '$lib/common/Input.svelte';
	import { exit, finalYouShares, tables } from '$lib/store';
	import FloatingTable from './FloatingTable.svelte';
</script>

<div class="relative flex flex-col items-center group bg-bg">
	<div
		class="pt-10 pb-0 rounded-3xl border-[4px] border-borderLight overflow-hidden max-sm:w-[340px]"
	>
		<div class="px-16 flex flex-col items-center">
			<div class="text-2xl text-textLight relative">Congratulations!</div>
			<div class="mt-8 mb-2 text-sm">You just sold your startup for</div>
			<Input
				value={$exit?.amount}
				onchange={(val) => {
					$exit && ($exit.amount = parseFloat(val));
				}}
				width="220"
				white
			/>
			<div class=" mt-10 max-sm:text-center">
				You kept <span
					class="inline-block rounded-lg p-1 px-1.5 mx-1 border-[2px] border-borderDark [box-shadow:0px_1px_theme(colors.borderDark)]"
					>{parseFloat($finalYouShares.toFixed(1))}%</span
				> equity in your company after the sale.
			</div>
		</div>
		<div class=" text-center border-t-[3px] border-borderLight text-2xl mt-10 bg-white p-6 flex-1">
			<div class="text-sm mb-2 text-textLight">After all investors get paid,</div>
			You get&nbsp;<span class="text-primaryOrange"
				>{formatAmount((($exit?.amount || 0) * $finalYouShares) / 100)}</span
			>
			<div class="text-sm mt-2 text-textLight">before taxes.</div>
		</div>
	</div>
	<button
		on:click={() => {
			$exit = null;
		}}
		class="p-2 px-3 rounded-lg hover:bg-borderLight mt-2 active:bg-borderDark text-textLight text-sm opacity-0 group-hover:opacity-100 max-sm:!opacity-100"
	>
		Cancel exit
	</button>
	<div
		class={cn(
			'max-sm:static max-sm:mt-10 max-sm:translate-x-0 max-sm:translate-y-0 absolute -right-[20px] top-[50%] -translate-y-[50%] translate-x-[100%]'
		)}
	>
		<FloatingTable position={$tables.length - 2} />
	</div>
</div>
