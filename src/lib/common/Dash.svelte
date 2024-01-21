<script lang="ts">
	import PlusButton from './PlusButton.svelte';

	export let height: string = '130px';
	export let noButton: boolean = false;
	let showPlusButton = false;

	export let position: number;
</script>

<div
	class="flex justify-center relative w-10"
	on:mouseenter={() => (showPlusButton = true)}
	on:mouseleave={() => (showPlusButton = false)}
>
	<div class="w-[3px] bg-[url(/stripe.svg)]" style:height />
	{#if !noButton && showPlusButton}
		<PlusButton {position} />
	{/if}
</div>
