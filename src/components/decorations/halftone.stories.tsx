import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { DecorationsWorkbench } from "./decorations-workbench";
const meta = {
	title: "Design System/Decorations/HalftoneDots",
	component: DecorationsWorkbench,
	args: { initialType: "halftone", lockType: true },
} satisfies Meta<typeof DecorationsWorkbench>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = {
	render: () => <DecorationsWorkbench initialType="halftone" lockType />,
};
