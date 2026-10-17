import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Input from "./input";
const meta = {
	title: "Design System/Forms/Text Input",
	component: Input,
	tags: ["autodocs"],
	args: { "aria-label": "Title", placeholder: "Title" },
	decorators: [
		(Story) => (
			<div className="max-w-sm">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Compact: Story = { args: { density: "compact" } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
	args: { "aria-invalid": true, defaultValue: "Invalid title" },
};
export const Numeric: Story = {
	args: { type: "number", min: 0, max: 100, defaultValue: 25 },
};
