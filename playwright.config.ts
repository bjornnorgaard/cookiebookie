import { defineConfig } from '@playwright/test';

// TEST_PORT lets several checkouts run the suite at once without colliding.
const port = Number(process.env.TEST_PORT || 4180);

export default defineConfig({
	testDir: './tests',
	use: { baseURL: `http://127.0.0.1:${port}` },
	webServer: {
		command: `ADAPTER=node npm run build && HOST=127.0.0.1 PORT=${port} node server.js`,
		url: `http://127.0.0.1:${port}`,
		timeout: 120_000,
	},
});
