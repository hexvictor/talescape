import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ComboBox } from "./combobox";
const meta = {
	title: "Design System/Forms/Combobox",
	component: ComboBox,
	tags: ["autodocs"],
	args: {
		label: "Genre",
		options: [
			{ id: "fantasy", label: "Fantasy" },
			{ id: "scifi", label: "Science fiction" },
			{ id: "mystery", label: "Mystery" },
		],
		placeholder: "Search genres",
	},
	decorators: [
		(Story) => (
			<div className="max-w-sm">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ComboBox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole("combobox"), "Myst");
		await userEvent.click(
			await within(document.body).findByRole("option", { name: "Mystery" }),
		);
		await expect(c.getByRole("combobox")).toHaveValue("Mystery");
	},
};
export const Compact: Story = { args: { density: "compact" } };
export const Disabled: Story = {
	args: { isDisabled: true, defaultValue: "fantasy" },
};
export const Invalid: Story = { args: { isInvalid: true } };
export const Empty: Story = { args: { options: [] } };
