import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InspectorSelect } from "./InspectorValueFields";
const meta = {
	title: "Studio/Inspector/Select",
	component: InspectorSelect,
	args: {
		label: "Alignment",
		value: "center",
		options: [
			{ value: "center", label: "Center" },
			{ value: "start", label: "Start" },
		],
		onChange: () => {},
	},
} satisfies Meta<typeof InspectorSelect>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Disabled: StoryObj<typeof meta> = { args: { isDisabled: true } };
