import type {
	CSSProperties,
	ComponentProps,
	ElementType,
	ReactNode,
} from "react";
import { Decorations } from "~/components/decorations";
import type {
	Decoration,
	PanelDecorationPreset,
} from "~/components/decorations/types";
import { geometryShapeTreatments } from "~/components/ui/geometry";
import { Panel } from "~/components/ui/panel";
import type { ShapeOptions } from "~/components/ui/shape";
import cn from "~/lib/utils/cn";

export type ComicPanelShape =
	| "rectangle"
	| "slant-left"
	| "slant-right"
	| "slant-both"
	| "corner-top-left"
	| "corner-top-right"
	| "corner-bottom-left"
	| "corner-bottom-right"
	| "corners-left"
	| "corners-right"
	| "cut-opposite"
	| "cut-opposite-reverse";

type ComicPanelStyle = CSSProperties & {
	"--comic-panel-accent"?: string;
	"--comic-panel-slant"?: string;
};

const accentColors = {
	accent: "var(--accent)",
	foreground: "var(--foreground)",
	primary: "var(--primary)",
	secondary: "var(--secondary)",
} as const;

/** Framed comic surface with configurable full-side and corner cuts. */
export function ComicPanel({
	accent,
	as: Component = "section",
	children,
	className,
	surfaceClassName,
	decoration = "none",
	decorations,
	shape = "cut-opposite",
	shadow = true,
	slant,
	style,
	shapes,
	borderWidth,
	borderColor,
	shadowColor,
	shadowOffset,
	...props
}: ComponentProps<"section"> &
	ShapeOptions & {
		accent?: keyof typeof accentColors | string;
		as?: ElementType;
		surfaceClassName?: string;
		/** @deprecated Compose a Decorations child instead. */
		decoration?: "dots" | "none" | "strikes";
		decorations?: PanelDecorationPreset | Decoration[];
		shape?: ComicPanelShape;
		shadow?: boolean;
		slant?: `${number}px`;
	}): React.JSX.Element {
	const panelStyle: ComicPanelStyle = { ...style };
	if (slant) panelStyle["--comic-panel-slant"] = slant;
	if (accent) {
		panelStyle["--comic-panel-accent"] =
			accent in accentColors
				? accentColors[accent as keyof typeof accentColors]
				: accent;
	}
	return (
		<Panel
			data-reader-component="ComicPanel"
			data-reader-role="comic-panel"
			{...props}
			as={Component}
			shapes={shapes ?? geometryShapeTreatments(shape, slant)}
			slant={slant}
			shadow={shadow}
			borderWidth={borderWidth}
			borderColor={borderColor}
			shadowColor={shadowColor ?? panelStyle["--comic-panel-accent"]}
			shadowOffset={shadowOffset}
			decorations={decorations}
			className={className}
			surfaceClassName={surfaceClassName}
			style={panelStyle}
			appearance="comic"
		>
			{decoration !== "none" && (
				<Decorations
					preset={decoration === "dots" ? "halftone-corner" : "brush-halftone"}
				/>
			)}
			{children}
		</Panel>
	);
}

/** Angular black label rail used to introduce page and card sections. */
export function ComicRail({
	accent = "secondary",
	children,
	className,
}: {
	accent?: keyof typeof accentColors | string;
	children: ReactNode;
	className?: string;
}): React.JSX.Element {
	const color =
		accent in accentColors
			? accentColors[accent as keyof typeof accentColors]
			: accent;
	return (
		<div
			data-reader-component="ComicRail"
			data-reader-role="section-rail"
			className={cn("comic-rail", className)}
			style={{ "--comic-rail-accent": color } as CSSProperties}
		>
			<span aria-hidden="true" />
			{children}
		</div>
	);
}
