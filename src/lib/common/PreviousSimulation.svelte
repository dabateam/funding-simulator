<script lang="ts">
	import { cn, formatAmount } from '$lib';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import type { Event, Exit, Founder } from '$lib/types';

	export let sim: {
		id: string;
		name: string;
		founders: Founder[];
		events: Event[];
		exit: Exit | null;
	};

	let showConfirm = false;
	export let ondelete = () => {};
	export let onclick = () => {};

	let name = sim.name || '';
	let exit = sim.exit ? sim.exit.amount : 0;
	let totalRaised = sim.events.reduce((prev, curr) => {
		if (curr.type === 'options') return prev;
		return prev + curr.amount;
	}, 0);
</script>

<div
	on:click={onclick}
	class="h-[68px] mb-3 py-3 px-4 rounded-lg border-2 border-borderDark active:translate-y-[1px] text-xs cursor-pointer hover:border-borderDarkHover"
>
	<div class="">
		{#if name}
			<div class="text-textDark text-sm mb-1">
				{name}
			</div>
		{:else}
			<div class="text-textLight text-sm mb-1">Unnamed startup</div>
		{/if}

		{#if totalRaised > 0}
			Raised {formatAmount(totalRaised)}
		{/if}

		{#if exit}
			<span class="mx-1">•</span> Exited for {formatAmount(exit)}
		{/if}
	</div>
</div>
<button
	on:mouseleave={() => (showConfirm = false)}
	class={cn(
		'transition-none right-[0] text-textLight top-[14px] hover:bg-borderLight group-hover:opacity-100 opacity-0 active:bg-borderDark rounded-lg p-2.5 absolute',
		showConfirm && ' text-xs right-[-40px]'
	)}
	on:click={showConfirm
		? () => {
				ondelete();
				showConfirm = false;
		  }
		: () => (showConfirm = true)}
>
	{#if showConfirm}
		Confirm?
	{:else}
		<DeleteIcon />
	{/if}
</button>
