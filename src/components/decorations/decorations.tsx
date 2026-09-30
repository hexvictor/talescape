import type { ComponentProps } from "react";
import cn from "~/lib/utils/cn";
import { resolveDecorationItems } from "./presets";
import {
	AccentStreak,
	CircularLinework,
	GeometricShapes,
	Halftone,
	PaperTexture,
	ScratchLines,
	SpeedLines,
} from "./primitives";
import type { Decoration, DecorationPreset } from "./types";

function DecorationItem({ item }: { item: Decoration }): React.JSX.Element {
	switch (item.type) {
		case "halftone":
			return <Halftone {...item} />;
		case "speed-lines":
			return <SpeedLines {...item} />;
		case "accent-streak":
			return <AccentStreak {...item} />;
		case "scratch-lines":
			return <ScratchLines {...item} />;
		case "circular-linework":
			return <CircularLinework {...item} />;
		case "geometric-shape":
			return <GeometricShapes {...item} />;
		case "paper-texture":
			return <PaperTexture {...item} />;
	}
}

export type DecorationsProps = Omit<ComponentProps<"div">, "children"> & {
	/** Custom items append after preset items and therefore paint above them. */
	items?: Decoration[];
	preset?: DecorationPreset;
};

export function Decorations({
	className,
	items = [],
	preset,
	...props
}: DecorationsProps): React.JSX.Element | null {
	const resolvedItems = resolveDecorationItems(preset, items);
	if (resolvedItems.length === 0) return null;

	return (
		<div
			{...props}
			aria-hidden="true"
			className={cn("ts-decorations", className)}
			data-decoration-preset={preset}
			data-slot="decorations"
		>
			{resolvedItems.map((item, index) => (
				<DecorationItem
					item={item}
					key={`${item.type}-${item.position}-${index}`}
				/>
			))}
		</div>
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
