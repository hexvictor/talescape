import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { DecorationsWorkbench } from "./decorations-workbench";
const meta = {
	title: "Design System/Decorations/BackgroundTexture",
	component: DecorationsWorkbench,
	args: { initialType: "background-texture", lockType: true },
} satisfies Meta<typeof DecorationsWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = {
	render: () => (
		<DecorationsWorkbench initialType="background-texture" lockType />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const svg = canvasElement.querySelector(".ts-decoration-texture");
		expect(svg).toBeTruthy();
		const initial = svg?.innerHTML;
		await userEvent.selectOptions(canvas.getByLabelText("Variant"), "grunge");
		expect(svg?.innerHTML).not.toBe(initial);
		await userEvent.selectOptions(canvas.getByLabelText("Density"), "packed");
		expect(svg?.querySelectorAll("defs > g > *").length).toBe(1152);
		const parent = svg?.parentElement;
		expect(svg?.getBoundingClientRect().x).toBeCloseTo(
			parent?.getBoundingClientRect().x ?? 0,
			1,
		);
		expect(svg?.getBoundingClientRect().y).toBeCloseTo(
			parent?.getBoundingClientRect().y ?? 0,
			1,
		);
		expect(svg?.getBoundingClientRect().width).toBeCloseTo(
			parent?.getBoundingClientRect().width ?? 0,
			1,
		);
		expect(svg?.getBoundingClientRect().height).toBeCloseTo(
			parent?.getBoundingClientRect().height ?? 0,
			1,
		);
	},
};
