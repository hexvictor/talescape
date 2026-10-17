import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state";
const meta = {
	title: "Design System/Components/EmptyState",
	component: EmptyState,
	args: {
		title: "Your library is empty",
		description: "Discover stories to begin your collection.",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Default: Story = {};
