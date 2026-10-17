import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComponentEditor } from "../design-system/component-editor";
import { Card, PanelContent, PanelHeading } from "./panel";
const meta = {
	title: "Design System/Components/Card",
	component: Card,
	tags: ["autodocs"],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CardEditor: Story = {
	render: () => <ComponentEditor kind="card" />,
};
export const Default: Story = {
	args: {
		decorations: "accent-cyan",
		shapes: [{ type: "corner", position: "top-left", size: 12 }],
	},
	render: (args) => (
		<Card {...args}>
			<PanelHeading title="Ember City" />
			<PanelContent>A city of light.</PanelContent>
		</Card>
	),
};
