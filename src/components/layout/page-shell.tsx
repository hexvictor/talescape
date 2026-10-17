"use client";

import {
	type ComponentProps,
	type ElementType,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { PageDecorations } from "~/components/decorations";
import type {
	Decoration,
	DecorationPreset,
	PageDecorationPreset,
} from "~/components/decorations/types";
import { Shape, type ShapeOptions } from "~/components/ui/shape";
import cn from "~/lib/utils/cn";

export type PageShellProps = ComponentProps<"div"> &
	ShapeOptions & {
		as?: ElementType;
		/** Escape transformed Reader/Studio ancestors for viewport feedback screens. */
		fullscreen?: boolean;
		surfaceClassName?: string;
		decorations?: PageDecorationPreset | Decoration[];
		/** @deprecated Use a <Decorations items={...} /> child. */
		decorationItems?: Decoration[];
		/** @deprecated Use a <Decorations preset="..." /> child. */
		decorationPreset?: DecorationPreset;
	};

/** Page-level decoration host. Custom items append above the selected preset. */
export function PageShell({
	as: Component = "div",
	fullscreen = false,
	children,
	className,
	surfaceClassName,
	decorationItems,
	decorationPreset,
	decorations,
	shapes,
	borderWidth,
	borderColor,
	shadow,
	shadowColor,
	shadowOffset,
	...props
}: PageShellProps): React.JSX.Element {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const present = (surface: React.JSX.Element) =>
		fullscreen && mounted ? createPortal(surface, document.body) : surface;
	const content = (
		<>
			<PageDecorations
				className={
					decorations === "site-background"
						? "ts-viewport-decorations"
						: undefined
				}
				items={
					Array.isArray(decorations)
						? [...decorations, ...(decorationItems ?? [])]
						: decorationItems
				}
				preset={
					typeof decorations === "string" ? decorations : decorationPreset
				}
			/>
			{children}
		</>
	);
	if (shapes)
		return present(
			<Shape
				{...props}
				as={Component}
				shapes={shapes}
				borderWidth={borderWidth}
				borderColor={borderColor}
				shadow={shadow}
				shadowColor={shadowColor}
				shadowOffset={shadowOffset}
				className={cn(
					"min-h-0 w-full flex-1",
					className,
					fullscreen && "fixed inset-0 z-50 overflow-auto",
				)}
				surfaceClassName={surfaceClassName}
				data-reader-component="PageShell"
				data-reader-role="page-surface"
			>
				{content}
			</Shape>,
		);
	return present(
		<Component
			data-reader-component="PageShell"
			data-reader-role="page-surface"
			{...props}
			className={cn(
				"ts-decoration-host relative isolate min-h-0 w-full flex-1",
				className,
				fullscreen && "fixed inset-0 z-50 overflow-auto",
				surfaceClassName,
			)}
			data-slot="page-shell"
		>
			{content}
		</Component>,
	);
}
