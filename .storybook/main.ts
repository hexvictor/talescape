import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
	],
	docs: {
		autodocs: "tag",
	},
	framework: {
		name: "@storybook/nextjs-vite",
		options: {},
	},
	staticDirs: ["../public"],
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	viteFinal: async (viteConfig) => ({
		...viteConfig,
		server: {
			...viteConfig.server,
			proxy: {
				...viteConfig.server?.proxy,
				"/api/uploadthing": {
					target:
						process.env.TALESCAPE_STORYBOOK_APP_ORIGIN ??
						"http://localhost:3000",
					changeOrigin: true,
				},
			},
		},
	}),
};

export default config;
