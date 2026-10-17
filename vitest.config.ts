import { defineConfig } from "vitest/config";

export default defineConfig({
	oxc: { jsx: { runtime: "automatic" } },
	resolve: { alias: { "~": new URL("./src", import.meta.url).pathname } },
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
});
