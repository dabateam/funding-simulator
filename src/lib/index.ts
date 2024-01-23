// place files you want to import through the `$lib` alias in this folder.
import clsx from 'clsx';
import type { ClassValue } from 'clsx';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';
import type { PricedRound, Safe } from './types';
import { get } from 'svelte/store';
import { events } from './store';
import confetti from 'canvas-confetti';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const selectContents = (el: HTMLDivElement) => {
	const range = document.createRange();
	range.selectNodeContents(el);
	const sel = window.getSelection();
	if (sel) {
		sel.removeAllRanges();
		sel.addRange(range);
	}
};

export const formatAmount = (num: number) => {
	let suffix = '';
	let divider = 1;
	if (num >= 1_000_000_000) {
		suffix = 'B';
		divider = 1_000_000_000;
	} else if (num >= 1_000_000) {
		suffix = 'M';
		divider = 1_000_000;
	} else if (num >= 1_000) {
		suffix = 'K';
		divider = 1_000;
	}

	const base = num / divider;
	const fixed = base >= 100 ? 0 : base >= 10 ? 1 : 2;
	const beforeDec = base.toString().split('.')[0];
	let afterDec = base.toString().split('.')[1];
	let result = beforeDec;
	if (afterDec) {
		afterDec = afterDec.slice(0, fixed);
	}

	if (afterDec) {
		result += '.' + afterDec;
	}
	return '$' + parseFloat(result) + suffix;
};

const easing = cubicOut;
const defaultDuration = 250;

export const box = (
	node: Element,
	{
		delay = 0,
		scale = 10,
		duration = defaultDuration
	}: { delay?: number; scale?: number; duration?: number } = {}
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	return {
		duration,
		delay,
		easing,
		css: (t, u) => `
		transform: ${transform} scale(${1 - u / scale});
		opacity: ${t}
	`
	};
};

export const menu = (node: Element, { delay = 0 }: { delay?: number } = {}): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	return {
		duration: 150,
		delay,
		easing,
		css: (t, u) => `
		transform: ${transform} translateX(-${u * 7}px) scale(${1 - u / 20});
		opacity: ${t}
	`
	};
};

export const box_reverse = (
	node: Element,
	{
		delay = 0,
		duration = defaultDuration,
		scale = 5
	}: { delay?: number; duration?: number; scale?: number } = {}
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	return {
		duration,
		easing,
		delay,
		css: (t, u) => `
		transform: ${transform} scale(${1 + u / scale});
		opacity: ${t}
	`
	};
};

const PRICED_ROUND_NAMES = [
	'Series A',
	'Series B',
	'Series C',
	'Series D',
	'Series E',
	'Series F',
	'Series G',
	'Series H',
	'Series I',
	'Series J',
	'Series K',
	'Series L',
	'Series M',
	'Series N'
];

const PRICED_ROUND_AMOUNTS: Record<string, [number, number]> = {
	'Series A': [10, 50],
	'Series B': [30, 150],
	'Series C': [50, 300],
	'Series D': [150, 1000],
	'Series E': [300, 2000],
	'Series F': [600, 4000],
	'Series G': [1200, 8000]
};

export const generateNameForEvent = (type: 'priced' | 'safe', position: number) => {
	const allEvents = get(events).filter((e) => e.type === 'priced' || e.type === 'safe') as (
		| PricedRound
		| Safe
	)[];
	const eventsBefore = allEvents.slice(0, position);
	let name = '';

	if (type === 'priced') {
		const numberOfPricedBefore = eventsBefore.filter((e) => e.type === 'priced').length;
		let counter = 1;
		name = PRICED_ROUND_NAMES[numberOfPricedBefore];

		while (allEvents.map((e) => e.name).includes(name)) {
			name = PRICED_ROUND_NAMES[numberOfPricedBefore] + counter;
			counter++;
		}
	} else {
		const numberOfSafesBefore = eventsBefore.filter((e) => e.type === 'safe').length;
		let counter = 1;
		name = 'Safe ' + (numberOfSafesBefore + 1);
		while (allEvents.map((e) => e.name).includes(name)) {
			name = 'Safe ' + (numberOfSafesBefore + 1) + ' - ' + counter;
			counter++;
		}
	}

	return name;
};

export const getDefaultPricedRoundAmount = (name: string) => {
	const shortName = name.slice(0, 8);

	if (Object.keys(PRICED_ROUND_AMOUNTS).includes(shortName)) {
		return PRICED_ROUND_AMOUNTS[shortName];
	}
	return [1, 10];
};


export const launchConfetti = () => {
	const count = 200;
		const defaults = {
			origin: { y: 0.7 }
		};

		function fire(particleRatio: number, opts: confetti.Options) {
			confetti({
				...defaults,
				...opts,
				particleCount: Math.floor(count * particleRatio)
			});
		}

		fire(0.25, {
			spread: 26,
			startVelocity: 55
		});
		fire(0.2, {
			spread: 60
		});
		fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8
		});
		fire(0.1, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2
		});
		fire(0.1, {
			spread: 120,
			startVelocity: 45
		});
}