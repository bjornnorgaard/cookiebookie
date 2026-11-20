<script lang="ts">
	import Head from '#lib/components/Head.svelte';
	import ConsentButtons from '#lib/components/ConsentButtons.svelte';
	import { consent, setConsent } from '#lib/stores/consent.svelte.ts';

	const statusText = $derived(
		consent.status === 'granted'
			? 'Besøgstælling er slået til. Tak, det sætter jeg pris på.'
			: consent.status === 'denied'
				? consent.gpc
					? 'Besøgstælling er slået fra. Din browser siger allerede nej via Global Privacy Control, og det respekterer jeg. Du kan stadig skifte mening herunder.'
					: 'Besøgstælling er slået fra. Helt i orden, ingen hårde følelser.'
				: 'Du har ikke valgt endnu, så indtil videre er den slået fra.'
	);
</script>

<Head
	path="/privatliv"
	titleOverride="Privatliv | Cookie Bookie"
	descriptionOverride="Hvad Cookie Bookie gemmer om dig, hvorfor, og hvordan du siger nej til besøgstælling."
/>

<article class="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
	<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Privatliv</h1>
	<p class="mt-3 font-display text-lg italic text-primary-700-300">
		Kort fortalt: ingen reklamer, intet salg af data, og du bestemmer. Resten er den lange version, for det skal jeg.
	</p>

	<section class="panel mt-8 rounded-3xl p-5 sm:p-6" aria-labelledby="valg">
		<h2 id="valg" class="m-0 font-display text-2xl font-semibold">Dit valg</h2>
		<p class="mb-4 mt-2" aria-live="polite">{consent.ready ? statusText : ''}</p>
		<ConsentButtons onchoose={setConsent} />
		<p class="mb-0 mt-3 text-sm opacity-80">
			Jeg er bare nysgerrig, og det er hyggeligt at vide, at nogen er derude. Men siger du nej, er det helt fint. Du kan altid skifte mening her
			eller via "Privatlivsindstillinger" nederst på siden.
		</p>
	</section>

	<div class="prose mt-10 max-w-none dark:prose-invert">
		<h2>Hvem står bag</h2>
		<p>
			Det er mig: Bjørn Nørgaard (by Bear). Jeg er dataansvarlig for cookiebookie.dk, hvilket lyder federe, end det er. Du
			kan skrive til mig på <a href="mailto:bjornsnorgaard@gmail.com">bjornsnorgaard@gmail.com</a>, eller finde mig via
			linkene nederst på siden (LinkedIn eller GitHub).
		</p>

		<h2>Hvad jeg samler ind</h2>
		<p>
			Kun hvis du siger ja, kigger Google Analytics (Google Ireland Ltd. og Google LLC) med. Google får så at vide,
			hvilke sider du ser, cirka hvor i verden du sidder, hvilken slags enhed og browser du bruger, og hvordan du fandt
			herhen. Det sker med cookies, der starter med <code>_ga</code>, så Google kan kende din browser igen. Jeg får tal og
			grafer, ikke navne.
		</p>
		<p>
			Siger du nej, eller sender din browser Global Privacy Control, hentes der ingenting fra Google, og der sættes ingen
			analysecookies. Sådan skal det være.
		</p>

		<h2>Hvorfor</h2>
		<p>
			For at se, hvilke opskrifter der faktisk bliver læst, så jeg ved, hvad der er værd at lave flere af. Og for at få
			bekræftet, at der kommer andre end min mor. Der er ingen reklamer og ingen markedsføring.
		</p>

		<h2>Hvorfor må jeg det</h2>
		<p>
			Fordi du siger ja (GDPR artikel 6, stk. 1, litra a). Du kan trække det tilbage når som helst, og det er lige så let
			at sige nej som ja. Jeg har ikke gemt nej-knappen væk.
		</p>

		<h2>Hvor længe</h2>
		<p>
			Cookies fra Google Analytics gemmes i op til 2 år i din browser. Jeg spørger dig igen efter 12 måneder. Hvor længe
			Google selv opbevarer data, afhænger af indstillingerne i min Analytics-konto.
		</p>

		<h2>Turen til USA</h2>
		<p>Google kan behandle data i USA. Det sker kun, hvis du har sagt ja.</p>

		<h2>Sådan fortryder du</h2>
		<p>
			Tryk "Nej tak" ovenfor. Så stopper målingen med det samme, og Analytics-cookies på cookiebookie.dk bliver slettet.
			Dit valg gemmes kun i din egen browser (i <code>localStorage</code>, under nøglen <code>consent</code>), ikke hos
			mig.
		</p>

		<h2>Dine rettigheder</h2>
		<p>
			Du kan bede om indsigt i, rettelse af eller sletning af oplysninger om dig. Du kan også klage til
			<a href="https://www.datatilsynet.dk" rel="noopener noreferrer nofollow external" target="_blank">Datatilsynet</a>,
			hvis jeg skulle finde på at opføre mig dårligt.
		</p>

		<h2>Resten af siden</h2>
		<p>
			Afkrydsninger, "hold skærmen tændt", lys/mørk tilstand og lignende små indstillinger gemmes kun i din browser og
			forlader aldrig din enhed. De skal jeg ikke bruge til noget.
		</p>
	</div>
</article>
