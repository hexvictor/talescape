import type { ComponentProps } from "react";
import cn from "~/lib/utils/cn";
import { resolveDecorationItems } from "./presets";
import { AccentStreak, HalftoneDots, SpeedLines } from "./primitives";
import {
	BackgroundTexture,
	CircularLinework,
	GeometricShape,
} from "./surface-primitives";
import type { Decoration, DecorationPreset } from "./types";

function DecorationItem({ item }: { item: Decoration }): React.JSX.Element {
	switch (item.type) {
		case "background-texture":
			return <BackgroundTexture {...item} />;
		case "geometric":
			return <GeometricShape {...item} />;
		case "circular-linework":
			return <CircularLinework {...item} />;
		case "halftone":
			return <HalftoneDots {...item} />;
		case "speed-lines":
			return <SpeedLines {...item} />;
		case "accent-streak":
			return <AccentStreak {...item} />;
	}
}

export type DecorationsProps = ComponentProps<"span"> & {
	layer?: "background" | "overlay";
	/** Custom items append after preset items and therefore paint above them. */
	items?: Decoration[];
	preset?: DecorationPreset;
};

export function Decorations({
	children,
	className,
	items = [],
	layer = "background",
	preset,
	...props
}: DecorationsProps): React.JSX.Element | null {
	const resolvedItems = resolveDecorationItems(preset, items);
	if (resolvedItems.length === 0 && !children) return null;

	return (
		<span
			{...props}
			aria-hidden="true"
			className={cn("ts-decorations", className)}
			data-decoration-preset={preset}
			data-slot="decorations"
			data-decoration-layer={layer}
			data-reader-component="Decorations"
			data-reader-role="decoration-frame"
		>
			{children}
			{resolvedItems.map((item, index) => (
				<DecorationItem
					item={item}
					key={`${item.type}-${item.position}-${index}`}
				/>
			))}
		</span>
	);
}

export type PageDecorationsProps = DecorationsProps;

export function PageDecorations(
	props: PageDecorationsProps,
): React.JSX.Element | null {
	return (
		<Decorations
			{...props}
			className={cn("ts-page-decorations", props.className)}
		/>
	);
}
