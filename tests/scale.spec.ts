// Node-side unit tests for the scaling maths and the recipe data migration. No browser involved.
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { recipes } from '../src/lib/data/recipes.ts';
import { boller } from '../src/recipes/boller.ts';
import { frittata } from '../src/recipes/frittata.ts';
import {
	baseScaling,
	clampPortions,
	formatAmount,
	formatNumber,
	renderStepText,
	schemaIngredient,
	type Scaling,
} from '../src/lib/scale.ts';
import type { Ingredient, Recipe } from '../src/lib/types/recipe.ts';

const at = (portions: number, base = 4): Scaling => ({ base, portions });
const m = (qty: number | [number, number], unit?: string, extra: Partial<Ingredient> = {}, plural?: string): Ingredient => ({
	name: 'X',
	amount: { qty, unit, plural },
	...extra,
});
const fmt = (i: Ingredient, portions: number, base = 4) => formatAmount(i, at(portions, base));

test.describe('formatNumber', () => {
	test('decimal comma and unicode fractions', () => {
		expect(formatNumber(3)).toBe('3');
		expect(formatNumber(0.5)).toBe('½');
		expect(formatNumber(0.25)).toBe('¼');
		expect(formatNumber(0.75)).toBe('¾');
		expect(formatNumber(1.5)).toBe('1½');
		expect(formatNumber(2.25)).toBe('2¼');
		expect(formatNumber(1.2)).toBe('1,2');
		expect(formatNumber(1.5, { fractions: false })).toBe('1,5');
		expect(formatNumber(0.333333)).toBe('0,33');
	});

	test('clampPortions', () => {
		expect(clampPortions('6')).toBe(6);
		expect(clampPortions('0')).toBe(1);
		expect(clampPortions(99)).toBe(24);
		expect(clampPortions(2.6)).toBe(3);
		expect(clampPortions('abc')).toBeNull();
		expect(clampPortions(null)).toBeNull();
		expect(clampPortions('')).toBeNull();
	});
});

test.describe('formatAmount: rounding and promotion', () => {
	const cases: [string, Ingredient, number, string][] = [
		['grams under 100 round to 5', m(40, 'g'), 6, '60 g'],
		['grams under 100, odd result', m(30, 'g'), 6, '45 g'],
		['grams over 100 round to 10', m(500, 'g'), 6, '750 g'],
		['grams 100+ rounds to 10', m(125, 'g'), 6, '190 g'],
		['g promotes to kg', m(500, 'gram'), 12, '1,5 kg'],
		['g to kg two decimals', m(500, 'g'), 10, '1,25 kg'],
		['kg stays kg', m(1, 'kg'), 6, '1,5 kg'],
		['kg below one becomes g', m(1, 'kg'), 2, '500 g'],
		['ml stays ml', m(250, 'ml'), 6, '375 ml'],
		['ml promotes to l', m(250, 'ml'), 16, '1 l'],
		['dl uses quarters', m(1, 'dl'), 6, '1½ dl'],
		['dl quarter step', m(1, 'dl'), 5, '1¼ dl'],
		['dl never below a quarter', m(1, 'dl'), 1, '¼ dl'],
		['dl promotes to l', m(2, 'dl'), 20, '1 l'],
		['l to decimal above one', m(1, 'liter'), 6, '1,5 l'],
		['l fraction below one', m(0.5, 'liter'), 2, '¼ l'],
		['tiny l becomes dl', m(0.1, 'l'), 1, '¼ dl'],
		['tsk to half steps', m(1, 'tsk'), 6, '1½ tsk.'],
		['3 tsk promotes to 1 spsk', m(1, 'tsk'), 12, '1 spsk.'],
		['4 tsk does not promote', m(1, 'tsk'), 16, '4 tsk.'],
		['spsk half steps', m(2, 'spsk.'), 6, '3 spsk.'],
		['spsk below one becomes tsk', m(1, 'spsk.'), 1, '1 tsk.'],
		['stk halves', m(3, 'stk.'), 2, '1½ stk.'],
		['stk whole above 10', m(8, 'stk'), 6, '12 stk'],
		['unit-less count', m(2), 6, '3'],
		['singular/plural', m(1, 'dåse', {}, 'dåser'), 8, '2 dåser'],
		['singular stays singular', m(2, 'dåse', {}, 'dåser'), 2, '1 dåse'],
		['round-up goes to whole numbers', m(3, 'stk.', { scale: 'round-up' }), 6, '5 stk.'],
		['round-up eggs with fractions', m(3, 'stk.', { scale: 'round-up' }), 2, '2 stk.'],
		['note is kept', m(1, undefined, { note: 'kan undværes' }), 8, '2 (kan undværes)'],
	];
	for (const [name, ingredient, portions, expected] of cases) {
		test(name, () => expect(fmt(ingredient, portions)).toBe(expected));
	}

	test('ranges scale both ends', () => {
		expect(fmt(m([2, 3], 'spsk.'), 8)).toBe('4-6 spsk.');
		expect(fmt(m([1, 100], 'stk'), 6)).toBe('1½-150 stk');
		expect(fmt(m([2, 3], 'dåse', { scale: 'round-up' }, 'dåser'), 6)).toBe('3-5 dåser');
	});

	test('range promotes by its largest end', () => {
		expect(fmt(m([500, 900], 'g'), 8)).toBe('1-1,8 kg');
	});

	test('a range collapses when both ends round together', () => {
		expect(fmt(m([2, 2.2], 'g'), 4)).toBe('2-2,2 g'); // base yield: authored, unrounded
		expect(fmt(m([2, 2.2], 'g'), 5)).toBe('5 g');
	});

	test('fixed ingredients never change', () => {
		const salt = m(10, 'g', { scale: 'fixed' });
		expect(fmt(salt, 12)).toBe('10 g');
		expect(fmt(salt, 1)).toBe('10 g');
	});

	test('ingredients without an amount stay empty', () => {
		expect(formatAmount({ name: 'Peber og salt' }, at(12))).toBe('');
	});

	test('text amounts are untouched, per-serving ones gain a total', () => {
		expect(fmt({ name: 'Ja', amount: { text: 'Ja' } }, 12)).toBe('Ja');
		const bananas: Ingredient = { name: 'Bananer', amount: { text: 'mindst en pr. pers', perServing: 1 } };
		expect(fmt(bananas, 4)).toBe('mindst en pr. pers');
		expect(fmt(bananas, 6)).toBe('mindst en pr. pers (6 i alt)');
	});

	test('the authored wording is returned verbatim at base yield, and only there', () => {
		const flour: Ingredient = { name: 'Mel', amount: { qty: 500, unit: 'g', display: '500g' } };
		expect(fmt(flour, 4)).toBe('500g');
		expect(fmt(flour, 8)).toBe('1 kg');
	});

	test('linear scaling round-trips back to the original', () => {
		const flour = m(400, 'g');
		expect(fmt(flour, 12)).toBe('1,2 kg');
		expect(fmt(flour, 4)).toBe('400 g');
	});
});

test.describe('renderStepText', () => {
	const ingredients: Ingredient[] = [
		{ name: 'Tomater', amount: { qty: 3, unit: 'dåse', plural: 'dåser' }, scale: 'round-up' },
		{ name: 'Bouillon', amount: { qty: 1, unit: 'liter' } },
		{ name: 'Salt' },
	];
	test('tokens resolve to the scaled amount', () => {
		expect(renderStepText('Tilsæt {{Tomater}}.', ingredients, at(4))).toBe('Tilsæt 3 dåser.');
		expect(renderStepText('Tilsæt {{Tomater}}.', ingredients, at(8))).toBe('Tilsæt 6 dåser.');
	});
	test('authored prose is used at base yield and scaled otherwise', () => {
		const text = 'Lav {{Bouillon|en liter}} bouillon';
		expect(renderStepText(text, ingredients, at(4))).toBe('Lav en liter bouillon');
		expect(renderStepText(text, ingredients, at(6))).toBe('Lav 1,5 l bouillon');
	});
	test('unknown tokens and plain text degrade gracefully', () => {
		expect(renderStepText('Hej {{Ukendt}} og {{Ukendt|lidt}}', ingredients, at(8))).toBe('Hej Ukendt og lidt');
		expect(renderStepText('Ingen tokens her', ingredients, at(8))).toBe('Ingen tokens her');
	});
});

// ------------------------------------------------------------------ migration

interface LegacyRecipe {
	file: string;
	yield: number;
	ingredients: [string, string][];
	steps: string[];
}
const legacy: Record<string, LegacyRecipe> = JSON.parse(
	readFileSync(fileURLToPath(new URL('./fixtures/legacy-recipes.json', import.meta.url)), 'utf8'),
);

test.describe('migration: output at the recipe own yield equals the old text', () => {
	const all: Recipe[] = [...recipes, boller, frittata];

	test('every legacy recipe is still present', () => {
		expect(all.map((r) => r.slug).sort()).toEqual(Object.keys(legacy).sort());
	});

	for (const recipe of all) {
		const old = legacy[recipe.slug];
		test(`${recipe.slug}: yield, ingredients and steps`, () => {
			expect(recipe.yield).toBe(old.yield);
			expect(recipe.ingredients.map((i) => i.name)).toEqual(old.ingredients.map(([name]) => name));
			const base = baseScaling(recipe.yield);
			recipe.ingredients.forEach((ingredient, idx) => {
				const [name, oldAmount] = old.ingredients[idx];
				expect(formatAmount(ingredient, base), name).toBe(oldAmount);
				// The old JSON-LD line was `${amount} ${name}`, or just the name.
				expect(schemaIngredient(ingredient, recipe.yield), name).toBe(oldAmount ? `${oldAmount} ${name}` : name);
			});
			expect(recipe.steps.map((s) => renderStepText(s.desc, recipe.ingredients, base))).toEqual(old.steps);
		});
	}

	test('scaling every recipe to every count never produces nonsense', () => {
		for (const recipe of all) {
			for (let n = 1; n <= 24; n++) {
				if (n === recipe.yield) continue; // authored wording, may contain legacy spellings
				for (const ingredient of recipe.ingredients) {
					const text = formatAmount(ingredient, { base: recipe.yield, portions: n });
					expect(text, `${recipe.slug} ${ingredient.name} @${n}`).not.toMatch(/NaN|undefined|Infinity|\.\d/);
				}
			}
		}
	});
});
