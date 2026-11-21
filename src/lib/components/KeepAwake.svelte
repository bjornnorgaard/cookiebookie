<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { setKeepAwake, wake } from '#lib/stores/wakeLock.svelte.ts';
</script>

{#if wake.supported}
	<div class="panel flex items-center gap-4 rounded-2xl p-4" style="--panel-accent: var(--color-warning-500)">
		<Icon name={wake.enabled ? 'sun' : 'moon'} size="1.75rem" />
		<div class="min-w-0 grow">
			<p class="m-0 font-semibold" id="keep-awake-label">Hold skærmen tændt</p>
			<p class="m-0 text-sm opacity-70">Så den ikke slukker, mens du står med mel til albuerne.</p>
		</div>
		<button
			type="button"
			role="switch"
			aria-checked={wake.enabled}
			aria-labelledby="keep-awake-label"
			class="switch"
			onclick={() => setKeepAwake(!wake.enabled)}
		>
			<span class="knob"></span>
		</button>
	</div>
{/if}

<style>
	.switch {
		position: relative;
		flex: none;
		width: 3.25rem;
		height: 1.9rem;
		border-radius: 9999px;
		border: 2px solid color-mix(in oklab, currentColor 35%, transparent);
		background: transparent;
		cursor: pointer;
		transition: background-color 300ms, border-color 300ms, box-shadow 300ms;
	}
	.switch:hover {
		box-shadow: 0 0 0 5px color-mix(in oklab, var(--color-warning-500) 20%, transparent);
	}
	.switch[aria-checked='true'] {
		background: var(--color-warning-500);
		border-color: var(--color-warning-500);
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 0.2rem;
		width: 1.2rem;
		height: 1.2rem;
		border-radius: 9999px;
		background: currentColor;
		transform: translateY(-50%);
		transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms;
	}
	.switch[aria-checked='true'] .knob {
		transform: translate(1.35rem, -50%);
		background: white;
	}
	@media (prefers-reduced-motion: reduce) {
		.knob,
		.switch {
			transition: none;
		}
	}
</style>
