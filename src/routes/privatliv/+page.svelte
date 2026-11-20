<script lang="ts">
	import Head from '#lib/components/Head.svelte';
	import ConsentButtons from '#lib/components/ConsentButtons.svelte';
	import { consent, setConsent } from '#lib/stores/consent.svelte.ts';

	const statusText = $derived(
		consent.status === 'granted'
			? 'Besøgstælling er slået til.'
			: consent.status === 'denied'
				? consent.gpc
					? 'Besøgstælling er slået fra. Din browser sender Global Privacy Control, og det respekterer jeg.'
					: 'Besøgstælling er slået fra.'
				: 'Du har ikke valgt endnu. Indtil da er besøgstælling slået fra.'
	);
</script>

<Head
	path="/privatliv"
	titleOverride="Privatliv | Cookie Bookie"
	descriptionOverride="Hvad Cookie Bookie gemmer om dig, hvorfor, og hvordan du siger nej til besøgstælling."
/>

<article class="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
	<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Privatliv</h1>
	<p class="mt-3 font-display text-lg italic text-primary-700-300">Kort fortalt: ingen reklamer, intet salg af data, og du bestemmer.</p>

	<section class="panel mt-8 rounded-3xl p-5 sm:p-6" aria-labelledby="valg">
		<h2 id="valg" class="m-0 font-display text-2xl font-semibold">Dit valg</h2>
		<p class="mb-4 mt-2" aria-live="polite">{consent.ready ? statusText : ''}</p>
		<ConsentButtons onchoose={setConsent} />
		<p class="mb-0 mt-3 text-sm opacity-80">Du kan altid ændre dit valg her eller via "Privatlivsindstillinger" nederst på siden.</p>
	</section>

	<div class="prose mt-10 max-w-none dark:prose-invert">
		<h2>Hvem er ansvarlig</h2>
		<p>
			Bjørn Nørgaard (by Bear) er dataansvarlig for cookiebookie.dk. Du kan kontakte mig via linkene nederst på siden
			(LinkedIn eller GitHub).
		</p>

		<h2>Hvad jeg indsamler</h2>
		<p>
			Kun hvis du siger ja, bruger jeg Google Analytics (Google Ireland Ltd. og Google LLC) til at tælle besøg. Google får
			da oplyst, hvilke sider du ser, cirka hvor i verden du er, hvilken slags enhed og browser du bruger, og hvordan du
			kom hen til siden. Google sætter cookies, der starter med <code>_ga</code>, for at kunne kende en browser igen.
		</p>
		<p>Siger du nej, eller sender din browser Global Privacy Control, hentes intet fra Google, og der sættes ingen analysecookies.</p>

		<h2>Hvorfor</h2>
		<p>For at se, hvilke opskrifter der bliver læst, så jeg ved, hvad der er værd at lave flere af. Der er ingen reklamer og ingen markedsføring.</p>

		<h2>Hvorfor må jeg det</h2>
		<p>Dit samtykke (GDPR artikel 6, stk. 1, litra a). Du kan trække det tilbage når som helst, og det er lige så let at sige nej som ja.</p>

		<h2>Hvor længe</h2>
		<p>
			Cookies fra Google Analytics gemmes i op til 2 år i din browser. Jeg beder dig om at vælge igen efter 12 måneder.
			Hvor længe Google selv opbevarer data, afhænger af indstillingerne i min Analytics-konto.
		</p>

		<h2>Overførsel til USA</h2>
		<p>Google kan behandle data i USA. Det sker kun, hvis du har sagt ja.</p>

		<h2>Sådan trækker du dit samtykke tilbage</h2>
		<p>
			Tryk "Nej tak" ovenfor. Så stopper målingen med det samme, og Analytics-cookies på cookiebookie.dk bliver slettet.
			Dit valg gemmes kun i din egen browser (i <code>localStorage</code>, under nøglen <code>consent</code>).
		</p>

		<h2>Dine rettigheder</h2>
		<p>
			Du kan bede om indsigt i, rettelse af eller sletning af oplysninger om dig. Du kan også klage til
			<a href="https://www.datatilsynet.dk" rel="noopener noreferrer nofollow external" target="_blank">Datatilsynet</a>.
		</p>

		<h2>Andet på siden</h2>
		<p>
			Opskrifternes afkrydsninger og indstillingen "hold skærmen tændt" gemmes kun i din browser og forlader aldrig din
			enhed.
		</p>
	</div>
</article>
