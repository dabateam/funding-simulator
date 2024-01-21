<script lang="ts">
	import { cn } from '$lib';
	import { onMount } from 'svelte';
	import IMask, { InputMask } from 'imask';

	export let type: 'percent' | 'amount' = 'amount';
	export let width = '100';

	const AMOUNT_MASK = {
		mask: Number,
		scale: 0,
		thousandsSeparator: ',',
		padFractionalZeros: false,
		normalizeZeros: true,
		radix: '.',
		mapToRadix: [','],
		min: 0,
		max: 999_999_999_999
	};

	const PERCENT_MASK = {
		mask: Number,
		scale: 1,
		thousandsSeparator: ',',
		padFractionalZeros: false,
		normalizeZeros: true,
		radix: '.',
		mapToRadix: [','],
		min: 0,
		max: 100
	};

	$: currentMask = type === 'amount' ? AMOUNT_MASK : PERCENT_MASK;

	let _class: string = '';
	let inputRef: HTMLInputElement;
	export let autofocus: boolean = false;
	export let selectOnFocus: boolean = true;

	let mask: InputMask;
	export let value: string | number = '';

	$: {
		if (mask) {
			mask.unmaskedValue = String(value);
			mask.updateValue();
			setTimeout(() => {
				inputRef.value = mask.value;
			}, 0);
		}
	}

	onMount(() => {
		if (inputRef) {
			mask = IMask(inputRef, currentMask);
			autofocus && inputRef.focus();
			// autoselect && setTimeout(() => inputRef.select(), 50);
		}
	});

	export let onchange = (value: string) => {};
	export let onkeypress = (e: KeyboardEvent) => {};
	export let white: boolean = false;
	export let preventEmpty: boolean = false;
	export { _class as class };
	export let faded: boolean = false;
</script>

<div class={cn('relative', _class)}>
	<input
		{value}
		bind:this={inputRef}
		on:focus={() => {
			selectOnFocus && setTimeout(() => inputRef.select(), 50);
		}}
		class={cn(
			'hover:bg-borderLight focus:bg-borderLight  focus:input-focus-shadow h-11 text-center rounded-lg bg-bg border input-shadow border-transparent px-6',
			white && 'bg-white border-borderDark focus:bg-white hover:bg-white',
			type === 'percent' ? 'pl-4' : 'pr-4',
			faded && 'opacity-50 hover:opacity-100 focus:opacity-100'
		)}
		style="width: {width}px;"
		on:blur={(e) => {
			if (preventEmpty && !mask.unmaskedValue) {
				e.currentTarget.value = String(value);
			} else {
				onchange(mask.unmaskedValue);
			}
		}}
		on:mouseup={(e) => {
			e.preventDefault();
		}}
		on:keypress={onkeypress}
	/>
	<div
		class={cn(
			'absolute top-[13px] text-textLight pointer-events-none',
			type === 'percent' ? 'right-[12px]' : 'left-[12px]'
		)}
	>
		{type === 'percent' ? '%' : '$'}
	</div>
</div>
