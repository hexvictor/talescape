import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ComponentEditor } from "../design-system/component-editor";
import { PageShell } from "./page-shell";
const meta = {
	title: "Design System/Components/PageShell",
	component: PageShell,
	tags: ["autodocs"],
} satisfies Meta<typeof PageShell>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PageEditor: Story = {
	render: () => <ComponentEditor kind="page" />,
};
export const Background: Story = {
	args: {
		decorations: "page-editorial",
		className: "min-h-96 p-10",
		children: "Ember City",
	},
};

export const CustomDecorationArray: Story = {
	args: {
		decorations: [
			{ type: "background-texture", variant: "paper", opacity: 0.15 },
		],
		shapes: "cut-opposite",
		children: "Custom page surface",
		className: "p-10",
	},
};

export const RemainingSpace: Story = {
	render: () => (
		<div className="flex h-96 flex-col" data-testid="page-layout">
			<header className="h-16 shrink-0 border-b p-4">Header</header>
			<main className="flex flex-1 flex-col">
				<PageShell
					className="grid place-items-center"
					data-testid="page-content"
				>
					Page content
				</PageShell>
			</main>
			<footer className="h-12 shrink-0 border-t p-3">Footer</footer>
		</div>
	),
	play: async ({ canvas }) => {
		const layout = canvas.getByTestId("page-layout");
		const content = canvas.getByTestId("page-content");
		await expect(content.getBoundingClientRect().height).toBe(272);
		await expect(layout.scrollHeight).toBe(layout.clientHeight);
	},
};
