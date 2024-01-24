<script lang="ts">
	import { goto } from '$app/navigation';
	import { box_reverse } from '$lib';
	import Dash from '$lib/common/Dash.svelte';
	import PlusButton from '$lib/common/PlusButton.svelte';
	import Exit from '$lib/sections/Exit.svelte';
	import Founders from '$lib/sections/Founders.svelte';
	import FundingBox from '$lib/sections/FundingBox.svelte';
	import Homepage from '$lib/sections/Homepage.svelte';
	import Options from '$lib/sections/Options.svelte';
	import Results from '$lib/sections/Results.svelte';
	import { events, exit, loadedData } from '$lib/store';
	import MoonIcon from '$lib/icons/MoonIcon.svelte';
	import SunIcon from '$lib/icons/SunIcon.svelte';
	import GithubIcon from '$lib/icons/GithubIcon.svelte';
	import TwitterIcon from '$lib/icons/TwitterIcon.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import DabaLogo from '$lib/icons/DabaLogo.svelte';
	let theme: 'light' | 'dark' = 'light';

	onMount(() => {
		if (localStorage.getItem('theme')) {
			if (localStorage.getItem('theme') == 'dark') {
				theme = 'dark';
				document.documentElement.setAttribute('data-theme', 'dark');
			}
		}
	});
</script>

{#if $loadedData}
	<button
		transition:fade
		on:click={() => {
			goto('/', { replaceState: true });
			$loadedData = false;
		}}
		class="__invertable max-sm:hidden fixed top-[30px] left-[30px] text-textLight text-xl w-10 h-10 rounded-xl hover:bg-borderLight active:bg-borderDark z-[3]"
	>
		{'<-'}
	</button>
{/if}

<div id="content">
	{#if $loadedData}
		<div
			class="will-change-transform origin-top flex flex-col items-center relative z-[2]"
			in:box_reverse={{ delay: 100, duration: 300, scale: 25 }}
			out:box_reverse={{ duration: 300, scale: 25 }}
		>
			<Founders />
			<Dash position={0} noButton={$events.length === 0} />
			{#each $events as event, eId}
				{#if event.type === 'safe' || event.type === 'priced'}
					<FundingBox index={eId} bind:data={event} />
				{/if}
				{#if event.type === 'options'}
					<Options index={eId} bind:data={event} />
				{/if}
				<Dash position={eId + 1} noButton={!$exit && eId === $events.length - 1} />
			{/each}

			{#if $exit}
				{#if $exit?.amount}
					<Results />
				{:else}
					<Exit />
				{/if}
			{:else}
				<div class="relative">
					<PlusButton position={$events.length} />
				</div>
			{/if}
			<div class="h-60" />
		</div>
	{:else}
		<Homepage />
	{/if}
</div>

<div
	class="__invertable fixed bottom-[30px] left-[30px] text-textLight z-[3] flex flex-col gap-1 items-center max-sm:flex-row max-sm:left-[50%] max-sm:-translate-x-[50%] max-sm:absolute max-sm:gap-3"
>
	<button
		transition:fade
		on:click={() => {
			const newTheme = theme === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', newTheme);
			theme = newTheme;
			document.documentElement.setAttribute('data-theme', newTheme);
		}}
		class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-borderLight active:bg-borderDark"
	>
		{#if theme === 'dark'}
			<MoonIcon />
		{:else}
			<SunIcon />
		{/if}
	</button>
	<a
		href="https://github.com/dabateam/funding-simulator"
		target="__blank"
		class=" w-10 h-10 flex items-center justify-center rounded-xl hover:bg-borderLight active:bg-borderDark"
	>
		<GithubIcon />
	</a>
	<a
		href="https://x.com/webstuff"
		target="__blank"
		class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-borderLight active:bg-borderDark"
	>
		<TwitterIcon />
	</a>
	<a
		href="https://www.nowayinc.com"
		target="__blank"
		class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-borderLight active:bg-borderDark"
	>
		<DabaLogo />
	</a>
</div>
