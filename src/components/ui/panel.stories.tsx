import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComponentEditor } from "../design-system/component-editor";
import { Panel, PanelContent, PanelHeading } from "./panel";
const meta = {
	title: "Design System/Components/Panel",
	component: Panel,
	tags: ["autodocs"],
} satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PanelEditor: Story = {
	render: () => <ComponentEditor kind="panel" />,
};
export const Composed: Story = {
	args: {
		shapes: [
			{ type: "slant", position: "left", slope: "start", size: 24 },
			{
				type: "step",
				position: "bottom-right-h",
				direction: "inward",
				size: 24,
				extent: "45%",
			},
		],
		decorations: "panel-cyan",
		shadow: true,
	},
	render: (args) => (
		<Panel {...args}>
			<PanelHeading title="Ember City" />
			<PanelContent>A city of light.</PanelContent>
		</Panel>
	),
};
export const Subtle: Story = {
	args: {
		appearance: "subtle",
		decorations: "subtle",
		children: "A quiet panel",
	},
};
export const Ghost: Story = {
	args: { appearance: "ghost", children: "An unframed panel" },
};
