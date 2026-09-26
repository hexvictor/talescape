import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";

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

const shapes = [
	"rectangle",
	"slant-left",
	"slant-right",
	"slant-both",
	"corner-left",
	"corner-right",
	"corner-bottom-left",
	"corner-bottom-right",
	"corners-left",
	"corners-right",
] as const;

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
		comicDecorations: { control: "object" },
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
					"The production Talescape Button baseline. Its visual layers, geometry, motion, decorations and link composition are compatibility contracts during the React Aria migration.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Primitives/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
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
	args: {
		comicDecorations: [
			{ color: "secondary", element: "strikes", position: "top-right" },
		],
		shape: "slant-both",
	},
};

export const ComicBubbles: Story = {
	args: {
		comicDecorations: [
			{ color: "accent", element: "bubbles", position: "bottom-left" },
		],
		shape: "corner-right",
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
