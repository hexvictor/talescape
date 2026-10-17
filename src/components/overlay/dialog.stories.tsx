import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

function DialogShowcase(): React.JSX.Element {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button">Edit scene</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="pr-12">
					<DialogTitle>Scene details</DialogTitle>
					<DialogDescription>
						Update the title shown in Studio and the Reader.
					</DialogDescription>
				</DialogHeader>
				<Input aria-label="Scene title" defaultValue="The Ember Archive" />
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button type="button">Save scene</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const meta = {
	component: DialogShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"The Talescape modal Dialog compatibility surface. React Aria owns portal rendering, focus containment, dismissal, focus return and page scroll locking.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Overlays/Dialog",
} satisfies Meta<typeof DialogShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };

export const Default: Story = {};

export const KeyboardDismissalAndFocusReturn: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: "Edit scene" });

		await userEvent.click(trigger);
		const dialog = await page.findByRole("dialog", { name: "Scene details" });
		await waitFor(() => expect(dialog).toBeVisible());
		await expect(dialog).toContainElement(
			canvasElement.ownerDocument.activeElement as HTMLElement | null,
		);

		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(page.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		await expect(trigger).toHaveFocus();
	},
};

export const ExplicitClose: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: "Edit scene" });

		await userEvent.click(trigger);
		await userEvent.click(await page.findByRole("button", { name: "Cancel" }));
		await waitFor(() =>
			expect(page.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		await expect(trigger).toHaveFocus();
	},
};

export const BackdropExitRegression: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);
		await userEvent.click(canvas.getByRole("button", { name: "Edit scene" }));
		await new Promise((resolve) => setTimeout(resolve, 250));
		const overlay = canvasElement.ownerDocument.querySelector(
			'[data-slot="dialog-overlay"]',
		) as HTMLElement;
		const samples: number[] = [];
		let sampling = true;
		const sample = () => {
			if (!sampling) return;
			if (overlay.isConnected)
				samples.push(Number(getComputedStyle(overlay).opacity));
			requestAnimationFrame(sample);
		};
		requestAnimationFrame(sample);
		await userEvent.click(page.getByRole("button", { name: "Cancel" }));
		await waitFor(() => expect(overlay).not.toBeInTheDocument());
		sampling = false;
		for (let i = 1; i < samples.length; i++)
			expect(samples[i]).toBeLessThanOrEqual((samples[i - 1] ?? 1) + 0.02);
		await expect(
			canvas.getByRole("button", { name: "Edit scene" }),
		).toHaveFocus();
	},
};

export const HighPriorityOverlay: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button">Open Studio prompt</Button>
			</DialogTrigger>
			<DialogContent overlayClassName="z-[1100]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Name this Scene</DialogTitle>
					<DialogDescription>
						This overlay stays above the complete Studio workspace.
					</DialogDescription>
				</DialogHeader>
				<Input aria-label="Scene name" defaultValue="New Scene" />
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button">Create</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);

		await userEvent.click(
			canvas.getByRole("button", { name: "Open Studio prompt" }),
		);
		const dialog = await page.findByRole("dialog", { name: "Name this Scene" });
		await expect(dialog.closest("[data-slot='dialog-overlay']")).toHaveClass(
			"z-[1100]",
		);
		await expect(page.queryByRole("button", { name: "Close" })).toBeNull();
	},
};
