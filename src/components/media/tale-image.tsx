"use client";

import NextImage, { type ImageProps } from "next/image";
import { type CSSProperties, type ReactNode, useMemo } from "react";
import cn from "~/lib/utils/cn";
import { Decorations } from "../decorations/decorations";
import type { Decoration, MediaDecorationPreset } from "../decorations/types";
import {
	type GeometryStyle,
	type SurfaceShapeProps,
	geometryShapeTreatments,
	resolveGeometrySlant,
} from "../ui/geometry";
import { ShapeOutline, type ShapeStyle, useShapeGeometry } from "../ui/shape";

export type TaleImageProps = ImageProps &
	SurfaceShapeProps & {
		children?: ReactNode;
		decorations?: MediaDecorationPreset | Decoration[];
		frameClassName?: string;
		frameStyle?: CSSProperties;
	};

/** Next Image owns loading/optimization; its frame owns shape, shadow and decoration composition. */
export function TaleImage({
	children,
	decorations,
	frameClassName,
	frameStyle,
	shape = "rectangle",
	shapes,
	slant,
	edgeSlant,
	stepPosition,
	stepDepth,
	shadow = false,
	shadowOffset = 4,
	shadowColor = "var(--foreground)",
	borderWidth = 0,
	borderColor,
	className,
	fill,
	width,
	height,
	...props
}: TaleImageProps) {
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
	const outline = useShapeGeometry(resolvedShapes);
	return (
		<div
			ref={outline.ref}
			data-reader-component="TaleImage"
			data-reader-role="image-frame"
			data-slot="tale-image"
			data-ts-shape={shape}
			className={cn(
				"ts-geometry relative isolate max-w-full",
				fill ? "absolute inset-0" : "inline-block align-top",
				shadow && "ts-shape-shadow",
				frameClassName,
			)}
			style={
				{
					...frameStyle,
					background: undefined,
					"--ts-geometry-slant": resolveGeometrySlant(slant),
					"--ts-geometry-edge-slant": resolveGeometrySlant(edgeSlant),
					"--ts-geometry-step-position": stepPosition,
					"--ts-geometry-step-depth": stepDepth,
					...outline.style,
					"--ts-shape-shadow-color": shadowColor,
					"--ts-shape-shadow-offset": `${shadowOffset}px`,
				} as GeometryStyle & ShapeStyle
			}
		>
			<div
				data-reader-component="TaleImage"
				data-reader-role="clipped-image-surface"
				data-decoration-layer="overlay"
				className="ts-geometry-clip relative isolate h-full overflow-hidden"
				style={{ background: frameStyle?.background }}
			>
				<NextImage
					{...props}
					fill={fill}
					width={width}
					height={height}
					className={cn("block", className)}
				/>
				{decorations && (
					<Decorations
						layer="overlay"
						preset={typeof decorations === "string" ? decorations : undefined}
						items={Array.isArray(decorations) ? decorations : undefined}
					/>
				)}
				{children}
			</div>
			<ShapeOutline
				geometry={outline.geometry}
				{...outline.size}
				borderWidth={borderWidth}
				borderColor={borderColor}
			/>
		</div>
	);
}
