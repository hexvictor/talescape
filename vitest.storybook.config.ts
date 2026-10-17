import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	optimizeDeps: {
		include: [
			"react-dom",
			"@tanstack/react-query",
			"@trpc/client",
			"@trpc/react-query",
			"superjson",
			"zustand",
			"zustand/middleware",
			"zustand/react/shallow",
			"zustand/vanilla",
		],
	},
	plugins: [
		storybookTest({
			configDir: path.join(directory, ".storybook"),
		}),
	],
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [{ browser: "chromium" }],
			provider: playwright({}),
		},
		name: "storybook",
	},
});
