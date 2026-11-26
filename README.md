# Cookie Bookie
En lille opskriftsamling og SEO legeplads.

## Tilføj opskrift
Sådan her tilføjes nye opskrifter.

- Opskrifterne findes i mappen [website/src/recipes](src/recipes).
- Tilføj en ny opskrift ved at oprette en fil i mappen.
- Overhold formatet vist i de andre opskrifter.
- Tilføje opskrifen til [website/src/lib/data/recipes.ts](src/lib/data/recipes.ts).
- Opret et pull request.

Så ruller det automatisk ud, når jeg engang godkender ændringen.

## Billeder

Originale fotos lægges i [photos](photos) som `<slug>.jpg` (fx `sørens pastaret.jpg` bliver til `sorens-pastaret`).
De originale filer bliver aldrig ændret. Kør:

```sh
npm run images            # genererer kun nye/ændrede fotos
npm run images -- --force # genererer alt igen
```

Det laver AVIF/WebP/JPEG i flere størrelser i `static/images/recipes/<slug>/` samt manifestet
`src/lib/data/images.generated.json`. Commit de genererede filer. Opskrifter uden eget foto bruger `placeholder.jpg`.

## Skrifttyper

`npm run fonts` skærer Fraunces og Inter ned til de tegn, siderne bruger, og skriver `src/lib/fonts/` (woff2-filer og
`fonts.css` med fallback-skrifter, der fylder det samme, så teksten ikke hopper). Kræver `pip install fonttools brotli`
(eller `PYFTSUBSET=/sti/til/pyftsubset`). Ret tegnlisten `CORE` i `scripts/subset-fonts.mjs` og commit resultatet.

## Deploy

Push til `main` er et produktionsdeploy: GitHub-workflowet `Deploy` bygger Docker-imaget, pusher det til GHCR og
opdaterer image-tagget i [deploy/mimir/services.yaml](deploy/mimir/services.yaml), så klyngen henter den nye version.
Vercel bygger også `main` ved push. Bagefter sættes testmiljøet
([deploy/mimir/services.test.yaml](deploy/mimir/services.test.yaml)) til samme tag, så test og produktion er ens.
`scripts/deploy-test.sh <branch|tag|sha>` deployer noget andet til test, og `scripts/deploy.sh` er den lokale
nødløsning, hvis Actions ikke kører. Se skill'en [deploy](.claude/skills/deploy/SKILL.md).

## Lokal udvikling

`npm run dev` starter på http://127.0.0.1:5173.

## Validering

Brug Node 22.19 eller nyere. Installer med `npm ci`, og kør `npm run check`
og `npm run build`. Browser-tests kører mod Node-adapterens produktionsserver:

```sh
npx playwright install chromium
npm test                      # funktionstests, axe-tilgængelighed (tests/a11y.spec.ts) og billedbudgetter
npm run audit:lighthouse      # Lighthouse CI, mobil og desktop (kræver Chrome)
npm run images:check          # størrelsesbudgetter for de genererede billeder
```

Produktionsserveren startes med `node server.js` efter `ADAPTER=node npm run build`. Den pakker adapter-nodes server
ind og giver billeder med `?v=<hash>` i URL'en et års cache.

`TEST_PORT=4202 npm test` vælger en anden port til testserveren. Lighthouse bygger selv med Node-adapteren og
kører mod `/`, `/lasagne`, `/tomatsalat` og en 404-side; hvis port 4173 er optaget, vælg en anden med
`LHCI_PORT=4211 npm run audit:lighthouse`. `LHCI_RUNS=1 npm run audit:lighthouse -- --no-build` giver en hurtig, mere
støjende kørsel på et eksisterende build. `npm run audit:seo` er et alias. Grænseværdierne står i
[lighthouserc.cjs](lighthouserc.cjs) og [budget.json](budget.json), begrundelsen i
[docs/specs/03-quality-gates.md](docs/specs/03-quality-gates.md).

Nye UI-tilstande (samtykke, timere, kogetilstand, deling) tilføjes som en post i `STATES` i `tests/a11y.spec.ts`, så
axe scanner dem i lys og mørk på telefon og desktop.

Se [dependency review](docs/dependency-review.md) for opgraderinger og kompatibilitetsbegrænsninger.
