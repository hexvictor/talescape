import type { ComponentProps } from "react";
import cn from "~/lib/utils/cn";

export function Skeleton({
	className,
	...props
}: ComponentProps<"div">): React.JSX.Element {
	return (
		<div
			{...props}
			aria-hidden="true"
			data-slot="skeleton"
			className={cn(
				"animate-pulse bg-muted motion-reduce:animate-none",
				className,
			)}
		/>
	);
}
