import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AddElementDialog } from "./AddElementDialog";
const meta = {
	title: "Studio/Elements/Add Element",
	component: AddElementDialog,
	args: { open: true, onClose: fn(), onCreate: fn() },
} satisfies Meta<typeof AddElementDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Closed: Story = { args: { open: false } };
