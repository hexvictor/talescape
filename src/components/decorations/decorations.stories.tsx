import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, Panel, PanelContent, PanelHeading } from "~/components/ui/panel";
import { PageShell } from "~/components/layout/page-shell";
import cn from "~/lib/utils/cn";
import { DecoratedMedia } from "./decorated-media";
import { Decorations } from "./decorations";
import {
	AccentStreak,
	CircularLinework,
	GeometricShapes,
	Halftone,
	PaperTexture,
	ScratchLines,
	SpeedLines,
} from "./primitives";
import {
	decorationColorTokens,
	decorationPositions,
	decorationPresets,
	type Decoration,
	type DecorationColorToken,
	type DecorationPosition,
	type DecorationPreset,
} from "./types";

const allVariants = [
	"fade",
	"corner",
	"cluster",
	"field",
	"fine",
	"rough",
	"sweeping",
	"brush",
	"edge",
	"slash",
	"spray",
	"crosshatch",
	"grunge",
	"hairline",
	"contour",
	"rings",
	"sweep",
	"angle",
	"block",
	"corner-cut",
	"frame",
	"slashes",
	"fibers",
	"grain",
	"print",
] as const;

type PlaygroundProps = {
	color: DecorationColorToken;
	density: "airy" | "dense" | "medium";
	opacity: number;
	position: DecorationPosition;
	preset?: DecorationPreset;
	rotation: number;
	scale: number;
	type: Decoration["type"];
	variant: (typeof allVariants)[number];
};

function createPlaygroundItem(args: PlaygroundProps): Decoration {
	const common = {
		color: args.color,
		opacity: args.opacity,
		position: args.position,
		rotation: args.rotation,
		scale: args.scale,
	};
	switch (args.type) {
		case "halftone":
			return {
				...common,
				density: args.density,
				type: "halftone",
				variant: ["cluster", "corner", "fade", "field"].includes(args.variant)
					? (args.variant as "cluster" | "corner" | "fade" | "field")
					: "fade",
			};
		case "speed-lines":
			return {
				...common,
				density: args.density,
				type: "speed-lines",
				variant: ["fine", "rough", "sweeping"].includes(args.variant)
					? (args.variant as "fine" | "rough" | "sweeping")
					: "rough",
			};
		case "accent-streak":
			return {
				...common,
				type: "accent-streak",
				variant: ["brush", "edge", "slash", "spray"].includes(args.variant)
					? (args.variant as "brush" | "edge" | "slash" | "spray")
					: "brush",
			};
		case "scratch-lines":
			return {
				...common,
				density: args.density,
				type: "scratch-lines",
				variant: ["crosshatch", "grunge", "hairline"].includes(args.variant)
					? (args.variant as "crosshatch" | "grunge" | "hairline")
					: "hairline",
			};
		case "circular-linework":
			return {
				...common,
				type: "circular-linework",
				variant: ["contour", "rings", "sweep"].includes(args.variant)
					? (args.variant as "contour" | "rings" | "sweep")
					: "contour",
			};
		case "geometric-shape":
			return {
				...common,
				type: "geometric-shape",
				variant: ["angle", "block", "corner-cut", "frame", "slashes"].includes(
					args.variant,
				)
					? (args.variant as
							| "angle"
							| "block"
							| "corner-cut"
							| "frame"
							| "slashes")
					: "corner-cut",
			};
		case "paper-texture":
			return {
				...common,
				density: args.density,
				type: "paper-texture",
				variant: ["fibers", "grain", "print"].includes(args.variant)
					? (args.variant as "fibers" | "grain" | "print")
					: "grain",
			};
	}
}

function DecorationStage({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"ts-decoration-host relative isolate h-56 overflow-hidden border-2 border-foreground bg-card",
				className,
			)}
		>
			{children}
		</div>
	);
}

function DecorationsPlayground(args: PlaygroundProps): React.JSX.Element {
	return (
		<DecorationStage className="h-96 max-w-4xl">
			<Decorations items={[createPlaygroundItem(args)]} preset={args.preset} />
			<div className="absolute inset-x-8 bottom-8 z-10 max-w-lg border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_var(--primary)]">
				<p className="font-black text-primary text-xs uppercase">
					Live composer
				</p>
				<h2 className="mt-1 font-display text-3xl uppercase">
					{args.type.replaceAll("-", " ")}
				</h2>
				<p className="mt-2 text-muted-foreground text-sm">
					Custom items append after preset items and paint above them.
				</p>
			</div>
		</DecorationStage>
	);
}

const componentDocs = `A typed SVG/CSS graphic system for Talescape pages and surfaces. Every primitive is decorative-only, ignores pointer input, and uses semantic design tokens.

Custom \`items\` **append to** preset items and therefore paint above them.

\`\`\`tsx
<Halftone variant="fade" density="dense" dotSize={3} spacing={10} />
<SpeedLines variant="rough" direction="down-right" strokeWidth={2} />
<AccentStreak variant="brush" color="magenta" rotation={-8} />
<ScratchLines variant="grunge" density="airy" strokeWidth={1} />
<CircularLinework variant="contour" strokeWidth={1.2} />
<GeometricShapes variant="corner-cut" color="cyan" />
<PaperTexture variant="fibers" density="medium" opacity={0.2} />

<Decorations
  preset="page-editorial"
  items={[{ type: "accent-streak", variant: "brush", position: "top-right", color: "magenta" }]}
/>
\`\`\``;

const meta = {
	args: {
		color: "cyan",
		density: "medium",
		opacity: 0.8,
		position: "top-right",
		preset: "page-subtle",
		rotation: 0,
		scale: 1,
		type: "accent-streak",
		variant: "brush",
	},
	argTypes: {
		color: { control: "select", options: decorationColorTokens },
		density: { control: "inline-radio", options: ["airy", "medium", "dense"] },
		opacity: { control: { max: 1, min: 0, step: 0.05, type: "range" } },
		position: { control: "select", options: decorationPositions },
		preset: { control: "select", options: [undefined, ...decorationPresets] },
		rotation: { control: { max: 180, min: -180, step: 1, type: "range" } },
		scale: { control: { max: 2, min: 0.25, step: 0.05, type: "range" } },
		type: {
			control: "select",
			options: [
				"halftone",
				"speed-lines",
				"accent-streak",
				"scratch-lines",
				"circular-linework",
				"geometric-shape",
				"paper-texture",
			],
		},
		variant: { control: "select", options: allVariants },
	},
	component: DecorationsPlayground,
	parameters: { docs: { description: { component: componentDocs } } },
	tags: ["autodocs"],
	title: "Design System/Decorations",
} satisfies Meta<typeof DecorationsPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: "Decorations Playground" };

export const DecorationsComposer: Story = {
	name: "Decorations Composer",
	render: () => (
		<DecorationStage className="h-80 max-w-4xl">
			<Decorations
				items={[
					{
						color: "magenta",
						position: "top-right",
						type: "accent-streak",
						variant: "spray",
					},
				]}
				preset="page-editorial"
			/>
		</DecorationStage>
	),
};

export const HalftonePrimitive: Story = {
	name: "Halftone",
	render: () => (
		<DecorationStage>
			<Halftone
				color="foreground"
				opacity={0.65}
				position="center"
				variant="fade"
			/>
		</DecorationStage>
	),
};

export const SpeedLinesPrimitive: Story = {
	name: "Speed Lines",
	render: () => (
		<DecorationStage>
			<SpeedLines
				color="foreground"
				opacity={0.42}
				position="center"
				variant="rough"
			/>
		</DecorationStage>
	),
};

export const AccentStreaksPrimitive: Story = {
	name: "Accent Streaks",
	render: () => (
		<DecorationStage>
			<AccentStreak color="magenta" position="center" variant="brush" />
		</DecorationStage>
	),
};

export const ScratchLinesPrimitive: Story = {
	name: "Scratch Lines",
	render: () => (
		<DecorationStage>
			<ScratchLines
				color="neutral"
				opacity={0.55}
				position="center"
				variant="grunge"
			/>
		</DecorationStage>
	),
};

export const CircularLineworkPrimitive: Story = {
	name: "Circular Linework",
	render: () => (
		<DecorationStage>
			<CircularLinework
				color="neutral"
				opacity={0.5}
				position="center"
				variant="contour"
			/>
		</DecorationStage>
	),
};

export const GeometricShapesPrimitive: Story = {
	name: "Geometric Shapes",
	render: () => (
		<DecorationStage>
			<GeometricShapes color="cyan" position="center" variant="slashes" />
		</DecorationStage>
	),
};

export const PaperTexturePrimitive: Story = {
	name: "Paper Texture",
	render: () => (
		<DecorationStage>
			<PaperTexture opacity={0.65} position="center" variant="fibers" />
		</DecorationStage>
	),
};

function VariationGallery({
	items,
}: {
	items: Array<{ item: Decoration; label: string }>;
}) {
	return (
		<div className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ item, label }) => (
				<div key={label}>
					<DecorationStage className="h-44">
						<Decorations items={[item]} />
					</DecorationStage>
					<strong className="mt-2 block text-xs uppercase">{label}</strong>
				</div>
			))}
		</div>
	);
}

export const HalftoneVariations: Story = {
	render: () => (
		<VariationGallery
			items={(["fade", "corner", "cluster", "field"] as const).map(
				(variant, index) => ({
					item: {
						color: "foreground",
						density: index % 2 ? "dense" : "airy",
						opacity: 0.62,
						position: "center",
						type: "halftone",
						variant,
					},
					label: variant,
				}),
			)}
		/>
	),
};

export const SpeedLineVariations: Story = {
	render: () => (
		<VariationGallery
			items={(["fine", "rough", "sweeping"] as const).map((variant) => ({
				item: {
					color: "foreground",
					opacity: 0.55,
					position: "center",
					type: "speed-lines",
					variant,
				},
				label: variant,
			}))}
		/>
	),
};

export const AccentStreakVariations: Story = {
	render: () => (
		<VariationGallery
			items={(["brush", "edge", "slash", "spray"] as const).map(
				(variant, index) => ({
					item: {
						color: (["cyan", "magenta", "yellow"] as const)[index % 3],
						position: "center",
						type: "accent-streak",
						variant,
					},
					label: variant,
				}),
			)}
		/>
	),
};

export const GeometricShapeVariations: Story = {
	render: () => (
		<VariationGallery
			items={(
				["angle", "block", "corner-cut", "frame", "slashes"] as const
			).map((variant, index) => ({
				item: {
					color: (["foreground", "cyan", "magenta", "yellow"] as const)[
						index % 4
					],
					opacity: 0.88,
					position: "center",
					type: "geometric-shape",
					variant,
				},
				label: variant,
			}))}
		/>
	),
};

export const CircularLineworkVariations: Story = {
	render: () => (
		<VariationGallery
			items={(["contour", "rings", "sweep"] as const).map((variant) => ({
				item: {
					color: "neutral",
					opacity: 0.62,
					position: "center",
					type: "circular-linework",
					variant,
				},
				label: variant,
			}))}
		/>
	),
};

export const CornerTreatments: Story = {
	render: () => (
		<VariationGallery
			items={(["cyan", "magenta", "yellow"] as const).map((color) => ({
				item: {
					color,
					position: "bottom-left",
					type: "geometric-shape",
					variant: "corner-cut",
				},
				label: `${color} corner`,
			}))}
		/>
	),
};

export const CombinedDecorations: Story = {
	render: () => (
		<div className="grid max-w-5xl gap-4 md:grid-cols-3">
			{(["page-subtle", "page-editorial", "page-energetic"] as const).map(
				(preset) => (
					<DecorationStage key={preset} className="h-72">
						<Decorations preset={preset} />
						<strong className="absolute bottom-4 left-4 z-10 bg-card px-3 py-2 font-display text-xl uppercase">
							{preset}
						</strong>
					</DecorationStage>
				),
			)}
		</div>
	),
};

export const PageBackgroundExamples: Story = {
	name: "Page Presets / Page Background Examples",
	render: () => (
		<div className="grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{(
				[
					"discover",
					"library",
					"codex",
					"detail",
					"form",
					"auth",
					"reader",
				] as const
			).map((preset) => (
				<PageShell
					className="h-72 border-2 border-foreground bg-card"
					decorationPreset={preset}
					key={preset}
				>
					<span className="absolute bottom-4 left-4 z-10 font-black text-xs uppercase">
						{preset}
					</span>
				</PageShell>
			))}
		</div>
	),
};

export const ImageDecorationExamples: Story = {
	name: "Image Presets / Image Decoration Examples",
	render: () => (
		<div className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{(
				[
					"cyan-corner",
					"magenta-corner",
					"yellow-corner",
					"halftone-corner",
					"speed-accent",
				] as const
			).map((preset) => (
				<div key={preset}>
					<DecoratedMedia
						className="aspect-video border-2 border-foreground"
						preset={preset}
					>
						<img
							alt="Fantasy city"
							className="h-full w-full object-cover"
							src="/assets/site/ember-city-light.png"
						/>
					</DecoratedMedia>
					<strong className="mt-2 block text-xs uppercase">{preset}</strong>
				</div>
			))}
		</div>
	),
};

export const PanelDecorationExamples: Story = {
	name: "Panel Presets / Panel Decoration Examples",
	render: () => (
		<div className="grid max-w-4xl gap-5 sm:grid-cols-2">
			<Panel decorations="subtle">
				<PanelHeading
					title="Subtle panel"
					description="Editorial texture stays behind content."
				/>
				<PanelContent>Useful for selected application surfaces.</PanelContent>
			</Panel>
			<Panel decorations="selected">
				<PanelHeading
					title="Selected panel"
					description="Primary accents communicate emphasis."
				/>
				<PanelContent>Decorations remain intentionally opt-in.</PanelContent>
			</Panel>
			<Card decorations="accent-cyan">
				<PanelHeading title="Cyan card" />
				<PanelContent>Semantic article surface.</PanelContent>
			</Card>
			<Card decorations="accent-magenta">
				<PanelHeading title="Magenta card" />
				<PanelContent>Same composition API.</PanelContent>
			</Card>
		</div>
	),
};

export const ButtonDecorationExamples: Story = {
	name: "Button Decorations / Button Decoration Examples",
	render: () => (
		<div className="flex max-w-3xl flex-wrap gap-8 p-8">
			<Button
				comicDecorations={[
					{ color: "primary", element: "strikes", position: "top-right" },
				]}
				shape="slant-right"
			>
				Strikes <ArrowRight />
			</Button>
			<Button
				comicDecorations={[
					{ color: "secondary", element: "bubbles", position: "bottom-left" },
				]}
				shape="corner-right"
				variant="outline"
			>
				Bubbles
			</Button>
			<Button
				comicDecorations={[
					{ color: "primary", element: "strikes", position: "top-right" },
					{ color: "muted", element: "bubbles", position: "bottom-left" },
				]}
				shape="slant-both"
			>
				Combined
			</Button>
		</div>
	),
};
