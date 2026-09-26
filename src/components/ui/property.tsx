import type { ComponentProps, ReactNode } from "react";
import cn from "~/lib/utils/cn";

export function PropertyGroup({
	className,
	...props
}: ComponentProps<"dl">): React.JSX.Element {
	return (
		<dl
			{...props}
			data-slot="property-group"
			className={cn("grid min-w-0 divide-y divide-border", className)}
		/>
	);
}

export function PropertyRow({
	className,
	label,
	value,
	...props
}: Omit<ComponentProps<"div">, "children"> & {
	label: ReactNode;
	value: ReactNode;
}): React.JSX.Element {
	return (
		<div
			{...props}
			data-slot="property-row"
			className={cn(
				"grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 px-3 py-2 text-xs",
				className,
			)}
		>
			<dt className="font-bold text-muted-foreground">{label}</dt>
			<dd className="min-w-0 text-foreground">{value ?? "None"}</dd>
		</div>
	);
}
