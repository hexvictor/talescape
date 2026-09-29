import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MoreHorizontal, Plus } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { CollapsibleSection } from "./collapsible-section";
import { Field } from "./field";
import Input from "./input";
import { Panel, PanelContent, PanelHeading } from "./panel";
import { PropertyGroup, PropertyRow } from "./property";
import { ResizeHandle } from "./resize-handle";
import { SectionHeader } from "./section-header";

const resizeStep = fn();

function StructureShowcase(): React.JSX.Element {
	return (
		<div className="grid max-w-xl gap-5">
			<Panel>
				<PanelHeading
					title="Scene structure"
					description="Frames, elements, and progression in the selected Scene."
					actions={
						<Button size="icon" variant="ghost" aria-label="More options">
							<MoreHorizontal />
						</Button>
					}
				/>
				<PropertyGroup>
					<PropertyRow label="Frames" value="4" />
					<PropertyRow label="Elements" value="12" />
					<PropertyRow label="Progression" value="Linear" />
				</PropertyGroup>
			</Panel>
			<Panel appearance="subtle">
				<PanelContent>
					<SectionHeader
						title="Frame layout"
						description="Controls how Frames are arranged inside the Scene."
						actions={
							<Button size="sm" variant="outline">
								<Plus /> Add
							</Button>
						}
					/>
				</PanelContent>
			</Panel>
		</div>
	);
}

const meta = {
	component: StructureShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"Semantic structural primitives for application and tool surfaces. Panels own surface treatment; headings, content, and definition-list properties remain independently composable.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Structure/Panels and Properties",
} satisfies Meta<typeof StructureShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const previewSurface = canvasElement.querySelector(
			"[data-storybook-preview-surface='true']",
		);
		await expect(previewSurface).toBeInTheDocument();
		await expect(previewSurface).not.toHaveClass("site-paper");
		await expect(previewSurface).not.toHaveClass("min-h-screen");
	},
};

export const CompactInspector: Story = {
	render: () => (
		<div className="max-w-xs">
			<Panel
				data-studio-component="ExampleInspectorSection"
				data-studio-role="inspector-section"
			>
				<PanelHeading
					className="px-3 py-2"
					title="Selected Frame"
					description="Frame 2 of Scene 4"
				/>
				<PanelContent density="compact" className="grid gap-2 text-xs">
					<p>Compact content keeps dense editing workflows scannable.</p>
				</PanelContent>
			</Panel>
		</div>
	),
};

export const ResponsiveProperties: Story = {
	render: () => (
		<Panel className="w-full max-w-2xl">
			<PanelHeading title="Tale details" />
			<PropertyGroup>
				<PropertyRow label="Name" value="The Ember Archive" />
				<PropertyRow
					label="Description"
					value="A production-shaped branching story through the buried streets of Thornwick."
				/>
			</PropertyGroup>
		</Panel>
	),
};

export const Empty: Story = {
	render: () => (
		<Panel className="max-w-sm">
			<PanelHeading title="Properties" />
			<PanelContent className="text-center text-muted-foreground text-sm">
				No properties available.
			</PanelContent>
		</Panel>
	),
};

export const InspectorFields: Story = {
	render: () => (
		<div className="max-w-sm">
			<CollapsibleSection defaultExpanded title="Size and placement">
				<Field
					label="Width"
					description="The rendered width of the selected element."
				>
					<Input
						aria-label="Width"
						defaultValue="640"
						density="compact"
						type="number"
					/>
				</Field>
				<Field label="Height">
					<Input
						aria-label="Height"
						defaultValue="360"
						density="compact"
						type="number"
					/>
				</Field>
			</CollapsibleSection>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", {
			name: "Size and placement",
		});
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(trigger);
		await expect(canvas.getByRole("spinbutton", { name: "Width" })).toHaveValue(
			640,
		);
	},
};

export const ResizablePanes: Story = {
	render: () => (
		<div className="flex h-48 max-w-xl border-2 border-foreground">
			<div className="grid flex-1 place-items-center bg-card text-sm">
				Canvas
			</div>
			<ResizeHandle
				aria-label="Resize Inspector"
				onDrag={() => undefined}
				onStep={resizeStep}
			/>
			<div className="grid w-48 place-items-center bg-muted text-sm">
				Inspector
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		resizeStep.mockClear();
		const canvas = within(canvasElement);
		const handle = canvas.getByRole("button", { name: "Resize Inspector" });
		handle.focus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(handle).toHaveFocus();
		await expect(resizeStep).toHaveBeenCalledWith(16);
	},
};
