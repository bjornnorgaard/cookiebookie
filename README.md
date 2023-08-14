# Cookie Bookie
En lille opskriftsamling og SEO legeplads.

## Tilføj opskrift
Sådan her tilføjes nye opskrifter.

- Opskrifterne findes i mappen [website/src/recipes](website/src/recipes).
- Tilføj en ny opskrift ved at oprette en fil i mappen.
- Overhold formatet vist i de andre opskrifter.
- Tilføje opskrifen til [website/src/lib/data/recipes.ts](website/src/lib/data/recipes.ts).
- Opret et PR på GitHub.

Så ruller det automatisk ud, når jeg engang godkender ændringen.
## Developing
How to get setup and going.

```sh
$ git clone <method>/bjornnorgaard/cookiebookie.git

$ pwd
    .../cookiebookie

$ ls
    README.md	monitor		website

$ cd website

$ pwd
    .../cookiebookie/website

$ npm i
    changed 42 packages, and audited 1337 packages in 123ms

$ npm run dev

    VITE v4.x.x  ready in 321 ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
    ➜  press h to show help

```
