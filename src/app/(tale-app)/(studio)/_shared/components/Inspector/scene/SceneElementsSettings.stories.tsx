import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SceneElementsSettings } from "./SceneElementsSettings";
const meta = {
	title: "Studio/Scenes/Elements",
	component: SceneElementsSettings,
	args: { elements: [], onCreate: fn(), onOpen: fn(), onRemove: fn() },
} satisfies Meta<typeof SceneElementsSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const AddSceneElement: Story = {
	play: async ({ canvasElement, args }) => {
		await userEvent.click(
			within(canvasElement).getByRole("button", { name: "Add element" }),
		);
		const dialog = within(document.body).getByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: /^Add$/ }),
		);
		await expect(args.onCreate).toHaveBeenCalledWith(
			expect.objectContaining({ type: "text", label: "Text element" }),
		);
	},
};
