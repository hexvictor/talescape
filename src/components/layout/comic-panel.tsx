import type {
	CSSProperties,
	ComponentProps,
	ElementType,
	ReactNode,
} from "react";
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
	className,
	decoration = "none",
	shape = "cut-opposite",
	shadow = true,
	slant,
	style,
	...props
}: ComponentProps<"section"> & {
	accent?: keyof typeof accentColors | string;
	as?: ElementType;
	decoration?: "dots" | "none" | "strikes";
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
		<Component
			className={cn("comic-panel", className)}
			data-comic-decoration={decoration}
			data-comic-shadow={shadow ? "true" : "false"}
			data-comic-shape={shape}
			style={panelStyle}
			{...props}
		/>
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
			className={cn("comic-rail", className)}
			style={{ "--comic-rail-accent": color } as CSSProperties}
		>
			<span aria-hidden="true" />
			{children}
		</div>
	);
}
