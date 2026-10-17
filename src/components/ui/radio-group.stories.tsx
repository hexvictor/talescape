import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Radio, RadioGroup } from "./radio-group";
const meta = {
	title: "Design System/Forms/Radio Buttons",
	component: RadioGroup,
	tags: ["autodocs"],
	args: {
		"aria-label": "Visibility",
		defaultValue: "private",
		children: (
			<>
				<Radio value="private">Private</Radio>
				<Radio value="public">Public</Radio>
				<Radio value="unlisted">Unlisted</Radio>
			</>
		),
	},
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Compact: Story = {
	args: {
		children: (
			<>
				<Radio density="compact" value="private">
					Private
				</Radio>
				<Radio density="compact" value="public">
					Public
				</Radio>
			</>
		),
	},
};
export const Disabled: Story = { args: { isDisabled: true } };
export const Invalid: Story = { args: { isInvalid: true } };
