import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { CapTable, Event, Exit, Founder, Options, PricedRound, Safe } from './types';
import { getCapTables, getTableTotalShares } from './calculations';
// import { goto } from '$app/navigation';

export const simId = writable('');

export const tables = writable<CapTable[]>([]);

export const companyName = writable('');

export const founders = writable<Founder[]>([
	{
		equity: 100,
		isYou: true,
		name: 'You',
		id: '0'
	}
]);

export const events = writable<Event[]>([]);

export const exit = writable<Exit | null>(null);

export const resetData = () => {
	simId.set('');
	companyName.set('');
	founders.set([
		{
			equity: 100,
			isYou: true,
			name: 'You',
			id: '0'
		}
	]);
	events.set([]);
	exit.set(null);
};

// export const getProRatasEvents = () => {
// 	const _events = get(events)
// 	const proRatas: { [key: string]: string[] } = {}
// 	_events.forEach(e => {
// 		if(e.type !== 'priced') return;
// 		proRatas[e.name] 
// 	})
// }

export const generateId = () => {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-';
	const id = new Array(7)
		.fill('')
		.map(() => chars.split('')[Math.floor(Math.random() * chars.split('').length)])
		.join('');
	return id;
};
export const deformatAmount = () => {};

const getFoundersString = (founders: Founder[]): string => {
	return founders
		.map((f) => {
			return `${f.name},${f.equity}`;
		})
		.join('_');
};

const getFoundersFromString = (foundersString: string): Founder[] => {
	return foundersString.split('_').map((fs, id) => {
		const data = fs.split(',');
		const founder: Founder = {
			name: data[0],
			equity: parseFloat(data[1]),
			id: String(id),
			isYou: id === 0
		};
		return founder;
	});
};

const getEventsFromString = (eventsString: string): Event[] => {
	return eventsString.split('_').map((es) => {
		if (es[0] === 's') {
			const event: Safe = {
				type: 'safe',
				name: es.split(',')[1],
				amount: parseInt(es.split(',')[2]),
				valCap: parseInt(es.split(',')[3]),
				discount: parseFloat(es.split(',')[4]),
				proRata: es.split(',')[5].split('')[0] === '1',
				mfn: es.split(',')[5].split('')[1] === '1'
			};
			return event;
		}
		if (es[0] === 'p') {
			const event: PricedRound = {
				type: 'priced',
				name: es.split(',')[1],
				amount: parseInt(es.split(',')[2]),
				valuation: parseInt(es.split(',')[3]),
				options: parseFloat(es.split(',')[4]),
				proRata: es.split(',')[5] === '1',
				participations: (es.split(',')[6]?.split("+") ?? []).filter(e => !!e),
			};
			return event;
		}
		const event: Options = {
			amount: parseFloat(es.split(',')[1]),
			type: 'options',
			reserved: parseFloat(es.split(',')[2])
		};
		return event;
	});
};

const getExitFromString = (exitString: string): Exit | null => {
	if (!exitString) return null;
	return {
		amount: parseInt(exitString.split(',')[0]),
		tax: parseInt(exitString.split(',')[1])
	};
};

const getEventsString = (events: Event[]): string => {
	return events
		.map((e) => {
			if (e.type === 'safe') {
				return `s,${e.name},${e.amount},${e.valCap},${e.discount},${e.proRata ? '1' : '0'}${
					e.mfn ? '1' : '0'
				}`;
			}
			if (e.type === 'priced') {
				return `p,${e.name},${e.amount},${e.valuation},${e.options || 0},${e.proRata ? '1' : '0'},${e.participations.join("+")}`;
			}
			if (e.type === 'options') {
				return `o,${e.amount},${e.reserved}`;
			}
		})
		.join('_');
};

const getExitString = (exit: Exit): string => {
	return `${exit.amount},${exit.tax}`;
};

export const toURL = () => {
	const _simId = get(simId);
	const _name = get(companyName);
	const _founders = get(founders);
	const _events = get(events);
	const _exit = get(exit);

	return `${_simId};${_name};${getFoundersString(_founders)};${getEventsString(_events)};${
		_exit ? getExitString(_exit) : ''
	}`;
};

export const getDataFromString = (string: string) => {
	const id = string.split(';')[0] || '';
	const name = string.split(';')[1] || '';
	const founders = string.split(';')[2] ? getFoundersFromString(string.split(';')[2]) : [];
	const events = string.split(';')[3] ? getEventsFromString(string.split(';')[3]) : []; 
	const exit = string.split(';')[4] ? getExitFromString(string.split(';')[4]) : null;

	return { id, name, founders, events, exit };
};

export const LOCAL_STORAGE_KEY = '__exit-simulations';

const getDataParam = () => {
	if (browser) {
		const params = new URLSearchParams(window.location.search);
		const dataParam = params.get('data');
		return dataParam || '';
	}
	return '';
};

export const loadedData = writable(!!getDataParam());

export const getOrSetPreviousSims = () => {
	let simulationsString = localStorage.getItem(LOCAL_STORAGE_KEY);

	if (!simulationsString) {
		localStorage.setItem(LOCAL_STORAGE_KEY, '[]');
		simulationsString = '[]';
	}

	try {
		const simulations: string[] = JSON.parse(simulationsString);
		return simulations;
	} catch (e) {
		console.log('error trying to parse simulations from localstorage');
	}

	return [];
};

export const finalYouShares = derived([tables], ([tables]) => {
	const finalTable = tables[tables.length - 1];
	const totalSharesFinal = getTableTotalShares(finalTable);
	return (finalTable['You'] / totalSharesFinal) * 100;
});

const refresh = () => {
	tables.set(getCapTables());

	if (get(loadedData)) {
		const urlString = toURL();
		const url = new URL(window.location.href);
		url.searchParams.set('data', urlString);
		window.history.pushState({}, '', url);
		const simulationsString = getOrSetPreviousSims();
		const indexOfCurrentSim = simulationsString.findIndex((el) => el.split(';')[0] === get(simId));
		if (indexOfCurrentSim !== -1) {
			simulationsString[indexOfCurrentSim] = urlString;
		} else {
			simulationsString.push(urlString);
		}
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simulationsString));
	}
};

const dataParam = getDataParam();
if (dataParam) {
	const data = getDataFromString(dataParam);
	simId.set(data.id);
	companyName.set(data.name);
	founders.set(data.founders);
	events.set(data.events);
	exit.set(data.exit);
	loadedData.set(true);
}

companyName.subscribe(refresh);
founders.subscribe(refresh);
events.subscribe(refresh);
exit.subscribe(refresh);

