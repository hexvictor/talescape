import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { LibraryVisualPreview } from "./LibraryVisualPreview";

const meta = {
	title: "Library/Visual Preview",
	component: LibraryVisualPreview,
	args: {
		title: "Opening scene",
		taleHref: "/official/example?scene=1",
		studioHref: "/studio/1?inspect=element&inspectId=1",
		snapshot: {
			frames: [],
			elements: [
				{
					id: 1,
					taleId: 1,
					sceneId: 1,
					frameId: null,
					creatorId: "example",
					type: "text",
					isOfficial: false,
					isVerified: false,
					editable: true,
					order: 0,
					visibility: "public",
					cloneable: "private",
					data: { content: "A new adventure begins." },
					content: {},
					placementConfig: { mode: "normal" },
					styleConfig: { fontSize: "24px" },
					responsiveConfig: {},
					visibleRange: null,
					animationConfig: {
						ambient: { tracks: [] },
						intro: { tracks: [] },
						outro: { tracks: [] },
						active: { tracks: [] },
					},
					createdAt: new Date("2026-01-01"),
					updatedAt: null,
				},
			],
		},
	},
} satisfies Meta<typeof LibraryVisualPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Scene: Story = {
	play: async ({ canvasElement }) => {
		await userEvent.click(
			within(canvasElement).getByRole("button", { name: "Preview" }),
		);
		const dialog = within(document.body).getByRole("dialog");
		await waitFor(() =>
			expect(within(dialog).getByText("A new adventure begins.")).toBeVisible(),
		);
		await expect(
			within(dialog).getByRole("link", { name: "Edit in Studio" }),
		).toHaveAttribute("href", "/studio/1?inspect=element&inspectId=1");
	},
};
export const Empty: Story = {
	args: { snapshot: { frames: [], elements: [] }, studioHref: undefined },
};
