import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { panelPresetOptions } from "../decorations/types";
import { ComicPanel } from "./comic-panel";
const meta = {
	title: "Design System/Components/ComicPanel",
	component: ComicPanel,
	args: {
		children: "Ember City",
		className: "w-96",
		shapes: [{ type: "corner", position: "top-left", size: 12 }],
		shadow: true,
		accent: "primary",
	},
	argTypes: { decorations: { control: "select", options: panelPresetOptions } },
	tags: ["autodocs"],
} satisfies Meta<typeof ComicPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
export const Decorated: Story = { args: { decorations: "panel-cyan" } };
