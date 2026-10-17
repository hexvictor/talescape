import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./switch";
const meta = {
	title: "Design System/Forms/Toggle",
	component: Switch,
	tags: ["autodocs"],
	args: { children: "Enable notifications" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const s = c.getByRole("switch");
		await userEvent.click(s);
		await expect(s).toBeChecked();
		await userEvent.keyboard(" ");
		await expect(s).not.toBeChecked();
	},
};
export const Selected: Story = { args: { defaultSelected: true } };
export const Compact: Story = { args: { density: "compact" } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DisabledSelected: Story = {
	args: { isDisabled: true, defaultSelected: true },
};
