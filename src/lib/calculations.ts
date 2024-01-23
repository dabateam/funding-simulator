import { get } from 'svelte/store';
import { events as _events, founders as _founders, exit as _exit } from './store';
import { produce } from 'immer';
import type { CapTable, Event, Options, PricedRound, Safe } from './types';

const INITIAL_SHARES = 10_000_000;
export const AVAILABLE_OPTIONS_LABEL = 'Available';
export const EMPLOYEE_OPTIONS_LABEL = 'Employees';

const getNewOptions = ({
	currentShares,
	optionsTaget,
	existingAvailableOptions,
	newInvestment,
	preMoneyValuation
}: {
	currentShares: number;
	optionsTaget: number;
	existingAvailableOptions: number;
	newInvestment: number;
	preMoneyValuation: number;
}) => {
	const f1 = 1 / optionsTaget - 1;

	const top =
		(currentShares / f1) * (1 + newInvestment / preMoneyValuation) -
		existingAvailableOptions / (1 - optionsTaget);

	const bottom = 1 - newInvestment / (preMoneyValuation * f1);

	return top / bottom;
};

export const getTableTotalShares = (table: CapTable) => {
	return Object.values(table).reduce((prev, curr) => {
		return prev + curr;
	}, 0);
};

const getFirstTable = (): CapTable => {
	const founders = get(_founders);
	const table: CapTable = {};

	founders.forEach((founder) => {
		table[founder.name] = (founder.equity / 100) * INITIAL_SHARES;
	});

	return table;
};

const getSafes = (firstPricedRound: PricedRound, totalShares: number) => {
	const safesTables: CapTable = {};

	const safes = (get(_events).filter((e) => e.type === 'safe') as Safe[]).map((safe) => {
		let valuation = firstPricedRound.valuation;
		if (safe.valCap && safe.discount)
			valuation = Math.min(safe.valCap, firstPricedRound.valuation * (1 - safe.discount / 100));
		if (safe.valCap && !safe.discount) valuation = safe.valCap;
		if (!safe.valCap && safe.discount)
			valuation = firstPricedRound.valuation * (1 - safe.discount / 100);
		return {
			...safe,
			valuation
		} as Safe & { valuation: number };
	});

	const safesWithMFN = safes.map((safe, safeIndex) => {
		if (!safe.mfn) return safe;
		const searchList = safes.slice(safeIndex);
		const highestValuation = searchList.reduce((max, current) => {
			return current.valuation <= max ? current.valuation : max;
		}, safe.valuation);
		return {
			...safe,
			valuation: highestValuation
		};
	});

	const totalSafesDilution = safesWithMFN.reduce((prev, curr) => {
		return prev + curr.amount / curr.valuation;
	}, 0);

	const newTotal = totalShares / (1 - totalSafesDilution);

	safesWithMFN.forEach((safe) => {
		safesTables[safe.name] = newTotal * (safe.amount / safe.valuation!);
	});

	return safesTables;
};

const getProRatas = ({
	current,
	event,
	newShares,
	total,
	firstPricedRound
}: {
	event: PricedRound;
	newShares: number;
	total: number;
	current: CapTable;
	firstPricedRound: boolean;
}) => {
	let proRatas: CapTable = {};
	const events = get(_events);
	events.forEach((e) => {
		if (e.type !== 'priced' && e.type !== 'safe') return;
		if (e.type === 'safe' && !firstPricedRound) return;
		if (!e.proRata || !current[e.name] || e.name === event.name) return;
		const shares = newShares * (current[e.name] / total);
		if (shares && event.participations.includes(e.name))
			proRatas = addTables(proRatas, {
				[e.name]: shares
			});
	});
	return proRatas;
};

const getOptions = ({
	current,
	event,
	total
}: {
	current: CapTable;
	event: Options;
	total: number;
}) => {
	const options: CapTable = {};
	if (event.reserved) {
		const target = event.reserved / 100;
		options[AVAILABLE_OPTIONS_LABEL] = (target * total) / (1 - target);
	}
	if(event.amount) {
		const target = event.amount / 100;
		if (target <= parseFloat((((current[AVAILABLE_OPTIONS_LABEL] || 0) + (options[AVAILABLE_OPTIONS_LABEL] || 0)) / total).toFixed(2))) {
			const sharesToGrant = (total + (options[AVAILABLE_OPTIONS_LABEL] || 0)) * target;
			options[EMPLOYEE_OPTIONS_LABEL] = (options[EMPLOYEE_OPTIONS_LABEL] || 0) + sharesToGrant;
			options[AVAILABLE_OPTIONS_LABEL] = (options[AVAILABLE_OPTIONS_LABEL] || 0) - sharesToGrant;
		}
	}

	return options;
};

const addTables = (oldTable: CapTable, table: CapTable) => {
	return produce(oldTable, (draft) => {
		Object.keys(table).forEach((key) => {
			draft[key] = (draft[key] || 0) + table[key];
		});
	});
};

export const getNewTable = (event: Event, previousTable: CapTable, firstPricedRound: boolean) => {
	let newTable: CapTable = {};
	const oldTotal = getTableTotalShares(previousTable);
	const getCurrentTotal = () => getTableTotalShares(newTable) + oldTotal;

	if (event.type === 'priced') {
		let safes: CapTable = {};
		if (firstPricedRound) {
			safes = getSafes(event, oldTotal);
			newTable = addTables(newTable, safes);
		}
		let futureTotal = 0;
		let newOptions = 0;
		if (event.options) {
			const previousOptions = previousTable[AVAILABLE_OPTIONS_LABEL] || 0;
			newOptions = getNewOptions({
				currentShares: getCurrentTotal(),
				existingAvailableOptions: previousOptions,
				newInvestment: event.amount,
				optionsTaget: event.options / 100,
				preMoneyValuation: event.valuation - event.amount
			});

			futureTotal = (previousOptions + newOptions) / (event.options / 100);
		} else {
			futureTotal = getCurrentTotal() / (1 - event.amount / event.valuation);
		}

		const newShares = futureTotal - getCurrentTotal();

		const newInvestorsShares = newShares - newOptions;

		const proRatas = getProRatas({
			firstPricedRound,
			event,
			newShares: newInvestorsShares,
			current: addTables(previousTable, newTable),
			total: getCurrentTotal()
		});
		const proRatasTotal = getTableTotalShares(proRatas);

		const mainInvestorShares = newInvestorsShares - proRatasTotal;

		newTable = addTables(newTable, proRatas);
		newTable = addTables(newTable, {
			[AVAILABLE_OPTIONS_LABEL]: newOptions
		});
		newTable = addTables(newTable, {
			[event.name]: mainInvestorShares
		});
	}

	if (event.type === 'options') {
		newTable = addTables(
			newTable,
			getOptions({ current: addTables(previousTable, newTable), event, total: getCurrentTotal() })
		);
	}

	return addTables(previousTable, newTable);
};

export const getCapTables = (): CapTable[] => {
	const events = get(_events);
	const exit = get(_exit);
	const tables: CapTable[] = [getFirstTable()];

	let foundFirstPricedRound = false;

	events.forEach((event) => {
		tables.push(
			getNewTable(
				event,
				tables[tables.length - 1],
				event.type === 'priced' && !foundFirstPricedRound
			)
		);
		if (event.type === 'priced') {
			foundFirstPricedRound = true;
		}
	});

	if (exit?.amount) {
		// distribute remaining available options
		const lastTable = tables[tables.length - 1];
		const distributedOptions: CapTable = {};
		const availableOptions = lastTable[AVAILABLE_OPTIONS_LABEL];
		if (availableOptions) {
			const total = getTableTotalShares(lastTable) - availableOptions;
			Object.keys(lastTable).forEach((key) => {
				if (key === AVAILABLE_OPTIONS_LABEL) {
					distributedOptions[AVAILABLE_OPTIONS_LABEL] = -availableOptions;
				} else {
					const newShares = (lastTable[key] / total) * availableOptions;
					distributedOptions[key] = newShares;
				}
			});
			tables.push(addTables(lastTable, distributedOptions));
		}
	}

	return tables;
};
