import type { ComponentProps } from "react";
import cn from "~/lib/utils/cn";
import { Decorations } from "./decorations";
import type { Decoration, MediaDecorationPreset } from "./types";

export type DecoratedMediaProps = ComponentProps<"div"> & {
	decorations?: Decoration[];
	preset?: MediaDecorationPreset;
};

export function DecoratedMedia({
	children,
	className,
	decorations,
	preset,
	...props
}: DecoratedMediaProps): React.JSX.Element {
	return (
		<div
			{...props}
			className={cn(
				"ts-decoration-host relative isolate overflow-hidden",
				className,
			)}
			data-decoration-layer="overlay"
			data-slot="decorated-media"
		>
			<Decorations items={decorations} preset={preset} />
			{children}
		</div>
	);
}
