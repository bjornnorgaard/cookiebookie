import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	use: { baseURL: 'http://127.0.0.1:4180' },
	webServer: {
		command: 'ADAPTER=node npm run build && HOST=127.0.0.1 PORT=4180 node build',
		url: 'http://127.0.0.1:4180',
		timeout: 120_000,
	},
});
