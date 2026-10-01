import type { ComponentProps } from "react";
import cn from "~/lib/utils/cn";
import { resolveDecorationItems } from "./presets";
import { AccentStreak, HalftoneDots, SpeedLines } from "./primitives";
import type { Decoration, DecorationPreset } from "./types";

function DecorationItem({ item }: { item: Decoration }): React.JSX.Element {
	switch (item.type) {
		case "halftone":
			return <HalftoneDots {...item} />;
		case "speed-lines":
			return <SpeedLines {...item} />;
		case "accent-streak":
			return <AccentStreak {...item} />;
	}
}

export type DecorationsProps = ComponentProps<"div"> & {
	/** Custom items append after preset items and therefore paint above them. */
	items?: Decoration[];
	preset?: DecorationPreset;
};

export function Decorations({
	children,
	className,
	items = [],
	preset,
	...props
}: DecorationsProps): React.JSX.Element | null {
	const resolvedItems = resolveDecorationItems(preset, items);
	if (resolvedItems.length === 0 && !children) return null;

	return (
		<div
			{...props}
			aria-hidden="true"
			className={cn("ts-decorations", className)}
			data-decoration-preset={preset}
			data-slot="decorations"
		>
			{children}
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
