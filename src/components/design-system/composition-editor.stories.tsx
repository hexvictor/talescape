import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { CompositionEditor } from "./composition-editor";

const meta = {
	title: "Design System/Compositions/Canvas",
	component: CompositionEditor,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CompositionEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.selectOptions(
			canvas.getByLabelText("New element"),
			"image",
		);
		await userEvent.click(canvas.getByRole("button", { name: "Add element" }));
		await expect(canvas.getByLabelText("Src")).toBeVisible();
		await expect(canvas.getByLabelText("Parent")).toHaveValue("1");
		await userEvent.click(canvas.getByRole("tab", { name: "Decorations" }));
		await expect(canvas.getByLabelText("Preset")).toBeVisible();
		await expect(canvas.queryByLabelText("Src")).not.toBeInTheDocument();
		await userEvent.selectOptions(
			canvas.getByLabelText("Preset"),
			"image-home",
		);
		await expect(
			(canvas.getByLabelText("Configuration") as HTMLTextAreaElement).value,
		).toContain('"image-home"');
		await userEvent.click(
			canvas.getByRole("button", { name: "Remove element 3" }),
		);
		await expect(
			canvasElement.querySelector('[data-composition-element="3"]'),
		).not.toBeInTheDocument();
	},
};
