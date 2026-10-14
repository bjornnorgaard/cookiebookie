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
