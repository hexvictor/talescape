import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileText, Network, Paintbrush, Waves } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Breadcrumbs } from "./breadcrumbs";
import { Tab, TabList, TabPanel, Tabs } from "./tabs";

function NavigationShowcase(): React.JSX.Element {
	return (
		<div className="grid max-w-2xl gap-5">
			<Breadcrumbs
				items={[
					{ href: "#tale", id: "tale", label: "The Ember Archive" },
					{ href: "#scene", id: "scene", label: "Scene 4" },
					{ id: "frame", label: "Frame 2" },
				]}
			/>
			<Tabs defaultSelectedKey="details">
				<TabList aria-label="Inspector sections">
					<Tab id="details">
						<FileText className="size-4" /> Details
					</Tab>
					<Tab id="hierarchy">
						<Network className="size-4" /> Hierarchy
					</Tab>
					<Tab id="motion">
						<Waves className="size-4" /> Motion
					</Tab>
					<Tab id="style">
						<Paintbrush className="size-4" /> Style
					</Tab>
				</TabList>
				<TabPanel id="details" className="p-4">
					Scene details
				</TabPanel>
				<TabPanel id="hierarchy" className="p-4">
					Scene hierarchy
				</TabPanel>
				<TabPanel id="motion" className="p-4">
					Scene motion
				</TabPanel>
				<TabPanel id="style" className="p-4">
					Scene style
				</TabPanel>
			</Tabs>
		</div>
	);
}

const meta = {
	component: NavigationShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"React Aria-backed navigation primitives for Inspector tabs and hierarchical context. Tabs retain controlled state ownership in their consumer.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Navigation/Tabs and Breadcrumbs",
} satisfies Meta<typeof NavigationShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;
const onBreadcrumbBack = fn();

export const Default: Story = {};

export const CompactOverflow: Story = {
	render: () => (
		<div className="w-72 border-2 border-foreground bg-card">
			<Tabs defaultSelectedKey="details">
				<TabList density="compact" aria-label="Compact Inspector sections">
					{["Details", "Narrative", "Placement", "Motion", "Style"].map(
						(label) => (
							<Tab density="compact" id={label.toLowerCase()} key={label}>
								{label}
							</Tab>
						),
					)}
				</TabList>
			</Tabs>
		</div>
	),
};

export const ControlledKeyboardNavigation: Story = {
	render: function ControlledStory() {
		const [selected, setSelected] = useState("details");
		return (
			<div className="max-w-lg">
				<Tabs
					selectedKey={selected}
					onSelectionChange={(key) => setSelected(String(key))}
				>
					<TabList aria-label="Controlled tabs">
						<Tab id="details">Details</Tab>
						<Tab id="motion">Motion</Tab>
						<Tab id="style">Style</Tab>
					</TabList>
					<TabPanel id="details">Details panel</TabPanel>
					<TabPanel id="motion">Motion panel</TabPanel>
					<TabPanel id="style">Style panel</TabPanel>
				</Tabs>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const details = canvas.getByRole("tab", { name: "Details" });
		await details.focus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(canvas.getByRole("tab", { name: "Motion" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
			"Motion panel",
		);
	},
};

export const BreadcrumbAction: Story = {
	render: () => (
		<Breadcrumbs
			items={[
				{ id: "frame", label: "Frame 2", onPress: onBreadcrumbBack },
				{ id: "element", label: "Hero image" },
			]}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Frame 2" }));
		await expect(onBreadcrumbBack).toHaveBeenCalledOnce();
	},
};
