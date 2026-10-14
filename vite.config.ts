import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import adapterNode from "@sveltejs/adapter-node";
import adapterVercel from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit({
		preprocess: vitePreprocess(),
		adapter: process.env.ADAPTER === "node" ? adapterNode() : adapterVercel({ runtime: 'nodejs24.x' }),
		paths: { origin: "https://cookiebookie.bybear.dk" },
		csp: {
			mode: "auto",
			directives: {
				"object-src": ["none"],
				"base-uri": ["self"],
			},
		},
	})],
});
