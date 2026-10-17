import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
	AccentStreak,
	Decorations,
	HalftoneDots,
} from "~/components/decorations";
import { Button, ButtonPart } from "./button";
import { geometryShapes } from "./geometry";

const variants = [
	"default",
	"secondary",
	"destructive",
	"outline",
	"comic",
	"ink",
	"ghost",
	"link",
	"lift",
	"nav",
	"navActive",
] as const;

const shapes = geometryShapes;

export const InteractionShapesAndDecorations = {
	render: () => (
		<Button
			shapes="cut-opposite"
			hoverShapes="slant-both"
			pressedShapes="corners-right"
			decorations={[{ type: "halftone", color: "cyan", coverage: 0.5 }]}
			hoverDecorations={[{ type: "halftone", color: "magenta", coverage: 0.8 }]}
			pressedDecorations={[{ type: "halftone", color: "yellow", coverage: 1 }]}
		>
			Explore tales
		</Button>
	),
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const button = within(canvasElement).getByRole("button", {
			name: "Explore tales",
		});
		await userEvent.hover(button);
		await waitFor(() =>
			expect(
				canvasElement
					.querySelector('[data-decoration-type="halftone"]')
					?.getAttribute("style"),
			).toContain("var(--ts-pink)"),
		);
		await userEvent.unhover(button);
		await waitFor(() =>
			expect(
				canvasElement
					.querySelector('[data-decoration-type="halftone"]')
					?.getAttribute("style"),
			).toContain("var(--ts-cyan)"),
		);
	},
};

const motions = [
	"flat",
	"lifted",
	"lift-on-hover",
	"reveal-on-hover",
	"color-only",
	"underline",
] as const;

const meta = {
	args: {
		children: "Create Tale",
		onClick: fn(),
		shape: "rectangle",
		size: "default",
		variant: "default",
	},
	argTypes: {
		children: { control: "text" },
		className: { control: "text" },
		disabled: { control: "boolean" },
		hoverShape: {
			control: "select",
			options: [undefined, "match", ...shapes],
		},
		hoverSurfaceClassName: { control: "text" },
		innerSlantDecrease: { control: "text" },
		motion: { control: "select", options: motions },
		shape: { control: "select", options: shapes },
		size: {
			control: "inline-radio",
			options: ["default", "sm", "lg", "icon"],
		},
		slant: {
			control: "select",
			options: ["sm", "md", "lg", "xl", "24px"],
		},
		slanted: { control: "boolean" },
		surfaceClassName: { control: "text" },
		variant: { control: "select", options: variants },
	},
	component: Button,
	parameters: {
		docs: {
			description: {
				component:
					"Compose Decorations as children inside the action. ButtonPart adds a slanted visual segment to a single accessible button or link.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Components/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonEditor: Story = {
	render: () => <ComponentEditor kind="button" />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.clear(canvas.getByLabelText("Label"));
		await userEvent.type(canvas.getByLabelText("Label"), "Begin story");
		await expect(
			within(
				canvasElement.querySelector(
					'[data-reader-role="component-preview"]',
				) as HTMLElement,
			).getByRole("button", { name: "Begin story" }),
		).toBeVisible();
		await userEvent.click(canvas.getByRole("tab", { name: "Shapes" }));
		await expect(canvas.getByLabelText("Morph duration (ms)")).toBeVisible();
		await expect(canvas.queryByLabelText("Label")).not.toBeInTheDocument();
		await userEvent.click(canvas.getByRole("tab", { name: "Decorations" }));
		await userEvent.selectOptions(
			canvas.getByLabelText("Preset"),
			"button-halftone",
		);
		await expect(
			canvasElement.querySelector(
				'[data-reader-role="component-preview"] .ts-decorations',
			),
		).toBeInTheDocument();
	},
};

export const AnimatedHoverShapes: Story = {
	args: {
		children: "Explore tales",
		shapes: [{ type: "corner", position: "top-left", size: 12 }],
		hoverShapes: [
			{ type: "step", position: "top-left-h", size: 12, extent: "45%" },
			{ type: "corner", position: "bottom-right", size: 16 },
		],
		shapeTransitionDuration: 700,
		decorations: "button-halftone",
		style: { width: 260 },
	},
	play: async ({ canvasElement }) => {
		const frame = canvasElement.querySelector(
			'[data-reader-role="button-frame"]',
		) as HTMLElement;
		const path = () =>
			frame
				.querySelector('[data-reader-role="shape-border"] > path')
				?.getAttribute("d");
		await waitFor(() => expect(path()).toBeTruthy());
		const initial = path();
		await userEvent.hover(
			within(canvasElement).getByRole("button", { name: "Explore tales" }),
		);
		await new Promise((resolve) => setTimeout(resolve, 160));
		const middle = path();
		await expect(middle).not.toBe(initial);
		await expect(
			frame.style.getPropertyValue("--ts-geometry-clip-path"),
		).toContain(middle);
		await new Promise((resolve) => setTimeout(resolve, 720));
		await expect(path()).not.toBe(middle);
		await userEvent.unhover(
			within(canvasElement).getByRole("button", { name: "Explore tales" }),
		);
		await waitFor(() => expect(path()).toBe(initial), { timeout: 3000 });
	},
};

export const Default: Story = {};
export const LegacyHoverMorph: Story = {
	args: {
		children: "Library",
		variant: "nav",
		shape: "rectangle",
		hoverShape: "slant-both",
		shapeTransitionDuration: 700,
	},
	play: async ({ canvasElement }) => {
		const frame = canvasElement.querySelector(
			'[data-reader-role="button-frame"]',
		) as HTMLElement;
		const clip = () => frame.style.getPropertyValue("--ts-geometry-clip-path");
		await waitFor(() => expect(clip()).toMatch(/^path/));
		const initial = clip();
		const button = within(canvasElement).getByRole("button", {
			name: "Library",
		});
		await userEvent.hover(button);
		await new Promise((resolve) => setTimeout(resolve, 160));
		const middle = clip();
		await expect(middle).not.toBe(initial);
		await new Promise((resolve) => setTimeout(resolve, 720));
		await expect(clip()).not.toBe(middle);
		await userEvent.unhover(button);
		await waitFor(() => expect(clip()).toBe(initial), { timeout: 3000 });
	},
};
export const Primary: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Comic: Story = { args: { variant: "comic" } };
export const Ink: Story = { args: { variant: "ink" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const LinkStyle: Story = { args: { variant: "link" } };
export const Lift: Story = { args: { variant: "lift" } };
export const Nav: Story = { args: { variant: "nav" } };

export const SlantLeft: Story = { args: { shape: "slant-left" } };
export const SlantRight: Story = { args: { shape: "slant-right" } };
export const SlantBoth: Story = { args: { shape: "slant-both" } };
export const CornerLeft: Story = { args: { shape: "corner-left" } };
export const CornerRight: Story = { args: { shape: "corner-right" } };
export const BottomCorners: Story = {
	args: { shape: "corner-bottom-right" },
};
export const MultipleCorners: Story = { args: { shape: "corners-right" } };

export const Flat: Story = { args: { motion: "flat" } };
export const Lifted: Story = { args: { motion: "lifted" } };
export const LiftOnHover: Story = { args: { motion: "lift-on-hover" } };
export const RevealOnHover: Story = {
	args: { hoverShape: "match", motion: "reveal-on-hover" },
};

export const ComicStrikes: Story = {
	args: { shape: "slant-both" },
	render: (args) => (
		<Button {...args}>
			<Decorations>
				<AccentStreak color="magenta" position="top-right" coverage={1.2} />
			</Decorations>
			Create Tale
		</Button>
	),
};

export const ComicBubbles: Story = {
	args: { shape: "corner-right" },
	render: (args) => (
		<Button {...args}>
			<Decorations>
				<HalftoneDots color="white" position="center-right" coverage={1.2} />
			</Decorations>
			Create Tale
		</Button>
	),
};

export const MultipleComicDecorations: Story = {
	args: { shape: "slant-both", variant: "outline" },
	render: (args) => (
		<Button {...args}>
			<Decorations preset="brush-halftone" />
			Create Tale
		</Button>
	),
};

export const SlantedSegments: Story = {
	render: (args) => (
		<div className="flex flex-wrap gap-6">
			<Button {...args} size="lg" shape="slant-both">
				<BookOpen />
				Explore tales
				<ButtonPart>
					<ArrowRight />
				</ButtonPart>
			</Button>
			<Button {...args} variant="outline" size="lg">
				<ButtonPart side="left">
					<BookOpen />
				</ButtonPart>
				Open library
				<ButtonPart>
					<ArrowRight />
				</ButtonPart>
			</Button>
		</div>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas
				.getByRole("button", { name: "Explore tales" })
				.querySelector('[data-slot="button-part"]') as HTMLElement,
		);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const WithIcon: Story = {
	args: { children: undefined },
	render: (args) => (
		<Button {...args}>
			Create Tale <ArrowRight />
		</Button>
	),
};

export const IconOnly: Story = {
	args: { "aria-label": "Add tale", children: undefined, size: "icon" },
	render: (args) => (
		<Button {...args}>
			<Plus />
		</Button>
	),
};

export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Focused: Story = { args: { autoFocus: true } };

export const ComposedLink: Story = {
	args: { children: undefined, onClick: undefined, shape: "slant-right" },
	render: (args) => (
		<Button {...args} asChild>
			<Link href="#button-link-target">Open Codex</Link>
		</Button>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = canvas.getByRole("link", { name: "Open Codex" });
		await expect(link).toHaveAttribute("href", "#button-link-target");
	},
};

export const PressInteraction: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Create Tale" }));
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const AllVariants: Story = {
	args: { children: undefined, onClick: undefined },
	render: () => (
		<div className="flex flex-wrap items-center gap-5">
			{variants.map((variant) => (
				<Button key={variant} variant={variant}>
					{variant}
				</Button>
			))}
		</div>
	),
};

export const AllShapes: Story = {
	args: { children: undefined, onClick: undefined },
	render: () => (
		<div className="flex flex-wrap items-center gap-5">
			{shapes.map((shape) => (
				<Button key={shape} shape={shape}>
					{shape}
				</Button>
			))}
		</div>
	),
};

export const AllMotions: Story = {
	args: { children: undefined, onClick: undefined },
	render: () => (
		<div className="flex flex-wrap items-center gap-5">
			{motions.map((motion) => (
				<Button key={motion} motion={motion} shape="slant-right">
					{motion}
				</Button>
			))}
		</div>
	),
};

import { ComponentEditor } from "../design-system/component-editor";
