import adapterNode from "@sveltejs/adapter-node";
import adapterVercel from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const adapter =
    process.env.ADAPTER === "node" ? adapterNode() : adapterVercel();

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
        adapter,
        alias: {
            '$recipes': './src/recipes',
        },
        csp: {
            mode: "auto",
            directives: {
                "object-src": ["none"],
                "base-uri": ["self"],
            }
        },
    },
};

export default config;
