// Portion scaling and Danish amount formatting. Pure functions only: no DOM, no stores, no Svelte.
// Later features (share, print, cook mode) import `formatAmount` / `renderStepText` from here, together with
// the portions store, so they all show exactly the same numbers.

import type { Ingredient, MeasuredAmount, Quantity } from '#lib/types/recipe.ts';

/** The recipe's own yield and the number of portions currently wanted. */
export interface Scaling {
	base: number;
	portions: number;
}

export const MIN_PORTIONS = 1;
export const MAX_PORTIONS = 24;
export const PORTION_PRESETS = [2, 4, 6, 8, 12] as const;

const EPS = 1e-9;

export const factorOf = ({ base, portions }: Scaling): number => (base > 0 ? portions / base : 1);
export const isBase = (s: Scaling): boolean => s.portions === s.base;
export const baseScaling = (base: number): Scaling => ({ base, portions: base });

/** Clamp to a whole number in 1-24. Returns null for anything that is not a usable number. */
export function clampPortions(value: unknown): number | null {
	const n = typeof value === 'string' ? (value.trim() === '' ? NaN : Number(value.trim())) : typeof value === 'number' ? value : NaN;
	if (!Number.isFinite(n)) return null;
	return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, Math.round(n)));
}

// ---------------------------------------------------------------- numbers

const roundTo = (v: number, step: number) => Math.round(v / step + EPS) * step;
const trim = (v: number) => Math.round(v * 100) / 100;

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** Danish number: decimal comma, ¼ ½ ¾ where they read better ("1½", "½"). Pass `fractions: false` for metric decimals. */
export function formatNumber(value: number, { fractions = true }: { fractions?: boolean } = {}): string {
	const v = trim(value);
	const whole = Math.floor(v + EPS);
	const frac = trim(v - whole);
	if (frac < EPS) return String(whole);
	if (fractions && FRACTIONS[frac]) return `${whole || ''}${FRACTIONS[frac]}`;
	return String(v).replace('.', ',');
}

// ---------------------------------------------------------------- units

type Kind = 'g' | 'kg' | 'ml' | 'dl' | 'l' | 'tsk' | 'spsk';

const UNIT_KINDS: Record<string, Kind> = {
	g: 'g',
	gram: 'g',
	kg: 'kg',
	ml: 'ml',
	dl: 'dl',
	l: 'l',
	liter: 'l',
	tsk: 'tsk',
	'tsk.': 'tsk',
	teske: 'tsk',
	spsk: 'spsk',
	'spsk.': 'spsk',
	spiseske: 'spsk',
};

const KIND_LABEL: Record<Kind, string> = { g: 'g', kg: 'kg', ml: 'ml', dl: 'dl', l: 'l', tsk: 'tsk.', spsk: 'spsk.' };

const kindOf = (unit?: string): Kind | undefined => (unit ? UNIT_KINDS[unit.trim().toLowerCase()] : undefined);

const toArray = (q: Quantity): number[] => (Array.isArray(q) ? [...q] : [q]);
const fromArray = (values: number[]): Quantity => {
	const [a, b] = values;
	return values.length === 2 && Math.abs(a - b) > EPS ? [a, b] : a;
};

/** Rounding table. Never rounds a non-zero amount down to nothing. */
function roundFor(kind: Kind | undefined, values: number[], mode: 'linear' | 'round-up'): { values: number[]; unit?: string } {
	const hi = Math.max(...values);
	const each = (fn: (v: number) => number) => values.map((v) => fn(v));
	const atLeast = (step: number) => (v: number) => Math.max(step, v);

	switch (kind) {
		case 'g': {
			if (hi >= 1000) return { values: each((v) => Math.max(0.05, roundTo(v / 1000, 0.05))), unit: 'kg' };
			return { values: each((v) => Math.max(5, roundTo(v, v < 100 ? 5 : 10))), unit: 'g' };
		}
		case 'kg': {
			if (hi < 1) return roundFor('g', values.map((v) => v * 1000), mode);
			return { values: each((v) => Math.max(0.05, roundTo(v, 0.05))), unit: 'kg' };
		}
		case 'ml': {
			if (hi >= 1000) return { values: each((v) => Math.max(0.05, roundTo(v / 1000, 0.05))), unit: 'l' };
			return { values: each((v) => Math.max(5, roundTo(v, v < 100 ? 5 : 25))), unit: 'ml' };
		}
		case 'dl': {
			if (hi >= 10) return { values: each((v) => Math.max(0.05, roundTo(v / 10, 0.05))), unit: 'l' };
			return { values: each((v) => atLeast(0.25)(roundTo(v, 0.25))), unit: 'dl' };
		}
		case 'l': {
			if (hi < 0.1) return { values: each((v) => atLeast(0.25)(roundTo(v * 10, 0.25))), unit: 'dl' };
			return { values: each((v) => atLeast(0.05)(roundTo(v, 0.05))), unit: 'l' };
		}
		case 'tsk': {
			const r = each((v) => atLeast(0.5)(roundTo(v, 0.5)));
			// 3 tsk. = 1 spsk.: promote only when every end is a whole number of spoonfuls.
			if (Math.min(...r) >= 3 && r.every((v) => Math.abs(v / 3 - Math.round(v / 3)) < EPS)) {
				return { values: r.map((v) => v / 3), unit: 'spsk' };
			}
			return { values: r, unit: 'tsk' };
		}
		case 'spsk': {
			if (hi < 1) return { values: each((v) => atLeast(0.5)(roundTo(v * 3, 0.5))), unit: 'tsk' };
			return { values: each((v) => atLeast(0.5)(roundTo(v, 0.5))), unit: 'spsk' };
		}
		default: {
			// Counted things: eggs, cans, cloves ... halves below 10, whole numbers above; round-up means whole, upwards.
			if (mode === 'round-up') return { values: each((v) => Math.max(1, Math.ceil(v - EPS))) };
			return { values: each((v) => (v < 10 ? atLeast(0.5)(roundTo(v, 0.5)) : roundTo(v, 1))) };
		}
	}
}

function joinQty(values: number[], fractions: boolean): string {
	const q = fromArray(values);
	return Array.isArray(q) ? `${formatNumber(q[0], { fractions })}-${formatNumber(q[1], { fractions })}` : formatNumber(q, { fractions });
}

// ---------------------------------------------------------------- amounts

/** Result of scaling a measured amount, before text. */
export interface ScaledQuantity {
	qty: Quantity;
	unit?: string;
}

export function scaleAmount(a: MeasuredAmount, factor: number, mode: 'linear' | 'round-up' = 'linear'): ScaledQuantity {
	const kind = kindOf(a.unit);
	const scaled = toArray(a.qty).map((v) => v * factor);
	const r = roundFor(kind, scaled, mode);
	const unit = kind ? KIND_LABEL[r.unit as Kind] : Math.max(...r.values) > 1 + EPS && a.plural ? a.plural : a.unit;
	return { qty: fromArray(r.values), unit };
}

/**
 * The amount text for an ingredient at the given scaling ("500 g", "1½ spsk.", "mindst en pr. pers (6 i alt)").
 * Empty string when the ingredient has no amount. At the recipe's own yield the authored wording is returned
 * unchanged, so migrating data to the structured form can never alter what visitors (and JSON-LD) see.
 */
export function formatAmount(ingredient: Ingredient, s: Scaling): string {
	const a = ingredient.amount;
	if (!a) return '';
	const note = ingredient.note ? ` (${ingredient.note})` : '';
	const atBase = isBase(s) || ingredient.scale === 'fixed';

	if ('text' in a) {
		if (atBase || !a.perServing) return a.text + note;
		return `${a.text} (${formatNumber(a.perServing * s.portions)} i alt)${note}`;
	}

	if (atBase) return (a.display ?? rawAmount(a)) + note;

	const mode = ingredient.scale === 'round-up' ? 'round-up' : 'linear';
	const { qty, unit } = scaleAmount(a, factorOf(s), mode);
	return joinWithUnit(toArray(qty), unit) + note;
}

function rawAmount(a: MeasuredAmount): string {
	const values = toArray(a.qty);
	const unit = Math.max(...values) > 1 + EPS && a.plural ? a.plural : a.unit;
	return joinWithUnit(values, unit, true);
}

function joinWithUnit(values: number[], unit: string | undefined, raw = false): string {
	// Metric decimals for kg and l above one ("1,5 l"); fractions elsewhere.
	const metric = unit === 'kg' || (unit === 'l' && Math.max(...values) >= 1);
	const fractions = raw ? true : !metric;
	const num = joinQty(values, fractions);
	return unit ? `${num} ${unit}` : num;
}

// ---------------------------------------------------------------- step text

const TOKEN = /\{\{\s*([^|}]+?)\s*(?:\|([^}]*))?\}\}/g;

/**
 * Step text with amount tokens resolved. `{{Hakkedetomater}}` becomes the ingredient's scaled amount;
 * `{{Bouillon|en liter}}` keeps the authored prose "en liter" at the recipe's own yield and scales otherwise.
 */
export function renderStepText(desc: string, ingredients: Ingredient[], s: Scaling): string {
	return desc.replace(TOKEN, (_all, name: string, atBase: string | undefined) => {
		const ingredient = ingredients.find((i) => i.name === name);
		if (!ingredient) return atBase ?? name;
		if (isBase(s) && atBase !== undefined) return atBase;
		return formatAmount(ingredient, s) || (atBase ?? '');
	});
}

/** Whether a step mentions a scalable amount (used to decide if it needs the reactive path). */
export const hasAmountTokens = (desc: string): boolean => desc.includes('{{');

/** The JSON-LD `recipeIngredient` line: always the original text, original order ("500g Kylling"). */
export function schemaIngredient(ingredient: Ingredient, base: number): string {
	const amount = formatAmount(ingredient, baseScaling(base));
	return amount ? `${amount} ${ingredient.name}` : ingredient.name;
}
