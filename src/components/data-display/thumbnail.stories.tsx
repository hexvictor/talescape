import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { imageDecorationPresets } from "../decorations/types";
import { Thumbnail } from "./thumbnail";
const meta = {
	title: "Design System/Components/Thumbnail",
	component: Thumbnail,
	args: {
		src: "/assets/site/ember-city-light.png",
		alt: "Ember City",
		className: "h-36 w-64",
		shapes: [],
		selected: false,
		disabled: false,
		fit: "cover",
	},
	argTypes: {
		decorations: {
			control: "select",
			options: [undefined, ...imageDecorationPresets],
		},
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Thumbnail>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Shaped: Story = {
	args: {
		shapes: [
			{ type: "corner", position: "top-left", size: 24 },
			{ type: "step", position: "bottom-right-h", size: 24 },
		],
		decorations: "image-home",
		shadow: true,
	},
};
export const Missing: Story = { args: { src: null } };
export const Disabled: Story = { args: { disabled: true } };
