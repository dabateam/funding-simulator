<script lang="ts">
	import { box, cn, generateNameForEvent, getDefaultPricedRoundAmount, menu } from '$lib';
	import PricedIcon from '$lib/icons/PricedIcon.svelte';
	import OptionsIcon from '$lib/icons/OptionsIcon.svelte';
	import ExitIcon from '$lib/icons/ExitIcon.svelte';
	import SafeIcon from '$lib/icons/SafeIcon.svelte';
	import { events, exit } from '$lib/store';
	import { onMount } from 'svelte';

	let ref: HTMLDivElement;

	onMount(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref && !ref?.contains(e.target as Node)) {
				showMenu = false;
			}
		};

		document.addEventListener('click', handleClick, true);
		return () => document.removeEventListener('click', handleClick, true);
	});

	const addSafe = () => {
		showMenu = false;
		const name = generateNameForEvent('safe', position);
		$events = [
			...$events.slice(0, position),
			{
				type: 'safe',
				amount: 100_000,
				discount: 0,
				mfn: false,
				name,
				proRata: false,
				valCap: 2_000_000
			},
			...$events.slice(position)
		];
	};

	const addPriced = () => {
		showMenu = false;
		const name = generateNameForEvent('priced', position);

		$events = [
			...$events.slice(0, position),
			{
				type: 'priced',
				amount: getDefaultPricedRoundAmount(name)[0] * 1_000_000,
				name,
				proRata: true,
				valuation: getDefaultPricedRoundAmount(name)[1] * 1_000_000,
				options: 10
			},
			...$events.slice(position)
		];
	};

	const addOptions = (reserve: boolean) => {
		showMenu = false;
		$events = [
			...$events.slice(0, position),
			{
				type: 'options',
				amount: 7,
				reserve
			},
			...$events.slice(position)
		];
	};

	let showMenu = false;

	export let position: number;

	$: showExit = $events.slice(0, position).some((e) => e.type === 'priced');
	$: showSafe = !$events.slice(0, position).some((e) => e.type === 'priced');
	$: showPriced = !$events.slice(position).some((e) => e.type === 'safe');
</script>

<div
	bind:this={ref}
	on:mouseleave={() => (showMenu = false)}
	transition:box={{ scale: 20, duration: 200 }}
	class="rounded-full absolute z-20 left-[50%] top-[50%] h-10 w-10 -translate-x-[50%] -translate-y-[50%] bg-bg"
>
	<svg
		width="39"
		height="39"
		class="group cursor-pointer active:scale-[0.97]"
		viewBox="0 0 39 39"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		on:click={() => {
			showMenu = true;
		}}
	>
		<path
			d="M17.6921 25.5597V13H20.8675V25.5597H17.6921ZM13 20.8675V17.6921H25.5597V20.8675H13Z"
			class="fill-textLight"
		/>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M19.5 39C8.73045 39 0 30.2696 0 19.5C0 8.73045 8.73045 0 19.5 0C30.2696 0 39 8.73045 39 19.5C39 30.2696 30.2696 39 19.5 39ZM19.5 2C9.83502 2 2 9.83502 2 19.5C2 29.165 9.83502 37 19.5 37C29.165 37 37 29.165 37 19.5C37 9.83502 29.165 2 19.5 2Z"
			class="fill-borderDark group-hover:fill-textLight"
		/>
	</svg>

	{#if showMenu}
		<div transition:menu class="absolute -left-8 top-[50%] -translate-y-[50%] p-12 pl-24">
			<!-- <div
				class="w-3 h-3 bg-white absolute top-[50%] -translate-y-[50%] -translate-x-[50%] rotate-45 z-20 rounded-bl-[3px]"
			/> -->
			<div
				class="bg-white text-textDark rounded-xl text-[13px] overflow-hidden z-[21] relative border border-white menu-box"
			>
				<div
					on:click={addSafe}
					class={cn(
						'border-b border-borderLight last:border-none flex items-center h-[44px] px-4 cursor-pointer min-w-[150px] hover:bg-bg active:bg-borderLight whitespace-nowrap',
						!showSafe && 'opacity-30 pointer-events-none'
					)}
				>
					<div class="w-3 mr-3 text-primaryOrange"><SafeIcon /></div>
					Safe<span class="text-textLight ml-1">(Post-money)</span>
				</div>
				<div
					on:click={addPriced}
					class={cn(
						'border-b border-borderLight last:border-none flex items-center h-[44px] px-4 cursor-pointer min-w-[150px] hover:bg-bg active:bg-borderLight whitespace-nowrap',
						!showPriced && 'opacity-30 pointer-events-none'
					)}
				>
					<div class="w-3 mr-3 text-primaryOrange"><PricedIcon /></div>

					Priced round<span class="text-textLight ml-1">/ Equity financing</span>
				</div>
				<div
					on:click={() => addOptions(true)}
					class={cn(
						'border-b border-borderLight last:border-none flex items-center h-[44px] px-4 cursor-pointer min-w-[150px] hover:bg-bg active:bg-borderLight whitespace-nowrap'
					)}
				>
					<div class="w-3 mr-3 text-primaryOrange"><OptionsIcon /></div>

					Reserve options<span class="text-textLight ml-1">for employees</span>
				</div>
				<div
					on:click={() => addOptions(false)}
					class={cn(
						'border-b border-borderLight last:border-none flex items-center h-[44px] px-4 cursor-pointer min-w-[150px] hover:bg-bg active:bg-borderLight whitespace-nowrap'
					)}
				>
					<div class="w-3 mr-3 text-primaryOrange"><OptionsIcon /></div>

					Give options<span class="text-textLight ml-1">to employees</span>
				</div>

				<div
					on:click={() => {
						showMenu = false;
						$exit = {
							amount: 0,
							tax: 20
						};
					}}
					class={cn(
						'border-b border-borderLight last:border-none flex items-center h-[44px] px-4 cursor-pointer min-w-[150px] hover:bg-bg active:bg-borderLight whitespace-nowrap',
						!showExit && 'opacity-30 pointer-events-none'
					)}
				>
					<div class="w-3 mr-3 text-primaryOrange"><ExitIcon /></div>
					Exit<span class="text-textLight ml-1">/ Sell the startup</span>
				</div>
			</div>
		</div>
	{/if}
</div>
