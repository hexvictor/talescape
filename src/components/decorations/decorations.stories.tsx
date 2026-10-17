import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Card, Panel, PanelContent, PanelHeading } from "~/components/ui/panel";
import cn from "~/lib/utils/cn";
import { TaleImage } from "../media/tale-image";
import { Decorations } from "./decorations";
import { DecorationsWorkbench } from "./decorations-workbench";
import { AccentStreak, HalftoneDots, SpeedLines } from "./primitives";
import type { Decoration } from "./types";

const densities = [
	"minimal",
	"sparse",
	"airy",
	"medium",
	"dense",
	"packed",
] as const;
const halftoneShapes = [
	"triangle",
	"rectangle",
	"field",
	"circle",
	"vignette",
	"speed-lines",
	"random",
] as const;
function DecorationStage({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			data-reader-component="DecorationStage"
			data-reader-role="decoration-preview"
			className={cn(
				"ts-decoration-host relative isolate h-64 overflow-hidden border-2 border-foreground bg-card",
				className,
			)}
		>
			{children}
		</div>
	);
}

function DecorationsPlayground(): React.JSX.Element {
	return <DecorationsWorkbench />;
}

const componentDocs = `Six parent-responsive comic decoration families. Each primitive owns its specific controls, while \`Decorations\` supplies the clipping and composition frame. The canvas workbench keeps controls beside the preview and only shows properties supported by the selected type.

\`BackgroundTexture\` fills the parent with a repeating pixel-sized surface, independent of parent aspect ratio. Paper fibers, grain, irregular grunge flecks, fine scratches, broad scuffs and vertical wear share density, seed, tile size, grain size and opacity controls. Use \`angle\` to orient scratches; wear is vertical. Textures intentionally fill the entire frame, rather than using anchor or coverage controls.

\`GeometricShape\` supplies triangles, squares, rectangles, diamonds, parallelograms, chevrons, corner tabs, notched frames, stripes and cross grids. \`CircularLinework\` supplies open arcs, segmented rings, concentric circles and partial sweeps. Both use the same parent anchor, sizing and offset API as the original primitives. The Surface Textures, Graphic Shapes, Circular Linework Variations and Reference Compositions stories show these families separately and layered together.

\`coverage\` is an unbounded size multiplier: values above \`1\` may extend far beyond the parent and are clipped only by \`Decorations\`. \`aspectRatio\` controls the primitive's intrinsic canvas, which is fitted without stretching its geometry. \`offsetX\` and \`offsetY\` move the selected anchor in percentages or pixels.

\`position\` places the decoration's center exactly on that parent anchor. A \`center-right\` halftone therefore has its dense origin on the parent's right edge and naturally reveals a clipped half-circle. Halftones can decay by dot size, opacity, or both. Speed lines expose independent start/end widths and opacities plus configurable radial/vignette center radius, center opacity and feather.

\`\`\`tsx
<Decorations>
  <HalftoneDots
    position="top-right"
    shape="circle"
    density="dense"
    coverage={1.5}
    decayMode="both"
  />
  <SpeedLines
    position="bottom-left"
    variant="radial"
    shape="vignette"
    startWidth={0.05}
    endWidth={1.8}
    vignetteRadius={0.35}
    vignetteFeather={0.3}
  />
  <AccentStreak
    position="top-right"
    variant="brush"
    color="magenta"
    quantity={4}
    thickness={78}
    splatter={0.5}
  />
</Decorations>
\`\`\`

Custom \`items\` append after preset items. Direct children are also supported and render before item-based decorations.

### Composition editor
The Composition Editor keeps independent layers for a button, panel, card, image and sample page. Edit surface colors, shape/slant/step geometry, button variants, motion, icons and segments, image URL/ratio/fit and page padding. Select a target, add or reorder layers, then copy its JSX or JSON configuration. The exported configuration is a proposal; editing the story does not modify application defaults.

Use the same child API everywhere: \`<Button><Decorations preset="panel" />Read</Button>\`, \`<Panel><Decorations>...</Decorations>...</Panel>\`, or \`<main><Decorations preset="page-subtle" />...</main>\`. A containing element around an image uses \`<Decorations layer="overlay" />\`. No host-specific decoration props or host class are required. Legacy Panel, Card and PageShell props remain compatibility adapters.

### Geometry controls
\`decayOrigin\` selects the halftone's growth origin inside its own canvas, independently of \`position\`. Rectangle edge origins decay on a single axis. \`density\` scales quantity or spacing even when their values are explicitly supplied (medium is the neutral multiplier). \`direction\` supplies the base heading; \`angle\` adds a degree offset. Omit direction for automatic inward corner rays. \`spread\` controls the fan or radial arc; 360 makes a complete ring.

Numeric inputs beside sliders accept values beyond slider ranges. Speed lines support up to 2,048 effective rays, 128 modulation samples, seeded jitter and random width/opacity modulation along their length. Geometry workloads are bounded (120,000 halftone grid cells, 128 accent detail units and three fracture branch levels). Length, stretch, coverage and scale are not capped at the parent frame. Only the Decorations frame clips overflow, except for an explicitly selected line shape.
`;

const meta = {
	component: DecorationsPlayground,
	parameters: {
		controls: { disable: true },
		docs: { description: { component: componentDocs } },
	},
	tags: ["autodocs"],
	title: "Design System/Decorations/Gallery",
} satisfies Meta<typeof DecorationsPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
	name: "Decorations Playground",
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const type = canvas.getByLabelText("Decoration type");

		expect(canvas.getByLabelText("Dot size")).toBeVisible();
		expect(canvas.getByLabelText("Decay mode")).toBeVisible();
		expect(canvas.getByLabelText("X offset")).toBeVisible();
		expect(canvas.queryByLabelText("Line width")).not.toBeInTheDocument();
		const color = canvas.getByLabelText("Color", { exact: true });
		await userEvent.clear(color);
		await userEvent.type(color, "#83c5be");
		await userEvent.tab();
		expect(
			canvasElement
				.querySelector<SVGSVGElement>(".ts-decoration")
				?.style.getPropertyValue("--ts-decoration-color"),
		).toBe("#83c5be");

		await userEvent.selectOptions(type, "speed-lines");
		expect(canvas.getByLabelText("Line width")).toBeVisible();
		expect(canvas.getByLabelText("End width")).toBeVisible();
		expect(canvas.getByLabelText("Origin radius")).toBeVisible();
		expect(canvas.getByLabelText("Vignette feather")).toBeVisible();
		expect(canvas.queryByLabelText("Dot size")).not.toBeInTheDocument();

		await userEvent.selectOptions(type, "accent-streak");
		expect(canvas.getByLabelText("Thickness")).toBeVisible();
		expect(canvas.getByLabelText("Splatter")).toBeVisible();
		expect(canvas.queryByLabelText("Line width")).not.toBeInTheDocument();
	},
};

export const SurfaceTextures: Story = {
	render: () => (
		<VariationGallery
			items={(
				["paper", "grain", "grunge", "scratches", "scuffs", "wear"] as const
			).map((variant) => ({
				label: variant,
				item: {
					type: "background-texture",
					variant,
					opacity: variant === "paper" ? 0.24 : 0.35,
					roughness: 0.8,
					seed: 7,
				},
			}))}
		/>
	),
};

export const GraphicShapes: Story = {
	render: () => (
		<VariationGallery
			items={(
				[
					"triangle",
					"square",
					"rectangle",
					"diamond",
					"parallelogram",
					"chevron",
					"corner-cut",
					"notched-frame",
					"stripes",
					"cross-grid",
				] as const
			).map((shape, i) => ({
				label: shape,
				item: {
					type: "geometric",
					shape,
					color: (["cyan", "magenta", "yellow", "foreground"] as const)[i % 4],
					coverage: 0.85,
					quantity: shape === "stripes" ? 12 : shape === "cross-grid" ? 36 : 1,
					spacing: 38,
					strokeWidth: shape === "stripes" ? 12 : 3,
					position: shape === "corner-cut" ? "top-left" : "center",
					cut: 240,
				},
			}))}
		/>
	),
};

export const CircularLineworkVariations: Story = {
	render: () => (
		<VariationGallery
			items={(["open-arc", "broken-ring", "concentric", "sweep"] as const).map(
				(variant, i) => ({
					label: variant,
					item: {
						type: "circular-linework",
						variant,
						quantity: 7,
						coverage: 0.9,
						color: i % 2 ? "neutral" : "cyan",
						strokeWidth: 2,
						rotation: -45,
						spacing: 17,
						arc: variant === "sweep" ? 150 : 270,
					},
				}),
			)}
		/>
	),
};

export const ReferenceCompositions: Story = {
	render: () => (
		<div className="grid max-w-6xl gap-6 md:grid-cols-2">
			{(
				[
					"editorial-texture",
					"brush-halftone",
					"technical-linework",
					"graphic-corners",
				] as const
			).map((preset) => (
				<Panel key={preset} className="min-h-64">
					<Decorations preset={preset} />
					<PanelHeading title={preset} />
					<PanelContent>
						<p className="max-w-xs">A city of light. A web of secrets.</p>
						<Button className="mt-6" variant="outline">
							<Decorations preset="paper-subtle" />
							Open library <ArrowRight />
						</Button>
					</PanelContent>
				</Panel>
			))}
		</div>
	),
};

export const DecoratedButtonStates: Story = {
	render: () => (
		<div className="grid max-w-4xl gap-6 sm:grid-cols-3">
			{(["default", "outline", "ink"] as const).flatMap((variant) =>
				([false, true] as const).map((disabled) => (
					<Button
						key={`${variant}-${disabled}`}
						variant={variant}
						disabled={disabled}
					>
						<Decorations
							items={[
								{ type: "background-texture", variant: "paper", opacity: 0.15 },
								{
									type: "halftone",
									color: variant === "default" ? "foreground" : "cyan",
									position: "center-right",
									coverage: 0.4,
									opacity: 0.2,
									spacing: 18,
								},
								{
									type: "accent-streak",
									color: variant === "default" ? "foreground" : "cyan",
									variant: "dry-brush",
									position: "top-left",
									direction: "up-right",
									length: 2,
									coverage: 0.6,
									opacity: 0.3,
								},
							]}
						/>
						Explore tales <ArrowRight />
					</Button>
				)),
			)}
		</div>
	),
};

export const DirectChildComposition: Story = {
	render: () => (
		<DecorationStage className="h-96 max-w-5xl">
			<Decorations>
				<HalftoneDots
					color="neutral"
					coverage={0.5}
					density="dense"
					position="bottom-left"
					shape="triangle"
				/>
				<SpeedLines
					color="neutral"
					coverage={0.62}
					density="sparse"
					position="top-right"
					variant="velocity"
				/>
				<AccentStreak
					color="magenta"
					coverage={0.42}
					position="top-right"
					variant="dry-brush"
				/>
			</Decorations>
		</DecorationStage>
	),
};

function VariationGallery({
	items,
}: {
	items: Array<{ item: Decoration; label: string }>;
}) {
	return (
		<div className="grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ item, label }) => (
				<div key={label}>
					<DecorationStage className="h-56">
						<Decorations items={[item]} />
					</DecorationStage>
					<strong className="mt-2 block text-xs uppercase">{label}</strong>
				</div>
			))}
		</div>
	);
}

export const HalftonePositions: Story = {
	render: () => (
		<VariationGallery
			items={(
				[
					"top-left",
					"top-center",
					"top-right",
					"center-left",
					"center",
					"center-right",
					"bottom-left",
					"bottom-center",
					"bottom-right",
				] as const
			).map((position) => ({
				item: {
					color: "neutral",
					coverage: 0.72,
					density: "medium",
					position,
					shape: "circle",
					type: "halftone",
				},
				label: position,
			}))}
		/>
	),
};

export const HalftoneShapes: Story = {
	render: () => (
		<VariationGallery
			items={halftoneShapes.map((shape) => ({
				item: {
					color: "neutral",
					coverage: shape === "field" || shape === "vignette" ? 1 : 0.72,
					density: "medium",
					position: "top-right",
					shape,
					type: "halftone",
				},
				label: shape,
			}))}
		/>
	),
};

export const HalftoneDensity: Story = {
	render: () => (
		<VariationGallery
			items={densities.map((density) => ({
				item: {
					color: "neutral",
					coverage: 0.72,
					density,
					position: "bottom-left",
					shape: "triangle",
					type: "halftone",
				},
				label: density,
			}))}
		/>
	),
};

export const HalftoneParentRatios: Story = {
	render: () => (
		<div className="grid max-w-6xl gap-4 lg:grid-cols-[2fr_1fr_0.7fr]">
			{[
				{ className: "h-40", label: "Wide parent" },
				{ className: "aspect-square", label: "Square parent" },
				{ className: "h-80", label: "Tall parent" },
			].map(({ className, label }) => (
				<div key={label}>
					<DecorationStage className={className}>
						<Decorations>
							<HalftoneDots
								aspectRatio={1}
								coverage={1}
								density="medium"
								position="center"
								shape="circle"
							/>
						</Decorations>
					</DecorationStage>
					<strong className="mt-2 block text-xs uppercase">{label}</strong>
				</div>
			))}
		</div>
	),
};

export const SpeedLineVariations: Story = {
	render: () => (
		<VariationGallery
			items={(
				[
					"tapered",
					"brush",
					"electric",
					"shards",
					"velocity",
					"radial",
					"fan",
					"laser",
				] as const
			).map((variant, index) => ({
				item: {
					color: "neutral",
					coverage: 0.88,
					density: (["sparse", "airy", "medium"] as const)[index % 3],
					opacity: 0.72,
					position: "center",
					type: "speed-lines",
					variant,
				},
				label: variant,
			}))}
		/>
	),
};

export const SpeedLineShapes: Story = {
	render: () => (
		<VariationGallery
			items={[
				{ label: "circle inside", shape: "circle", shapeMode: "inside" },
				{ label: "triangle inside", shape: "triangle", shapeMode: "inside" },
				{ label: "square cutout", shape: "square", shapeMode: "outside" },
				{ label: "rectangle cutout", shape: "rectangle", shapeMode: "outside" },
				{ label: "circular vignette", shape: "vignette", shapeMode: "outside" },
			].map(({ label, shape, shapeMode }) => ({
				item: {
					angle: -18,
					color: "neutral",
					coverage: 0.94,
					density: "dense",
					position: "center",
					shape: shape as
						| "circle"
						| "rectangle"
						| "square"
						| "triangle"
						| "vignette",
					shapeMode: shapeMode as "inside" | "outside",
					type: "speed-lines",
					variant: "velocity",
				},
				label,
			}))}
		/>
	),
};

export const SpeedLineOrigins: Story = {
	render: () => (
		<VariationGallery
			items={[
				{ label: "top-left laser", position: "top-left", variant: "laser" },
				{ label: "top-right fan", position: "top-right", variant: "fan" },
				{
					label: "bottom-left laser",
					position: "bottom-left",
					variant: "laser",
				},
				{ label: "bottom-right fan", position: "bottom-right", variant: "fan" },
				{ label: "center radial", position: "center", variant: "radial" },
			].map(({ label, position, variant }) => ({
				item: {
					color: "neutral",
					coverage: 0.88,
					length: 0.82,
					originRadius: variant === "radial" ? 0.2 : 0,
					position: position as
						| "bottom-left"
						| "bottom-right"
						| "center"
						| "top-left"
						| "top-right",
					quantity: 26,
					spread: variant === "radial" ? 360 : 78,
					type: "speed-lines",
					variant: variant as "fan" | "laser" | "radial",
				},
				label,
			}))}
		/>
	),
};

export const AccentStreakVariations: Story = {
	render: () => (
		<VariationGallery
			items={(
				[
					"brush",
					"dry-brush",
					"slashes",
					"splatter",
					"underline",
					"splash",
					"burst",
					"lightning",
					"cracks",
					"fracture",
					"ink",
					"comet",
				] as const
			).map((variant, index) => ({
				item: {
					color: (["cyan", "magenta", "yellow"] as const)[index % 3],
					coverage: 0.86,
					density: "medium",
					position: "center",
					type: "accent-streak",
					variant,
				},
				label: variant,
			}))}
		/>
	),
};

export const CombinedDecorations: Story = {
	render: () => (
		<div className="grid max-w-6xl gap-4 md:grid-cols-3">
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
					key={preset}
				>
					<Decorations preset={preset} />
					<span className="absolute bottom-4 left-4 z-10 font-black text-xs uppercase">
						{preset}
					</span>
				</PageShell>
			))}
		</div>
	),
};

export const ImageDecorationExamples: Story = {
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
					<TaleImage
						alt="Fantasy city"
						className="object-cover"
						width={640}
						height={360}
						shapes={[]}
						borderWidth={2}
						decorations={preset}
						src="/assets/site/ember-city-light.png"
					/>
					<strong className="mt-2 block text-xs uppercase">{preset}</strong>
				</div>
			))}
		</div>
	),
};

export const PanelDecorationExamples: Story = {
	render: () => (
		<div className="grid max-w-4xl gap-5 sm:grid-cols-2">
			<Panel>
				<Decorations preset="panel" />
				<PanelHeading title="Subtle panel" />
				<PanelContent>Parent-responsive halftone detail.</PanelContent>
			</Panel>
			<Panel>
				<Decorations preset="panel-selected" />
				<PanelHeading title="Selected panel" />
				<PanelContent>Opt-in comic emphasis.</PanelContent>
			</Panel>
			<Card>
				<Decorations preset="cyan-corner" />
				<PanelHeading title="Cyan card" />
				<PanelContent>Media-scale composition.</PanelContent>
			</Card>
			<Card>
				<Decorations preset="magenta-corner" />
				<PanelHeading title="Magenta card" />
				<PanelContent>Same parent-relative API.</PanelContent>
			</Card>
		</div>
	),
};

export const ButtonDecorationExamples: Story = {
	render: () => (
		<div className="flex max-w-3xl flex-wrap gap-8 p-8">
			<Button shape="slant-right">
				<Decorations preset="brush-halftone" />
				Strikes <ArrowRight />
			</Button>
			<Button shape="corner-right" variant="outline">
				<Decorations>
					<HalftoneDots color="magenta" position="bottom-left" coverage={1.3} />
				</Decorations>
				Bubbles
			</Button>
		</div>
	),
};
