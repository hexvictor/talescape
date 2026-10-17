import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";
const meta = {
	title: "Design System/Forms/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	args: { children: "Include in library" },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Selected: Story = { args: { defaultSelected: true } };
export const Compact: Story = { args: { density: "compact" } };
export const Disabled: Story = { args: { isDisabled: true } };
export const Indeterminate: Story = { args: { isIndeterminate: true } };
