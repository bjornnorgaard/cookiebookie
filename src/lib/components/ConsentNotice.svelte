<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { consent, initConsent, setConsent } from '#lib/stores/consent.svelte.ts';
	import ConsentButtons from '#lib/components/ConsentButtons.svelte';

	let reduced = $state(false);
	let confirmation = $state('');
	let pill = $state(false);
	let timers: ReturnType<typeof setTimeout>[] = [];

	// First ask appears about 1.5 s after the page is up, so it never competes with the first paint.
	onMount(() => {
		initConsent();
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (consent.ready && consent.status === 'unknown') {
			timers.push(setTimeout(() => {
				if (consent.status === 'unknown') consent.open = true;
			}, 1500));
		}
		return () => timers.forEach(clearTimeout);
	});

	// After a choice: announce it, show a small pill for a moment, then let it go.
	$effect(() => {
		const saved = consent.justSaved;
		if (!saved) {
			confirmation = '';
			pill = false;
			return;
		}
		confirmation = saved === 'granted' ? 'Gemt. Besøgstælling er slået til. Tak.' : 'Gemt. Besøgstælling er slået fra. Ingen hårde følelser.';
		pill = true;
		const t = setTimeout(() => (pill = false), 2600);
		return () => clearTimeout(t);
	});

	const dur = $derived(reduced ? 0 : 380);
</script>

<!-- Always mounted so screen readers pick up the change. -->
<p class="sr-only" aria-live="polite" role="status">{confirmation}</p>

{#if consent.open}
	<div class="consent panel" role="region" aria-label="Privatliv" transition:fly={{ y: 24, duration: dur }}>
		<h2 class="m-0 flex items-center gap-2 font-display text-lg font-semibold leading-tight">
			<span aria-hidden="true">🍪</span> Er der nogen derude?
		</h2>
		<p class="mb-3 mt-2 text-sm leading-relaxed">
			Må jeg bruge Google Analytics til at se, om nogen overhovedet laver den lasagne? Ingen reklamer, intet salg af data.
			<a href="/privatliv" class="font-semibold underline underline-offset-2">Det med småt</a>
		</p>
		<ConsentButtons onchoose={setConsent} />
		<p class="mb-0 mt-3 text-xs leading-snug opacity-80">
			Det betyder meget for mig. Men siger du nej, er vi stadig venner.
		</p>
	</div>
{:else if pill}
	<div class="consent consent-pill panel" aria-hidden="true" transition:fly={{ y: 12, duration: dur }}>
		<span>{consent.status === 'granted' ? '🍪' : '👍'}</span> {consent.status === 'granted' ? 'Tak!' : 'Helt i orden'}
	</div>
{/if}

<style>
	.consent {
		position: fixed;
		z-index: 40; /* below the sticky header (z-50) and its dropdowns */
		left: max(1rem, env(safe-area-inset-left));
		right: max(1rem, env(safe-area-inset-right));
		bottom: max(1rem, env(safe-area-inset-bottom));
		padding: 1rem 1.1rem 1.1rem;
		border-radius: 1.25rem;
		/* Opaque enough to stay readable over any recipe photo, in both modes. */
		--panel-tint: 22%;
	}
	@media (min-width: 640px) {
		.consent {
			right: auto;
			width: 380px;
		}
	}
	.consent-pill {
		right: auto;
		width: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}
</style>
