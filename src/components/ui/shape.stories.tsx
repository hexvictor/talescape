import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ComponentEditor } from "../design-system/component-editor";
import { Shape } from "./shape";

const meta = {
	title: "Design System/Components/Shape",
	component: Shape,
	tags: ["autodocs"],
} satisfies Meta<typeof Shape>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ShapeEditor: Story = {
	render: () => <ComponentEditor kind="shape" />,
};
export const ComposedSteps: Story = {
	render: () => (
		<Shape
			shapes={[
				{ type: "step", position: "top-left-h", direction: "outward", size: 5 },
				{
					type: "step",
					position: "top-right-h",
					direction: "outward",
					size: 10,
				},
				{
					type: "step",
					position: "top-center",
					direction: "outward",
					size: 15,
					width: 80,
				},
				{ type: "corner", position: "bottom-right", size: 24 },
			]}
			shadow
			surfaceClassName="bg-card p-10"
			style={{ width: 420, minHeight: 200 }}
		>
			Ember City
		</Shape>
	),
	play: async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText("Ember City")).toBeVisible();
		await expect(
			canvasElement.querySelector('[data-reader-role="shape-border"] path'),
		).toBeInTheDocument();
	},
};
