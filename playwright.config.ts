import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests/e2e',
	projects: [
		{
			name: 'chromium',
			use: { 
				browserName: 'chromium',
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'firefox',
			use: { 
				browserName: 'firefox',
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'webkit',
			use: { 
				browserName: 'webkit',
				viewport: { width: 1280, height: 720 }
			}
		}
	]
};

export default config;