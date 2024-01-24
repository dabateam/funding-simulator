<script lang="ts">
	import { box, box_reverse, cn } from '$lib';
	import Input from '$lib/common/Input.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import { events, tables } from '$lib/store';

	import type { Options } from '$lib/types';

	import { onMount } from 'svelte';
	import FloatingTable from './FloatingTable.svelte';
	import { AVAILABLE_OPTIONS_LABEL, getTableTotalShares } from '$lib/calculations';

	export let data: Options;
	export let index: number;

	onMount(() => {
		const handleClick = (e: MouseEvent) => {
			const box = document.getElementById('options-box');
			if (box && !box?.contains(e.target as Node)) {
				show = false;
			}
		};

		document.addEventListener('click', handleClick, true);
		return () => document.removeEventListener('click', handleClick, true);
	});

	let show = false;

	const deleteEvent = () => {
		$events = $events.filter((_, i) => i !== index);
	};

	$: available =
		(($tables[index]?.[AVAILABLE_OPTIONS_LABEL] || 0) / getTableTotalShares($tables[index + 1])) *
		100;

	$: remaining =
		(($tables[index + 1]?.[AVAILABLE_OPTIONS_LABEL] || 0) /
			getTableTotalShares($tables[index + 1])) *
		100;
</script>

<div class="relative h-10 max-sm:h-[105px] group px-11 __event max-sm:px-0">
	<div
		class={cn(
			'max-sm:hidden max-sm:group-hover:hidden absolute -right-[10px] top-[calc(50%_+_11px)] -translate-y-[50%] translate-x-[100%] group-hover:block hidden'
		)}
	>
		<FloatingTable position={index} />
	</div>
	{#if show}
		<div
			id="options-box"
			out:box
			in:box={{ delay: 50 }}
			class="w-[500px] max-sm:w-[350px] bg-bg transition-none duration-0 origin-center flex flex-col items-center absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[21] funding-box border border-white rounded-2xl"
		>
			<div
				class="max-sm:hidden absolute right-[0] top-[calc(50%_+_11px)] -translate-y-[50%] translate-x-[calc(100%_+_20px)]"
			>
				<FloatingTable position={index} />
			</div>
			<div class="text-sm h-12 text-textLight flex items-center justify-center gap-1.5">
				Previous available option pool is
				<span class="text-primaryOrange">{parseFloat(Math.abs(available).toFixed(1))}% </span>
				<span class="max-sm:hidden">of all shares</span>
			</div>
			<div class="flex w-full max-sm:flex-col">
				<div
					class={cn(
						'flex-1 flex flex-col items-center py-6 border-y-[3px] border-borderLight w-full bg-white border-r-[3px] max-sm:border-b-[3px] max-sm:border-r-0',
						!data.reserved && 'opacity-50'
					)}
				>
					<div class="mb-1">Reserve options</div>
					<div class="text-textLight text-sm">Increase available pool</div>
					<Input
						autofocus
						selectOnFocus
						class="mt-5 mb-1"
						type="percent"
						value={data.reserved}
						onchange={(value) => {
							if (parseFloat(value) + available < data.amount) {
								data.amount = parseFloat(value) + available;
							}
							data.reserved = parseFloat(value);
						}}
					/>
				</div>
				<div
					class={cn(
						'flex-1 flex flex-col items-center py-6 border-y-[3px] border-borderLight w-full bg-white max-sm:border-t-0',
						!data.amount && 'opacity-50'
					)}
				>
					<div class="mb-1">Grant options</div>
					<div class="text-textLight text-sm">Give to employees</div>
					<Input
						selectOnFocus
						class="mt-5 mb-1"
						type="percent"
						value={data.amount}
						onchange={(value) => {
							data.amount =
								parseFloat(value) > available + data.reserved
									? available + data.reserved
									: parseFloat(value);
						}}
					/>
				</div>
			</div>
			<div class="text-sm h-12 text-textLight flex items-center justify-center gap-1.5">
				Option pool that will remain is
				<span class="text-primaryOrange">{parseFloat(Math.abs(remaining).toFixed(1))}%</span>
			</div>
		</div>
	{:else}
		<div
			on:click={() => (show = true)}
			transition:box_reverse
			class="bg-bg text-sm cursor-pointer hover:border-borderDarkHover active:border-borderDark border-2 border-borderDark flex items-center gap-3 py-2 px-3 rounded-xl mx-auto w-fit max-sm:w-[350px] max-sm:justify-center"
		>
			<div>
				<span class="mr-2 text-textLight max-sm:block max-sm:text-center max-sm:mb-1">Options</span>
				{#if data.reserved}
					Reserve
					<span class="text-primaryOrange">{parseFloat(data.reserved.toFixed(1))}%</span>
				{/if}
				{#if data.reserved && data.amount}
					,
				{/if}
				{#if data.amount}
					Give
					<span class="text-primaryOrange">{parseFloat(data.amount.toFixed(1))}%</span> to employees
				{/if}
			</div>
		</div>
		<button
			class=" max-sm:opacity-70 block right-[0] text-textLight top-[0px] hover:bg-borderLight group-hover:opacity-100 opacity-0 active:bg-borderDark rounded-lg p-2.5 absolute max-sm:right-[50%] max-sm:translate-x-[50%] max-sm:top-[67px] max-sm:scale-90"
			on:click={deleteEvent}><DeleteIcon /></button
		>
	{/if}
</div>
