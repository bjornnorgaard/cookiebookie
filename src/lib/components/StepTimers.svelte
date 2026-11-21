<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import type { Recipe, StepTimer } from '#lib/types/recipe.ts';
	import { addMinute, pauseTimer, removeTimer, resumeTimer, startTimer, timerKey, timerState } from '#lib/stores/timers.svelte.ts';
	import { formatMinutes, formatRemaining, isLastMinute, remainingAt, timerChoices, timerStatus } from '#lib/timerMath.ts';

	interface Props {
		recipe: Pick<Recipe, 'slug' | 'title'>;
		stepIndex: number;
		stepTitle: string;
		timers: StepTimer[];
		/** Cook mode: no indent, bigger touch targets. */
		large?: boolean;
	}

	let { recipe, stepIndex, stepTitle, timers, large = false }: Props = $props();

	const chips = $derived(
		timers.flatMap((def) =>
			timerChoices(def).map((minutes) => ({
				minutes,
				label: def.label ?? stepTitle,
				key: timerKey(recipe.slug, stepIndex, minutes)
			}))
		)
	);
</script>

<div class="step-timers" class:large role="group" aria-label="Timere til trin {stepIndex + 1}">
	{#each chips as chip (chip.key)}
		{@const live = timerState.list.find((t) => t.key === chip.key)}
		{#if !live}
			<button
				type="button"
				class="chip"
				data-testid="timer-start"
				aria-label="Start {formatMinutes(chip.minutes)}, {chip.label}"
				onclick={() => startTimer({ recipeSlug: recipe.slug, recipeTitle: recipe.title, stepIndex, stepTitle, label: chip.label, minutes: chip.minutes })}
			>
				<Icon name="timer" size="1.1em" /> Start {formatMinutes(chip.minutes)}
			</button>
		{:else}
			{@const status = timerStatus(live)}
			<span class="chip live" class:last={isLastMinute(live, timerState.now)} class:done={status === 'done'} data-testid="timer-chip">
				<Icon name={status === 'done' ? 'check' : 'timer'} size="1.1em" />
				<time class="tabular-nums" datetime="PT{Math.ceil(remainingAt(live, timerState.now) / 1000)}S">
					{status === 'done' ? 'Færdig!' : formatRemaining(remainingAt(live, timerState.now))}
				</time>
				{#if status !== 'done'}
					<button
						type="button"
						class="mini"
						aria-label="{status === 'running' ? 'Pause' : 'Genoptag'} {chip.label}"
						onclick={() => (status === 'running' ? pauseTimer(live.id) : resumeTimer(live.id))}
					>
						<Icon name={status === 'running' ? 'pause' : 'play'} size="1.1rem" />
					</button>
					<button type="button" class="mini" aria-label="+1 minut, {chip.label}" onclick={() => addMinute(live.id)}>+1</button>
				{/if}
				<button type="button" class="mini" aria-label="{status === 'done' ? 'Fjern' : 'Nulstil'} timer {chip.label}" onclick={() => removeTimer(live.id)}>
					<Icon name={status === 'done' ? 'close' : 'reset'} size="1.1rem" />
				</button>
			</span>
		{/if}
	{/each}
</div>

<style>
	.step-timers {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0 1rem 1rem 3.75rem;
	}
	@media (min-width: 640px) {
		.step-timers {
			padding: 0 1.25rem 1.25rem 4rem;
		}
	}
	.step-timers.large {
		padding: 0;
		gap: 0.75rem;
	}
	.large .chip {
		min-height: 48px;
		padding: 0.5rem 1.1rem;
		font-size: 1.0625rem;
	}
	.large .mini {
		min-width: 48px;
		min-height: 48px;
		font-size: 1rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.5rem;
		padding: 0.35rem 0.9rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		color: inherit;
		background: color-mix(in oklab, var(--color-secondary-500) 22%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-secondary-500) 60%, transparent);
		transition: background-color 200ms, transform 200ms;
	}
	button.chip:hover {
		background: color-mix(in oklab, var(--color-secondary-500) 38%, transparent);
	}
	button.chip:active {
		transform: scale(0.96);
	}
	.chip.live {
		cursor: default;
		padding-right: 0.35rem;
	}
	.chip.live.last {
		background: color-mix(in oklab, var(--color-warning-500) 30%, transparent);
		border-color: var(--color-warning-500);
	}
	.chip.live.done {
		background: color-mix(in oklab, var(--color-success-500) 30%, transparent);
		border-color: var(--color-success-500);
	}
	.mini {
		min-width: 2rem;
		min-height: 2rem;
		padding: 0 0.4rem;
		display: inline-grid;
		place-items: center;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
		color: inherit;
		background: color-mix(in oklab, currentColor 10%, transparent);
	}
	.mini:hover {
		background: color-mix(in oklab, currentColor 20%, transparent);
	}
	:is(.chip, .mini):focus-visible {
		outline: 2px solid var(--color-secondary-500);
		outline-offset: 2px;
	}
</style>
