<script lang="ts">
	import { box, cn, selectContents } from '$lib';
	import Input from '$lib/common/Input.svelte';
	import Select from '$lib/common/Select.svelte';
	import type { PricedRound, Safe } from '$lib/types';

	import { onMount } from 'svelte';
	import CollapsedFunding from '$lib/common/CollapsedFunding.svelte';
	import { events } from '$lib/store';
	import FloatingTable from './FloatingTable.svelte';

	export let data: PricedRound | Safe;
	export let index: number;
	let show = false;

	$: previousInvestorsWithProRata = (
		$events.slice(0, index).filter((e) => e.type !== 'options' && e.proRata) as (
			| PricedRound
			| Safe
		)[]
	).map((i) => i.name);

	$: sameNameError =
		$events.filter((e) => {
			if (e.type === 'options') return false;
			return e.name === data.name;
		}).length > 1;

	onMount(() => {
		const handleClick = (e: MouseEvent) => {
			const box = document.getElementById('funding-box');
			if (box && !box?.contains(e.target as Node)) {
				show = false;
			}
		};

		document.addEventListener('click', handleClick, true);
		return () => document.removeEventListener('click', handleClick, true);
	});

	const getSafeType = (data: Safe) => {
		let res = '';
		if (data.valCap && data.discount) {
			res = 'Valuation cap & Discount';
		} else if (data.valCap && !data.discount) {
			res = 'Valuation cap';
		} else if (!data.valCap && data.discount) {
			res = 'Discount';
		} else {
			res = 'Uncapped';
		}

		if (data.mfn) {
			res += ' (with MFN)';
		}

		return res;
	};

	let postMoney = true;

	let showProRata = false;

	$: {
		if (!show) showProRata = false;
	}

	const handleProRataClick = (investor: string) => {
		if (data.type === 'priced') {
			if (data.participations.includes(investor)) {
				data.participations = data.participations.filter((i) => i !== investor);
			} else {
				data.participations = [...data.participations, investor];
			}
		}
	};
</script>

<div class="group relative flex flex-col items-center h-[120px] __event">
	<div
		class={cn(
			'absolute -right-[10px] top-[calc(50%_+_1.5px)] -translate-y-[50%] translate-x-[100%] group-hover:block hidden',
			show && 'hidden'
		)}
	>
		<FloatingTable position={index} />
	</div>
	{#if show}
		<div
			id="funding-box"
			out:box
			in:box={{ delay: 50 }}
			class="transition-none duration-0 origin-center absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[21] border border-white rounded-2xl funding-box"
		>
			<div
				class="absolute right-[0] top-[calc(50%_+_11px)] -translate-y-[50%] translate-x-[calc(100%_+_20px)]"
			>
				<FloatingTable position={index} />
			</div>
			<div class="bg-bg flex justify-between items-center h-[54px] px-8 gap-4 rounded-t-2xl">
				<input
					value={data.name}
					on:focus={(e) => {
						let target = e.currentTarget;
						setTimeout(() => target.select(), 50);
					}}
					on:mouseup={(e) => {
						e.preventDefault();
					}}
					on:blur={(e) => {
						if (!e.currentTarget.value) e.currentTarget.value = data.name;
						else data.name = e.currentTarget.value;
					}}
					class={cn(
						'bg-bg flex-1 block -ml-3 cursor-pointer with-focus-ring border border-transparent w-fit text-primaryOrange text-lg hover:bg-borderLight focus:bg-bg p-1 px-3 rounded-lg outline-none',
						sameNameError && 'border border-red-500'
					)}
				/>
				<div class="text-textLight text-sm">
					{data.type === 'priced' ? 'Priced round / Equity' : 'Post-money Safe'}
				</div>
			</div>

			<div class=" bg-white border-y-[3px] border-borderLight p-8 pb-6 py-8">
				<div class="flex gap-5">
					{#if data.type === 'priced'}
						<div>
							<div class="text-center mb-3">Amount</div>
							<Input
								value={data.amount}
								preventEmpty
								onchange={(value) => {
									data.amount = parseInt(value);
								}}
								width="187"
							/>
						</div>
						<div>
							<div class="text-center mb-3 flex items-center justify-between">
								<div>Valuation</div>
								<button
									on:click={() => {
										postMoney = !postMoney;
									}}
									class="text-xs p-1 px-2 -my-1 rounded-md bg-bg hover:bg-borderLight active:bg-borderDark"
								>
									{postMoney ? 'Post-money' : 'Pre-money'}
								</button>
							</div>
							<Input
								value={data.type === 'priced'
									? postMoney
										? data.valuation
										: data.valuation - data.amount
									: undefined}
								preventEmpty
								onchange={(value) => {
									if (data.type !== 'priced') return;
									if (postMoney) {
										data.valuation = parseInt(value);
									} else {
										data.valuation = parseInt(value) + data.amount;
									}
								}}
								width="187"
							/>
						</div>
						<div>
							<div class="text-center mb-3">Options</div>
							<Input
								width="90"
								type="percent"
								value={data.type === 'priced' ? data.options : undefined}
								onchange={(value) => {
									data.type === 'priced' && (data.options = parseInt(value));
								}}
							/>
						</div>
					{:else}
						<div>
							<div class="text-center mb-3">Amount</div>
							<Input
								width="187"
								preventEmpty
								value={data.type === 'safe' ? data.amount : undefined}
								onchange={(value) => {
									data.type === 'safe' && (data.amount = parseInt(value));
								}}
							/>
						</div>
						<div class="group/valcap">
							<div
								class={cn(
									'text-center mb-3',
									data.type === 'safe' && !data.valCap && 'text-textLight'
								)}
							>
								Valuation cap
							</div>
							<Input
								width="187"
								value={data.type === 'safe' ? data.valCap : undefined}
								onchange={(value) => {
									data.type === 'safe' && (data.valCap = parseInt(value));
								}}
								faded={data.type === 'safe' && !data.valCap}
							/>
						</div>
						<div>
							<div
								class={cn(
									'text-center mb-3',
									data.type === 'safe' && !data.discount && 'text-textLight'
								)}
							>
								Discount
							</div>
							<Input
								width="90"
								value={data.type === 'safe' ? data.discount : undefined}
								onchange={(value) => {
									data.type === 'safe' && (data.discount = parseInt(value));
								}}
								type="percent"
								faded={data.type === 'safe' && !data.discount}
							/>
						</div>
					{/if}
				</div>
				<div class="flex justify-center">
					{#if data.type === 'safe'}
						<Select bind:checked={data.mfn} class="mt-5" label="MFN provision" />
					{/if}
					<Select bind:checked={data.proRata} class="mt-5" label="Pro-rata rights" />
				</div>
			</div>

			{#if data.type === 'priced'}
				{#if !showProRata}
					<div class="bg-bg flex items-center justify-center py-5 h-[160px] rounded-b-2xl">
						<div>Total equity sold: <span class="text-primaryOrange mr-2">60%</span></div>
						<div class="flex items-center w-[70px]">
							<div class="border-b-2 border-borderDark flex-1" />
							{#if previousInvestorsWithProRata.length > 0}
								<div
									class=" flex-1 h-[70px] border-2 border-borderDark rounded-xl border-r-0 rounded-r-none"
								/>
							{/if}
						</div>
						<div class="text-sm text-textLight flex flex-col justify-between">
							<div class="px-3 py-2 mb-3 text-sm">
								New investors give you<br />
								<span class="text-textDark">$10,000,000</span> and get
								<span class="text-primaryOrange">55%</span>
							</div>
							{#if previousInvestorsWithProRata.length > 0}
								<div
									on:click={() => (showProRata = true)}
									class={cn(
										'  text-sm flex items-center gap-4 hover:bg-borderLight cursor-pointer px-3 py-2 rounded-lg active:bg-borderDark'
									)}
								>
									{#if data.participations.length === 0}
										<div>No previous investor invests <br />in this round (pro-rata)</div>
									{:else}
										<div>
											{data.participations.length === 1
												? `${previousInvestorsWithProRata[0]} investors `
												: `Other investors`} give you<br />
											<span class="text-textDark">$1,000,000</span> and get
											<span class="text-primaryOrange">5%</span> (pro-rata)
										</div>
									{/if}
									<svg
										width="17"
										height="17"
										viewBox="0 0 17 17"
										fill="none"
										class="scale-75"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M13.4519 0.431571C13.7413 0.311698 14.0515 0.25 14.3647 0.25C14.6779 0.25 14.9881 0.311698 15.2775 0.431571C15.5669 0.551443 15.8299 0.727143 16.0514 0.94864C16.2729 1.17014 16.4486 1.43309 16.5684 1.72249C16.6883 2.01189 16.75 2.32206 16.75 2.6353C16.75 2.94855 16.6883 3.25872 16.5684 3.54812C16.4486 3.83752 16.2729 4.10047 16.0514 4.32197L10.9981 9.37526C10.6321 9.74123 10.167 9.98986 9.66022 10.0912C9.66019 10.0912 9.66026 10.0912 9.66022 10.0912L7.32373 10.5589C7.07785 10.6081 6.82364 10.5312 6.6463 10.3539C6.46896 10.1766 6.39194 9.92244 6.44107 9.67654L6.90784 7.34005C7.00953 6.83324 7.25906 6.36725 7.62474 6.00193M7.62474 6.00193L12.678 0.94864C12.8995 0.727145 13.1625 0.551444 13.4519 0.431571M14.3647 1.75C14.2484 1.75 14.1333 1.7729 14.0259 1.81739C13.9185 1.86188 13.8209 1.92709 13.7387 2.0093L12.8458 2.90222L14.0978 4.15423L14.9907 3.26131C15.0729 3.1791 15.1381 3.08151 15.1826 2.9741C15.2271 2.86669 15.25 2.75157 15.25 2.6353C15.25 2.51904 15.2271 2.40392 15.1826 2.29651C15.1381 2.1891 15.0729 2.09151 14.9907 2.0093C14.9085 1.92709 14.8109 1.86188 14.7035 1.81739C14.5961 1.7729 14.481 1.75 14.3647 1.75ZM13.0371 5.21489L11.7851 3.96288L8.6854 7.06259C8.52912 7.21865 8.42216 7.41784 8.37868 7.63438C8.37867 7.63443 8.37869 7.63433 8.37868 7.63438L8.13237 8.86728L9.36583 8.6204C9.58257 8.57705 9.78105 8.47096 9.93741 8.3146L13.0371 5.21489ZM2.76472 3.51457C2.4956 3.51457 2.2375 3.62148 2.04721 3.81178C1.85691 4.00207 1.75 4.26017 1.75 4.52929V14.2353C1.75 14.5044 1.85691 14.7625 2.04721 14.9528C2.2375 15.1431 2.4956 15.25 2.76472 15.25H12.4707C12.7398 15.25 12.9979 15.1431 13.1882 14.9528C13.3785 14.7625 13.4854 14.5044 13.4854 14.2353V11.5882C13.4854 11.174 13.8212 10.8382 14.2354 10.8382C14.6496 10.8382 14.9854 11.174 14.9854 11.5882V14.2353C14.9854 14.9022 14.7205 15.5419 14.2489 16.0135C13.7773 16.4851 13.1377 16.75 12.4707 16.75H2.76472C2.09778 16.75 1.45815 16.4851 0.986546 16.0135C0.514944 15.5419 0.25 14.9022 0.25 14.2353V4.52929C0.25 3.86235 0.514943 3.22272 0.986546 2.75112C1.45815 2.27951 2.09778 2.01457 2.76472 2.01457H5.41181C5.82602 2.01457 6.16181 2.35036 6.16181 2.76457C6.16181 3.17878 5.82602 3.51457 5.41181 3.51457H2.76472Z"
											fill="#B8B8AD"
										/>
									</svg>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="bg-bg h-[160px] flex gap-2 rounded-b-2xl">
						<div class="w-[40px] pt-5 px-5 shrink-0">
							<button
								on:click={() => {
									showProRata = false;
								}}
								class="h-7 w-7 -m-2 inline-flex items-center justify-center rounded-full hover:bg-borderLight mr-1 text-textLight hover:text-textDark active:bg-borderDark"
								>{'<-'}</button
							>
						</div>
						<div class="w-[200px] pt-5 shrink-0">
							<div class="mb-2">
								Other investors

								<span class="text-textLight text-sm ml-1"> (7%) </span>
							</div>
							<div class="text-xs leading-5 text-textLight">
								Who else is investing in this round? (through their pro-rata right)
							</div>
						</div>
						<div class="py-3 flex flex-wrap content-start">
							{#each previousInvestorsWithProRata as investor}
								<Select
									label={investor}
									checked={data.participations.includes(investor)}
									onclick={() => handleProRataClick(investor)}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<div class="bg-bg flex align-center justify-center py-5 rounded-b-2xl">
					<span class="mr-3 text-textLight">Safe type</span>
					<span>{getSafeType(data)}</span>
				</div>
			{/if}
		</div>
	{:else}
		<CollapsedFunding
			{index}
			{data}
			on:click={() => {
				show = true;
			}}
		/>
	{/if}
</div>
