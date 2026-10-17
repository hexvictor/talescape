import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Slider } from "./slider";
const meta = {
	title: "Design System/Forms/Slider",
	component: Slider,
	tags: ["autodocs"],
	args: { label: "Intensity", defaultValue: 40 },
	decorators: [
		(Story) => (
			<div className="max-w-sm">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Compact: Story = { args: { density: "compact" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
export const Disabled: Story = { args: { isDisabled: true } };
