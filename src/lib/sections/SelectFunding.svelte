<script lang="ts">
	import Button from '$lib/common/Button.svelte';
	import { events, exit } from '$lib/store';

	const addSafe = () => {
		$events = [
			...$events,
			{
				type: 'safe',
				amount: 100_000,
				discount: 0,
				mfn: true,
				name: 'Safe 1',
				proRata: true,
				valCap: 1_000_000
			}
		];
	};

	const addPriced = () => {
		$events = [
			...$events,
			{
				type: 'priced',
				amount: 1_000_000,
				name: 'Series A',
				proRata: true,
				valuation: 10_000_000,
				options: 10
			}
		];
	};
</script>

<div class="rounded-xl bg-white border-[3px] border-borderLight">
	<div class="p-4 text-center border-b-2 border-borderLight text-primaryOrange">Add funding</div>

	<div class="flex gap-6 p-10 pb-4 pt-8">
		<Button class="w-[130px] h-[80px]" onclick={addSafe}>SAFE</Button>
		<Button class="w-[130px] h-[80px] text-center" onclick={addPriced}>Priced<br />round</Button>
	</div>
	<div class="h-[1px] bg-borderDark translate-y-[23px]" />
	<div class="bg-white p-3 mx-auto relative w-fit text-sm text-textLight mb-2">Quick add</div>
	<div class="flex justify-center mb-6">
		<img
			class="rounded-lg cursor-pointer [box-shadow:0_2px_#c94709] active:translate-y-[2px] active:shadow-none"
			src="/yc.png"
			alt="YC"
		/>
	</div>
</div>
<div class="my-3 text-textLight">or</div>
<Button class="w-[100px]">Exit</Button>
