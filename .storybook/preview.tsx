import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/globals.css";

const preview: Preview = {
	decorators: [
		(Story, context) => (
			<div
				className={context.globals.theme === "dark" ? "dark" : undefined}
				style={
					{
						"--font-bangers": '"DejaVu Sans Condensed"',
						"--font-geist-sans":
							'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
					} as React.CSSProperties
				}
			>
				<div className="site-paper min-h-screen bg-background p-6 text-foreground">
					<Story />
				</div>
			</div>
		),
	],
	globalTypes: {
		theme: {
			description: "Talescape color theme",
			toolbar: {
				dynamicTitle: true,
				icon: "paintbrush",
				items: [
					{ right: "Light", title: "Light", value: "light" },
					{ right: "Dark", title: "Dark", value: "dark" },
				],
			},
		},
	},
	initialGlobals: {
		theme: "light",
	},
	parameters: {
		a11y: {
			test: "todo",
		},
		controls: {
			expanded: true,
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		layout: "fullscreen",
		viewport: {
			options: {
				desktop: {
					name: "Desktop",
					styles: { height: "900px", width: "1440px" },
					type: "desktop",
				},
				mobile: {
					name: "Mobile",
					styles: { height: "844px", width: "390px" },
					type: "mobile",
				},
				tablet: {
					name: "Tablet",
					styles: { height: "1024px", width: "768px" },
					type: "tablet",
				},
			},
		},
	},
};

export default preview;
