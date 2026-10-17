import type { Preview } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { StoryPropertiesEditor } from "../src/components/design-system/story-properties-editor";
import "../src/styles/globals.css";
import "../src/styles/storybook-editors.css";

const preview: Preview = {
	decorators: [
		(Story, context) => {
			const [args, updateArgs] = useArgs();
			return (
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
					<div
						data-storybook-preview-surface="true"
						className="bg-background p-6 text-foreground"
					>
						{context.parameters.componentEditor ? (
							<StoryPropertiesEditor
								name={
									context.parameters.editorName ??
									context.title.split("/").at(-1)
								}
								args={args}
								componentName={
									context.parameters.editorComponentName ??
									(
										context.component as
											| { displayName?: string; name?: string }
											| undefined
									)?.displayName ??
									(context.component as { name?: string } | undefined)?.name
								}
								argTypes={context.argTypes}
								onChange={updateArgs}
							>
								<Story />
							</StoryPropertiesEditor>
						) : (
							<Story />
						)}
					</div>
				</div>
			);
		},
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
		options: {
			storySort: {
				order: [
					"Design System",
					[
						"Components",
						"Forms",
						"Decorations",
						"Compositions",
						"Layout",
						"Data Display",
						"Overlay",
						"Feedback",
						"Navigation",
						"Foundations",
					],
					"Studio",
				],
			},
		},
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
