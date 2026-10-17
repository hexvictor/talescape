import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { DecorationsWorkbench } from "./decorations-workbench";
const meta = {
	title: "Design System/Decorations/GeometricShape",
	component: DecorationsWorkbench,
	args: { initialType: "geometric", lockType: true },
} satisfies Meta<typeof DecorationsWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = {
	render: () => <DecorationsWorkbench initialType="geometric" lockType />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.selectOptions(canvas.getByLabelText("Shape"), "cross-grid");
		await userEvent.clear(canvas.getByLabelText("Quantity value"));
		await userEvent.type(canvas.getByLabelText("Quantity value"), "64");
		expect(
			canvasElement.querySelectorAll('[data-decoration-type="geometric"] path'),
		).toHaveLength(64);
	},
};
