import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TaleCreationForm } from "./TaleCreationForm";

const meta = {
	title: "Library/Tale Creation",
	component: TaleCreationForm,
	args: {
		action: fn(),
		books: [{ id: "1", label: "Ember City" }],
		authors: [{ id: "2", label: "Alex" }],
	},
} satisfies Meta<typeof TaleCreationForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CreateBookAndAuthor: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Create a new book" }),
		);
		await expect(
			canvas.getByRole("textbox", { name: "New book title" }),
		).toBeVisible();
		await userEvent.click(
			canvas.getByRole("button", { name: "Create a new author" }),
		);
		await expect(
			canvas.getByRole("textbox", { name: "New author name" }),
		).toBeVisible();
	},
};
export const UnavailableSelection: Story = { args: { error: "unavailable" } };
