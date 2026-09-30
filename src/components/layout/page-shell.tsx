import type { ComponentProps, ElementType } from "react";
import { PageDecorations } from "~/components/decorations";
import type {
	Decoration,
	DecorationPreset,
} from "~/components/decorations/types";
import cn from "~/lib/utils/cn";

export type PageShellProps = ComponentProps<"div"> & {
	as?: ElementType;
	decorationItems?: Decoration[];
	decorationPreset?: DecorationPreset;
};

/** Page-level decoration host. Custom items append above the selected preset. */
export function PageShell({
	as: Component = "div",
	children,
	className,
	decorationItems,
	decorationPreset,
	...props
}: PageShellProps): React.JSX.Element {
	return (
		<Component
			{...props}
			className={cn("ts-decoration-host relative isolate", className)}
			data-slot="page-shell"
		>
			<PageDecorations items={decorationItems} preset={decorationPreset} />
			{children}
		</Component>
	);
}
