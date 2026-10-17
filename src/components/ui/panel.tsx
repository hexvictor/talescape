"use client";

import { type VariantProps, cva } from "class-variance-authority";
import {
	type ComponentProps,
	type ElementType,
	type ReactNode,
	useMemo,
} from "react";
import { Decorations } from "~/components/decorations/decorations";
import {
	cardDecorationPresets,
	panelDecorationPresets,
} from "~/components/decorations/presets";
import type {
	CardDecorationPreset,
	Decoration,
	PanelDecorationPreset,
} from "~/components/decorations/types";
import cn from "~/lib/utils/cn";
import {
	type GeometryShape,
	type GeometrySlant,
	type GeometryStyle,
	type SurfaceShapeProps,
	geometryShapeTreatments,
	resolveGeometrySlant,
} from "./geometry";
import { ShapeOutline, type ShapeStyle, useShapeGeometry } from "./shape";

const panelVariants = cva("min-w-0 bg-card text-card-foreground", {
	variants: {
		appearance: {
			comic: "border-2 border-foreground shadow-[4px_4px_0_var(--secondary)]",
			ghost: "border-0 bg-transparent shadow-none",
			raised: "border-2 border-foreground shadow-[var(--ts-shadow-comic)]",
			subtle: "border border-border shadow-[var(--ts-shadow-subtle)]",
		},
	},
	defaultVariants: { appearance: "raised" },
});

export type PanelProps = ComponentProps<"section"> &
	VariantProps<typeof panelVariants> & {
		as?: ElementType;
		shape?: GeometryShape;
		slant?: GeometrySlant;
		stepPosition?: `${number}%`;
		stepDepth?: `${number}px`;
		decorations?: PanelDecorationPreset | Decoration[];
		surfaceClassName?: string;
	} & SurfaceShapeProps;

export function Panel({
	appearance,
	as: Component = "section",
	children,
	className,
	decorations,
	shape = "rectangle",
	slant,
	stepPosition,
	stepDepth,
	style,
	shapes,
	edgeSlant,
	borderWidth,
	borderColor,
	shadow,
	shadowColor,
	shadowOffset = 4,
	surfaceClassName,
	ref,
	...props
}: PanelProps): React.JSX.Element {
	const preset =
		typeof decorations === "string"
			? panelDecorationPresets[decorations]
			: undefined;
	const items = Array.isArray(decorations) ? decorations : undefined;
	const resolvedShapes = useMemo(
		() =>
			typeof shapes === "string"
				? geometryShapeTreatments(
						shapes,
						slant,
						stepPosition,
						stepDepth,
						edgeSlant,
					)
				: (shapes ??
					(shape !== "rectangle"
						? geometryShapeTreatments(
								shape,
								slant,
								stepPosition,
								stepDepth,
								edgeSlant,
							)
						: undefined)),
		[shapes, shape, slant, stepPosition, stepDepth, edgeSlant],
	);
	const outline = useShapeGeometry(resolvedShapes, ref);
	const composed = resolvedShapes !== undefined;
	const framed = composed || shape !== "rectangle";
	return (
		<Component
			ref={outline.ref}
			data-reader-component="Panel"
			data-reader-role="panel-surface"
			{...props}
			data-slot="panel"
			data-ts-shape={shape}
			data-composed-shape={composed || undefined}
			style={
				{
					...style,
					background: !framed ? style?.background : undefined,
					"--ts-geometry-slant": resolveGeometrySlant(slant),
					"--ts-geometry-step-position": stepPosition,
					"--ts-geometry-step-depth": stepDepth,
					"--ts-geometry-edge-slant": resolveGeometrySlant(edgeSlant),
					...outline.style,
					"--ts-shape-shadow-offset": `${shadowOffset}px`,
					"--ts-shape-shadow-color":
						shadowColor ??
						(appearance === "comic" ? "var(--secondary)" : "var(--foreground)"),
				} as GeometryStyle & ShapeStyle
			}
			className={cn(
				panelVariants({ appearance }),
				"ts-decoration-host relative isolate",
				framed &&
					"ts-shaped-panel ts-geometry !bg-transparent border-0 shadow-none",
				framed && (shadow ?? appearance !== "ghost") && "ts-shape-shadow",
				shadow === false && "!shadow-none [filter:none]",
				decorations && "ts-decoration-host relative isolate overflow-hidden",
				className,
			)}
		>
			{framed ? (
				<div
					data-reader-component="Panel"
					data-reader-role="clipped-panel-surface"
					className={cn(
						"ts-geometry-inner-clip relative isolate overflow-hidden",
						appearance === "ghost" ? "bg-transparent" : "bg-card",
						!composed && "m-0.5",
						surfaceClassName,
					)}
					style={{ background: style?.background }}
				>
					{decorations ? <Decorations preset={preset} items={items} /> : null}
					{children}
				</div>
			) : (
				<>
					{decorations ? <Decorations preset={preset} items={items} /> : null}
					{children}
				</>
			)}
			{composed && (
				<ShapeOutline
					geometry={outline.geometry}
					{...outline.size}
					borderWidth={
						borderWidth ??
						(appearance === "ghost" ? 0 : appearance === "subtle" ? 1 : 2)
					}
					borderColor={borderColor}
				/>
			)}
		</Component>
	);
}

export type CardProps = Omit<PanelProps, "as" | "decorations"> & {
	decorations?: CardDecorationPreset | Decoration[];
};

/** Semantic article surface. Decoration presets are opt-in. */
export function Card({
	decorations,
	children,
	...props
}: CardProps): React.JSX.Element {
	const resolvedDecorations =
		typeof decorations === "string"
			? cardDecorationPresets[decorations]
			: undefined;
	return (
		<Panel
			data-reader-component="Card"
			data-reader-role="card-surface"
			{...props}
			as="article"
		>
			{decorations && (
				<Decorations
					preset={resolvedDecorations}
					items={Array.isArray(decorations) ? decorations : undefined}
				/>
			)}
			{children}
		</Panel>
	);
}

export function PanelHeader({
	children,
	className,
	...props
}: ComponentProps<"header">): React.JSX.Element {
	return (
		<header
			data-reader-component="PanelHeader"
			data-reader-role="panel-header"
			{...props}
			data-slot="panel-header"
			className={cn(
				"flex min-w-0 items-start justify-between gap-3 border-border border-b px-4 py-3",
				className,
			)}
		>
			{children}
		</header>
	);
}

export function PanelHeading({
	actions,
	className,
	description,
	title,
}: {
	actions?: ReactNode;
	className?: string;
	description?: ReactNode;
	title: ReactNode;
}): React.JSX.Element {
	return (
		<PanelHeader className={className}>
			<div className="min-w-0 flex-1">
				<h3 className="font-black text-xs uppercase">{title}</h3>
				{description ? (
					<p className="mt-1 text-[11px] text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{actions ? <div className="shrink-0">{actions}</div> : null}
		</PanelHeader>
	);
}

export function PanelContent({
	className,
	density = "default",
	...props
}: ComponentProps<"div"> & {
	density?: "compact" | "default";
}): React.JSX.Element {
	return (
		<div
			data-reader-component="PanelContent"
			data-reader-role="panel-content"
			{...props}
			data-slot="panel-content"
			className={cn(
				density === "compact" ? "p-3" : "p-[var(--ts-panel-padding)]",
				className,
			)}
		/>
	);
}
