<script lang="ts">
	import { box, cn } from '$lib';
	import Button from '$lib/common/Button.svelte';
	import Input from '$lib/common/Input.svelte';
	import { companyName, founders } from '$lib/store';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	$: addsUpTo100 =
		$founders.reduce((acc, founder) => {
			return acc + founder.equity;
		}, 0) >= 99.89 &&
		$founders.reduce((acc, founder) => {
			return acc + founder.equity;
		}, 0) <= 100;

	$: resetEquities = () => {
		const newEquity = parseFloat((100 / $founders.length).toFixed(1));
		$founders = $founders.map((f) => ({
			...f,
			equity: newEquity
		}));
	};

	$: fixNames = () => {
		$founders = $founders.map((f, fIndex) => ({
			...f,
			name: /^Founder \d+$/.test(f.name) ? 'Founder ' + (fIndex + 1) : f.name
		}));
	};

	$: addFounder = () => {
		// TODO: change name
		const name = 'Founder ' + ($founders.length + 1);
		$founders = [...$founders, { equity: 0, isYou: false, name, id: String(Math.random()) }];
		resetEquities();
		fixNames();
	};
</script>

<div class="flex flex-col items-center">
	<div class="pt-10 mb-20">
		<!-- svelte-ignore a11y-autofocus -->
		<input
			autofocus={window.innerWidth >= 640}
			value={$companyName}
			on:blur={(e) => {
				$companyName = e.currentTarget.value;
			}}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					e.currentTarget.blur();
				}
			}}
			class="w-[250px] text-primaryOrange focus:border-blue bg-transparent border-b-2 border-borderDark hover:border-borderDarkHover placeholder:text-textLight text-center py-3"
			placeholder="Unnamed startup"
		/>
	</div>
	<div class="flex flex-col items-center">
		<div class=" text-xl">Founders</div>
		<div class="text-textLight text-xl mb-10">and their equity</div>

		<div class="flex gap-4 flex-wrap justify-center" id="founders">
			{#each $founders as founder, fIndex (founder.id)}
				<div
					class="flex flex-col align-top h-[140px] !transition-none"
					in:box
					animate:flip={{ duration: 250, easing: quintOut }}
				>
					<input
						size="1"
						on:focus={(e) => {
							let target = e.currentTarget;
							setTimeout(() => target.select(), 50);
						}}
						on:mouseup={(e) => {
							e.preventDefault();
						}}
						class={cn(
							'__founder-name hover:bg-borderLight focus:bg-borderLight py-2 mb-2 rounded-lg bg-transparent flex min-w-0 text-center max-w-full',
							founder.isYou && 'pointer-events-none'
						)}
						value={founder.name}
						on:blur={(e) => {
							if (!e.currentTarget.value) {
								$founders[fIndex].name = 'Founder ' + (fIndex + 1);
							} else {
								$founders[fIndex].name = e.currentTarget.value;
							}
						}}
					/>
					<Input
						value={String(founder.equity)}
						onchange={(val) => {
							founder.equity = parseFloat(val);
						}}
						type="percent"
						white
						width="120"
					/>
					{#if !founder.isYou}
						<button
							on:click={() => {
								$founders = $founders.filter((_, index) => index !== fIndex);
								resetEquities();
								fixNames();
							}}
							class=" select-none text-xs text-textLight p-2 rounded-lg hover:bg-borderLight text-center mt-1 active:translate-y-[1px]"
						>
							Remove
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-6">
			<Button onclick={addFounder}>Add founder</Button>
		</div>
	</div>
	<div class="h-[30px] my-2 flex flex-col items-center gap-1 justify-end text-xs text-dangerLight">
		{#if !addsUpTo100}
			<div>Equity should add up to 100%.</div>
		{/if}
	</div>
</div>
