import adapter from "@sveltejs/adapter-vercel";
import {vitePreprocess} from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        csp: {
            mode: "auto",
            directives: {
                'script-src': ['self', 'https://www.googletagmanager.com', 'sha256-VRJyNfT3gVq5KIUtisltIhZcOVQFEu1WDXZF3iJBKlY='],
                "object-src": ["none"],
                "base-uri": ["self"],
            },
        },
    },
};

export default config;
