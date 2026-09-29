import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
	BookMarked,
	Bug,
	ChevronLeft,
	ChevronRight,
	FileText,
	GitBranch,
	Grid3X3,
	Layers3,
	ListTree,
	PanelRight,
	Save,
	Settings,
} from "lucide-react";
import { expect, within } from "storybook/test";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import Input from "../ui/input";
import { Tab, TabList, Tabs } from "../ui/tabs";
import { ComicPanel, ComicRail } from "./comic-panel";
import { ScrollArea } from "./scroll-area";
import Separator from "./separator";

function LayoutShowcase(): React.JSX.Element {
	return (
		<div className="grid w-full max-w-2xl gap-5">
			<ComicRail accent="primary">Featured entries</ComicRail>
			<ComicPanel className="grid gap-2 p-5" shape="cut-opposite">
				<h3 className="font-black text-lg uppercase">The Ember Archive</h3>
				<p className="max-w-prose text-muted-foreground text-sm">
					Angular surfaces frame application content without changing its
					layout.
				</p>
			</ComicPanel>
			<div className="flex items-center gap-3 text-xs uppercase">
				<span>Scenes</span>
				<Separator />
				<span>Frames</span>
				<Separator />
				<span>Keyframes</span>
			</div>
		</div>
	);
}

const meta = {
	component: LayoutShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"Shared angular surfaces, section rails, separators, and the encapsulated overflow treatment used by Talescape application chrome.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Layout/Surfaces and Overflow",
} satisfies Meta<typeof LayoutShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PanelShapes: Story = {
	render: () => (
		<div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
			{(
				[
					"rectangle",
					"slant-left",
					"slant-right",
					"slant-both",
					"corner-top-left",
					"corner-top-right",
					"corner-bottom-left",
					"corner-bottom-right",
					"corners-left",
					"corners-right",
					"cut-opposite",
					"cut-opposite-reverse",
				] as const
			).map((shape) => (
				<ComicPanel className="p-4 text-sm" key={shape} shape={shape}>
					<span className="font-bold">{shape}</span>
				</ComicPanel>
			))}
		</div>
	),
};

export const Decorations: Story = {
	render: () => (
		<div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
			<ComicPanel className="min-h-28 p-5" decoration="strikes">
				Strikes remain inside this panel.
			</ComicPanel>
			<ComicPanel className="min-h-28 p-5" decoration="dots">
				Dots remain inside this panel.
			</ComicPanel>
		</div>
	),
};

export const Overflow: Story = {
	render: () => (
		<ScrollArea className="h-44 w-full max-w-sm border-2 border-foreground bg-card">
			<div className="grid gap-2 p-3">
				{Array.from({ length: 12 }, (_, index) => (
					<div
						className="border border-border bg-background px-3 py-2 text-sm"
						key={`scene-${index + 1}`}
					>
						Scene {index + 1}
					</div>
				))}
			</div>
		</ScrollArea>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText("Scene 1")).toBeVisible();
		await expect(canvas.getByText("Scene 12")).toBeInTheDocument();
		await expect(
			canvasElement.querySelector("[data-slot='scroll-area-viewport']"),
		).toBeInTheDocument();
	},
};

export const Separators: Story = {
	render: () => (
		<div className="grid w-full max-w-sm gap-5">
			<div className="flex items-center gap-3">
				<span>Intro</span>
				<Separator />
				<span>Active</span>
				<Separator />
				<span>Outro</span>
			</div>
			<div className="grid gap-3">
				<span>Scene progression</span>
				<Separator direction="horizontal" />
				<span>Bridge transition</span>
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		await expect(
			canvasElement.querySelectorAll("[aria-hidden='true']"),
		).toHaveLength(3);
	},
};

export const StudioWorkspaceChrome: Story = {
	parameters: {
		layout: "fullscreen",
	},
	render: () => (
		<div
			data-tale-studio-ui="true"
			className="studio-theme studio-workspace-shell flex h-[38rem] min-w-0 flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="studio-topbar-frame border-foreground border-b-[3px] bg-card">
				<div className="studio-topbar flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4">
					<strong className="hidden font-display text-lg uppercase sm:block">
						Talescape Studio
					</strong>
					<div className="studio-workspace-switcher flex items-center gap-1">
						<Button aria-pressed motion="flat" size="sm">
							Edit mode
						</Button>
						<Button motion="flat" size="sm" variant="outline">
							Preview
						</Button>
					</div>
					<div className="hidden items-center gap-2 sm:flex">
						<Button
							aria-label="Save"
							className="studio-save-control"
							size="icon"
						>
							<Save />
						</Button>
						<Button aria-label="Settings" size="icon" variant="outline">
							<Settings />
						</Button>
					</div>
				</div>
			</header>
			<div className="studio-workspace-body flex min-h-0 flex-1 flex-col md:flex-row">
				<aside className="studio-navigation-shell flex border-foreground border-r-[3px]">
					<nav
						aria-label="Studio tools"
						className="studio-navigation-rail flex w-16 flex-col items-center gap-2 p-2"
					>
						{[
							{ icon: GitBranch, label: "Story graph" },
							{ icon: ListTree, label: "Structure" },
							{ icon: FileText, label: "Narrative" },
						].map(({ icon: Icon, label }, index) => (
							<Button
								aria-label={String(label)}
								aria-pressed={index === 0}
								className="studio-rail-control"
								key={String(label)}
								motion="flat"
								size="icon"
								variant="outline"
							>
								<Icon />
							</Button>
						))}
					</nav>
				</aside>
				<main className="studio-graph-canvas relative min-h-64 min-w-0 flex-1">
					<div className="studio-floating-toolbar absolute top-4 right-4 flex gap-2">
						<Button size="sm" variant="outline">
							<PanelRight /> Panels
						</Button>
						<Button size="sm">Add branch</Button>
					</div>
					<ComicPanel
						className="-translate-x-1/2 absolute top-28 left-1/2 w-52 p-4"
						shape="cut-opposite"
					>
						<p className="font-black text-primary text-xs uppercase">
							Main route
						</p>
						<strong className="mt-1 block">The Ember Archive</strong>
						<p className="mt-2 text-muted-foreground text-xs">5 scenes</p>
					</ComicPanel>
				</main>
				<aside className="studio-inspector-drawer h-64 w-full border-foreground border-t-[3px] bg-card md:h-auto md:w-80 md:border-t-0 md:border-l-[3px]">
					<header className="studio-drawer-header flex items-center gap-2 border-foreground border-b-2 px-3 py-3">
						<strong className="font-display uppercase">Inspector</strong>
					</header>
					<Tabs defaultSelectedKey="details">
						<TabList aria-label="Inspector sections" density="compact">
							<Tab density="compact" id="details">
								Details
							</Tab>
							<Tab density="compact" id="motion">
								Motion
							</Tab>
							<Tab density="compact" id="style">
								Style
							</Tab>
						</TabList>
					</Tabs>
					<div className="grid gap-3 p-4">
						<Field label="Scene name">
							<Input
								aria-label="Scene name"
								density="compact"
								defaultValue="The Ember Archive"
							/>
						</Field>
						<Button className="w-full" variant="outline">
							Open selected scene
						</Button>
					</div>
				</aside>
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("navigation", { name: "Studio tools" }),
		).toBeVisible();
		await expect(canvas.getByRole("tab", { name: "Details" })).toHaveAttribute(
			"data-selected",
		);
		await expect(canvas.getByLabelText("Scene name")).toHaveValue(
			"The Ember Archive",
		);
	},
};

export const ReaderWorkspaceChrome: Story = {
	parameters: {
		layout: "fullscreen",
	},
	render: () => (
		<div
			data-reader-ui="true"
			className="reader-ui-layer relative h-[38rem] overflow-hidden bg-[linear-gradient(135deg,var(--muted),var(--background)_48%,rgb(var(--primary-rgb)/0.12))] text-foreground"
		>
			<div className="absolute inset-0 grid place-items-center p-16 text-center">
				<div className="max-w-lg">
					<p className="font-bold text-primary text-xs uppercase">
						The Ember Archive
					</p>
					<h2 className="mt-3 font-display text-4xl uppercase">
						A Knock Beneath Thornwick
					</h2>
					<p className="mt-3 text-muted-foreground text-sm">
						Authored tale content remains visually independent from the Reader
						controls around it.
					</p>
				</div>
			</div>
			<aside className="reader-drawer reader-contents-drawer absolute inset-x-0 bottom-0 z-20 flex h-[58%] w-full flex-col border-foreground border-t-[3px] bg-card md:inset-y-0 md:right-auto md:bottom-auto md:h-auto md:w-72 md:border-t-0 md:border-r-[3px]">
				<header className="reader-drawer-header flex h-16 items-center gap-3 border-foreground border-b-2 px-4">
					<ListTree size={17} />
					<div>
						<strong className="font-display uppercase">Story navigation</strong>
						<p className="text-[10px] opacity-60">Visible route only</p>
					</div>
				</header>
				<div className="reader-drawer-tabs flex gap-2 border-foreground border-b-2 p-2">
					<Button size="sm">Contents</Button>
					<Button size="sm" variant="outline">
						Routes
					</Button>
				</div>
				<div className="reader-drawer-content grid gap-3 p-3">
					{["Part 1 - The Awakening", "Part 2 - Fractures"].map(
						(label, index) => (
							<section
								className="border border-foreground/20 bg-background p-3 shadow-[2px_2px_0_rgb(var(--foreground-rgb)/0.16)]"
								key={label}
							>
								<div className="flex items-center gap-2">
									<Layers3 className="text-primary" size={15} />
									<strong className="text-xs">{label}</strong>
								</div>
								<p className="mt-2 border-foreground/15 border-l pl-3 text-muted-foreground text-xs">
									{index === 0 ? "Chapter 1 - Arrival" : "Chapter 2 - The Bell"}
								</p>
							</section>
						),
					)}
				</div>
			</aside>
			<nav
				aria-label="Entry navigation"
				className="reader-entry-navigation -translate-y-1/2 absolute top-1/2 right-0 hidden md:block"
			>
				<div className="reader-entry-panel grid gap-2 border-2 border-foreground border-r-0 bg-card p-2">
					{[1, 2, 3, 4].map((entry) => (
						<Button
							aria-current={entry === 2 ? "page" : undefined}
							aria-label={`Entry ${entry}`}
							className="h-10 w-10 p-0"
							key={entry}
							size="icon"
							variant={entry === 2 ? "default" : "outline"}
						>
							{entry}
						</Button>
					))}
				</div>
			</nav>
			<nav
				aria-label="Reader page navigation"
				className="reader-page-navigation -translate-x-1/2 absolute bottom-0 left-1/2 hidden md:block"
			>
				<div className="reader-page-console relative flex items-center border-2 border-foreground border-b-0 bg-card p-1.5">
					<Button aria-label="Previous page" size="icon" variant="outline">
						<ChevronLeft />
					</Button>
					<Button className="min-w-48 flex-col gap-0 border-0" variant="ghost">
						<strong className="text-xs">Page 3 of 12</strong>
						<span className="text-[10px] text-muted-foreground">
							Chapter 1 - Arrival
						</span>
					</Button>
					<Button aria-label="Next page" size="icon" variant="outline">
						<ChevronRight />
					</Button>
				</div>
			</nav>
			<div className="absolute top-3 right-3 z-30 flex gap-2 md:right-16">
				<Button aria-label="Story navigation" size="icon" variant="outline">
					<Grid3X3 />
				</Button>
				<Button aria-label="Reader Hub" size="icon" variant="outline">
					<BookMarked />
				</Button>
			</div>
			<Button
				aria-label="Reader debug"
				className="absolute right-4 bottom-4"
				size="icon"
				variant="outline"
			>
				<Bug />
			</Button>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("navigation", { name: "Entry navigation" }),
		).toBeVisible();
		await expect(
			canvas.getByRole("navigation", { name: "Reader page navigation" }),
		).toBeVisible();
		await expect(canvas.getByText("Story navigation")).toBeVisible();
	},
};
