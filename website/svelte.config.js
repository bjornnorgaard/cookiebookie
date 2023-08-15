import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        alias: {
            '$recipes': './src/recipes',
        },
        csp: {
            mode: "auto",
            directives: {
                "script-src": ["self", "unsafe-inline"],
                "object-src": ["none"],
                "base-uri": ["self"],
            }
        },
    },
};

export default config;
