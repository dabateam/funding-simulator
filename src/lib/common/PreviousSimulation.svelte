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
	class="py-2 px-3 rounded-lg border-2 border-borderDark active:translate-y-[1px] text-xs cursor-pointer hover:border-borderDarkHover"
>
	<div class="flex flex-col gap-1">
		{#if name}
			<div class="text-textDark text-sm">
				{name}
			</div>
		{:else}
			<div class="text-textLight text-sm">Unnamed startup</div>
		{/if}

		{#if totalRaised > 0 || exit}
			<div>
				{#if totalRaised > 0}
					Raised {formatAmount(totalRaised)}
				{/if}

				{#if exit}
					<span class="mx-1">•</span> Exited for {formatAmount(exit)}
				{/if}
			</div>
		{/if}
	</div>
</div>
<button
	on:mouseleave={() => (showConfirm = false)}
	class={cn(
		'transition-none right-[0] text-textLight top-[50%] -translate-y-[50%] hover:bg-borderLight group-hover:opacity-100 opacity-0 active:bg-borderDark rounded-lg p-2.5 absolute',
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
