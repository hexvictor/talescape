import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
const meta = {
	title: "Design System/Forms/Select",
	component: Select,
	tags: ["autodocs"],
	args: {
		"aria-label": "Visibility",
		defaultValue: "private",
		children: (
			<>
				<SelectTrigger>
					<SelectValue placeholder="Choose visibility" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="private">Private</SelectItem>
					<SelectItem value="public">Public</SelectItem>
					<SelectItem value="unlisted">Unlisted</SelectItem>
				</SelectContent>
			</>
		),
	},
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Disabled: Story = { args: { isDisabled: true } };
export const Invalid: Story = { args: { isInvalid: true } };
export const Empty: Story = { args: { defaultValue: undefined } };
