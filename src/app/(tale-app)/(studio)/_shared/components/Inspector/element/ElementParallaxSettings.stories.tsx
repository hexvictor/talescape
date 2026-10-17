import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { defaultElementParallax } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderScene/ElementParallaxLayer";
import { ElementParallaxSettings } from "./ElementParallaxSettings";
const meta = {
	title: "Studio/Elements/Parallax",
	component: ElementParallaxSettings,
	args: { value: defaultElementParallax, onChange: () => {} },
} satisfies Meta<typeof ElementParallaxSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = {
	render: function Editor(args) {
		const [value, setValue] = useState(args.value);
		return (
			<div className="max-w-md">
				<ElementParallaxSettings value={value} onChange={setValue} />
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("spinbutton", { name: "Scroll depth Y" }),
		).toHaveValue(-0.15);
		await userEvent.click(canvas.getByRole("switch", { name: "Parallax" }));
		await expect(
			canvas.queryByRole("spinbutton", { name: "Scroll depth Y" }),
		).not.toBeInTheDocument();
	},
};
export const Disabled: Story = {
	args: { value: { ...defaultElementParallax, enabled: false } },
};
