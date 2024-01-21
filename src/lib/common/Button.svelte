<script lang="ts">
	import { cn } from '$lib';

	let _class: string = '';

	export { _class as class };

	export let onclick = () => {};
</script>

<button
	on:click={onclick}
	class={cn(
		'bg-white py-3 px-4 rounded-lg border border-borderDark button-shadow hover:border-borderDarkHover  active:shadow-none active:translate-y-[1px]',
		_class
	)}
>
	<slot />
</button>
