import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumbs } from "./breadcrumbs";
const meta = {
	title: "Design System/Navigation/Breadcrumbs",
	component: Breadcrumbs,
	args: {
		"aria-label": "Library location",
		items: [
			{ id: "library", label: "Library", href: "#library" },
			{ id: "tale", label: "The Ember Archive" },
		],
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
