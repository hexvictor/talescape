import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressBar } from "./progress-bar";
const meta = {
	title: "Design System/Components/ProgressBar",
	component: ProgressBar,
	args: { value: 40, className: "w-72" },
	tags: ["autodocs"],
} satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100 } };
