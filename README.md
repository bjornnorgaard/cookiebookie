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

## Deploy

Deploy sker lokalt og kun når det bliver bedt om. `scripts/deploy.sh` (se skill'en
[deploy](.claude/skills/deploy/SKILL.md)) bygger Docker-imaget på din egen maskine, pusher det til GHCR og opdaterer
image-tagget i [deploy/mimir/services.yaml](deploy/mimir/services.yaml), så klyngen henter den nye version. Vercel bygger
`main` af sig selv ved push. GitHub-workflowet `Deploy` kører ikke længere automatisk; det kan kun startes manuelt.

## Lokal udvikling

`npm run dev` starter på http://127.0.0.1:5173.

## Validering

Brug Node 22.19 eller nyere. Installer med `npm ci`, og kør `npm run check`
og `npm run build`. Browser-tests kører mod Node-adapterens produktionsserver:

```sh
npx playwright install chromium
npm test
npm run audit:seo
```

SEO-audit kræver Chrome. Hvis port 4173 er optaget, kan du vælge en anden med
`LHCI_PORT=4175 npm run audit:seo`.

Se [dependency review](docs/dependency-review.md) for opgraderinger og kompatibilitetsbegrænsninger.
