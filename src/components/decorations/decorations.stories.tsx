import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Card, Panel, PanelContent, PanelHeading } from "~/components/ui/panel";
import cn from "~/lib/utils/cn";
import { DecoratedMedia } from "./decorated-media";
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

const componentDocs = `Three parent-responsive comic decoration primitives. Each primitive owns its specific controls, while \`Decorations\` supplies the clipping and composition frame. The canvas workbench keeps controls beside the preview and only shows properties supported by the selected type.

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
`;

const meta = {
	component: DecorationsPlayground,
	parameters: {
		controls: { disable: true },
		docs: { description: { component: componentDocs } },
	},
	tags: ["autodocs"],
	title: "Design System/Decorations",
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

export const HalftoneEditor: Story = {
	render: () => <DecorationsWorkbench initialType="halftone" lockType />,
};

export const SpeedLinesEditor: Story = {
	render: () => <DecorationsWorkbench initialType="speed-lines" lockType />,
};

export const AccentStreakEditor: Story = {
	render: () => <DecorationsWorkbench initialType="accent-streak" lockType />,
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
	render: () => (
		<div className="grid max-w-4xl gap-5 sm:grid-cols-2">
			<Panel decorations="subtle">
				<PanelHeading title="Subtle panel" />
				<PanelContent>Parent-responsive halftone detail.</PanelContent>
			</Panel>
			<Panel decorations="selected">
				<PanelHeading title="Selected panel" />
				<PanelContent>Opt-in comic emphasis.</PanelContent>
			</Panel>
			<Card decorations="accent-cyan">
				<PanelHeading title="Cyan card" />
				<PanelContent>Media-scale composition.</PanelContent>
			</Card>
			<Card decorations="accent-magenta">
				<PanelHeading title="Magenta card" />
				<PanelContent>Same parent-relative API.</PanelContent>
			</Card>
		</div>
	),
};

export const ButtonDecorationExamples: Story = {
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
		</div>
	),
};
