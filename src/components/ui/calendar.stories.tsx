import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Calendar } from "./calendar";
const meta = {
	title: "Design System/Forms/Calendar",
	component: Calendar,
	tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const month = c.getByRole("heading").textContent;
		await userEvent.click(c.getByRole("button", { name: "Next month" }));
		await expect(c.getByRole("heading")).not.toHaveTextContent(month ?? "");
	},
};
export const Disabled: Story = { args: { isDisabled: true } };
export const ReadOnly: Story = { args: { isReadOnly: true } };
