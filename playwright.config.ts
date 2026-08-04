import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	expect: {
		timeout: 5_000,
	},
	fullyParallel: false,
	outputDir: "test-results/playwright",
	projects: [
		{
			name: "chromium-desktop",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox-desktop",
			use: { ...devices["Desktop Firefox"] },
		},
	],
	reporter: [["list"], ["html", { open: "never" }]],
	testDir: "./tests",
	timeout: 45_000,
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
		trace: "retain-on-failure",
	},
});
