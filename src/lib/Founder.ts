export type Founder = {
	id: string;
	name: string;
	equity: number;
	isYou: boolean;
};

export type Exit = {
	amount: number;
	tax: number;
};

export type Event = Safe | PricedRound | Options;

export type Safe = {
	type: 'safe';
	valCap: number;
	mfn: boolean;
	proRata: boolean;
	discount: number;
	amount: number;
	name: string;
};

export type PricedRound = {
	type: 'priced';
	valuation: number;
	proRata: boolean;
	options: number;
	amount: number;
	name: string;
};

export type Options = {
	type: 'options';
	amount: number;
};
