const port = Number(process.env.LHCI_PORT || 4173);

module.exports = {
	ci: {
		collect: {
			startServerCommand: `npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
			startServerReadyPattern: 'Local:',
			url: [`http://127.0.0.1:${port}/`, `http://127.0.0.1:${port}/lasagne`],
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
