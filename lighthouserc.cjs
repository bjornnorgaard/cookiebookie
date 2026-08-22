/** @type {import('@lhci/cli').Config} */
module.exports = {
	ci: {
		collect: {
			startServerCommand: 'npx vite preview --host 127.0.0.1 --port 4173',
			startServerReadyPattern: 'Local:',
			url: ['http://127.0.0.1:4173/', 'http://127.0.0.1:4173/lasagne'],
			numberOfRuns: 1,
			settings: {
				onlyCategories: ['seo'],
				chromeFlags: '--headless --no-sandbox --disable-gpu'
			}
		},
		assert: {
			assertions: {
				'categories:seo': ['error', { minScore: 1 }],
				'robots-txt': 'error',
				'structured-data': 'off'
			}
		},
		upload: {
			target: 'filesystem',
			outputDir: '.lighthouseci'
		}
	}
};
