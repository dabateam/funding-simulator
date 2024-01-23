<script lang="ts">
	import { cn } from '$lib';

	export let checked: boolean = false;
	export let label = '';
	let _class: string = '';
	export { _class as class };
	export let onclick = () => {};
</script>

<div
	on:click={() => {
		checked = !checked;
		onclick();
	}}
	class={cn(
		'group/select flex gap-2 items-center justify-center w-fit p-2 px-3 rounded-lg cursor-pointer select-none active:bg-borderLight     hover:bg-bg',
		_class
	)}
>
	<div
		class={cn(
			' flex items-center justify-center bg-primaryOrange w-4 h-4 rounded-[5px]',

			!checked && 'bg-borderLight group-hover/select:bg-borderDark'
		)}
	>
		<svg
			class={cn('', !checked && 'opacity-0')}
			width="12"
			height="10"
			viewBox="0 0 12 10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M10.8317 1.0928C11.3327 1.55211 11.3666 2.33066 10.9073 2.83172L5.40726 8.83173C5.18042 9.07918 4.86235 9.22325 4.52673 9.23054C4.19112 9.23783 3.86708 9.10772 3.62971 8.87035L1.12971 6.37035C0.649065 5.8897 0.649065 5.11042 1.12971 4.62978C1.61036 4.14913 2.38964 4.14913 2.87028 4.62978L4.46133 6.22083L9.09273 1.1684C9.55204 0.667333 10.3306 0.633483 10.8317 1.0928Z"
				fill="white"
			/>
		</svg>
	</div>
	<div class={cn('text-sm ', !checked && 'text-textLight group-hover/select:text-textDark')}>
		{label}
	</div>
</div>
