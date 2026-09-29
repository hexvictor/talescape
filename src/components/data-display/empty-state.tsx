import type { ReactNode } from "react";
import { ComicPanel } from "~/components/layout/comic-panel";
import cn from "~/lib/utils/cn";

export function EmptyState({
	actions,
	className,
	description,
	icon,
	title,
}: {
	actions?: ReactNode;
	className?: string;
	description: ReactNode;
	icon?: ReactNode;
	title: ReactNode;
}): React.JSX.Element {
	return (
		<ComicPanel
			className={cn("comic-panel-content-lg text-center", className)}
			shape="cut-opposite"
		>
			{icon ? (
				<div className="mx-auto mb-3 flex size-11 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
					{icon}
				</div>
			) : null}
			<h2 className="font-display text-2xl uppercase">{title}</h2>
			<p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-6">
				{description}
			</p>
			{actions ? (
				<div className="mt-4 flex flex-wrap justify-center gap-2">
					{actions}
				</div>
			) : null}
		</ComicPanel>
	);
}
