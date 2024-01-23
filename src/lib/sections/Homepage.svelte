<script lang="ts">
	import { box, box_reverse, formatAmount } from '$lib';
	import Button from '$lib/common/Button.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import {
		generateId,
		getDataFromString,
		getOrSetPreviousSims,
		loadedData,
		simId,
		companyName,
		founders,
		events,
		exit,
		LOCAL_STORAGE_KEY,
		resetData
	} from '$lib/store';
	import { onMount } from 'svelte';
	import type { Founder, Exit, Event } from '$lib/types';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import PreviousSimulation from '$lib/common/PreviousSimulation.svelte';

	let previousSims: string[] = [];
	let parsedSims: {
		id: string;
		name: string;
		founders: Founder[];
		events: Event[];
		exit: Exit | null;
	}[] = [];

	onMount(() => {
		previousSims = getOrSetPreviousSims();
		parsedSims = previousSims.map(getDataFromString);
	});

	const deleteSim = (id: number) => {
		previousSims = previousSims.filter((_, sId) => sId !== id);
		parsedSims = previousSims.map(getDataFromString);
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(previousSims));
	};
</script>

<div
	out:box={{ duration: 300, scale: 25 }}
	in:box={{ delay: 100, duration: 300, scale: 25 }}
	class="will-change-transform origin-top h-full min-h-screen flex flex-col max-w-[400px] mx-auto absolute w-full left-[50%] -translate-x-[50%] top-0"
>
	<div class="text-xl opacity-50 text-textLight py-10 text-center">Startup Funding Simulator</div>
	{#if parsedSims.length > 0}
		<div class="text-xs py-7 text-center">Previous simulations</div>

		<div class="flex flex-col gap-3">
			{#each parsedSims as sim, simIndex (sim.id)}
				<div class="relative group px-11" animate:flip={{ duration: 250, easing: quintOut }}>
					<PreviousSimulation
						{sim}
						ondelete={() => deleteSim(simIndex)}
						onclick={() => {
							$simId = sim.id;
							$companyName = sim.name;
							$founders = sim.founders;
							$events = sim.events;
							$exit = sim.exit;
							$loadedData = true;

							const url = new URL(window.location.href);
							url.searchParams.set('data', previousSims[simIndex]);
							window.history.pushState({}, '', url);
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex-1 flex items-center pb-40 justify-center">
		<Button
			onclick={() => {
				resetData();
				$simId = generateId();
				$loadedData = true;
			}}>New simulation</Button
		>
	</div>
</div>
