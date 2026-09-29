import type { ComponentProps, ReactNode } from "react";
import cn from "~/lib/utils/cn";

export function SectionHeader({
	actions,
	className,
	description,
	title,
	...props
}: Omit<ComponentProps<"header">, "title"> & {
	actions?: ReactNode;
	description?: ReactNode;
	title: ReactNode;
}): React.JSX.Element {
	return (
		<header
			{...props}
			data-slot="section-header"
			className={cn(
				"flex min-w-0 items-start justify-between gap-3",
				className,
			)}
		>
			<div className="min-w-0 flex-1">
				<h3 className="font-black text-xs uppercase">{title}</h3>
				{description ? (
					<p className="mt-1 text-[11px] text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{actions ? <div className="shrink-0">{actions}</div> : null}
		</header>
	);
}
