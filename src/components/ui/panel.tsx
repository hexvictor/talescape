import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps, ElementType, ReactNode } from "react";
import cn from "~/lib/utils/cn";

const panelVariants = cva("min-w-0 bg-card text-card-foreground", {
	variants: {
		appearance: {
			comic: "border-2 border-foreground shadow-[4px_4px_0_var(--secondary)]",
			ghost: "border-0 bg-transparent shadow-none",
			raised: "border-2 border-foreground shadow-[var(--ts-shadow-comic)]",
			subtle: "border border-border shadow-[var(--ts-shadow-subtle)]",
		},
	},
	defaultVariants: { appearance: "raised" },
});

export type PanelProps = ComponentProps<"section"> &
	VariantProps<typeof panelVariants> & {
		as?: ElementType;
	};

export function Panel({
	appearance,
	as: Component = "section",
	className,
	...props
}: PanelProps): React.JSX.Element {
	return (
		<Component
			{...props}
			data-slot="panel"
			className={cn(panelVariants({ appearance }), className)}
		/>
	);
}

export function PanelHeader({
	children,
	className,
	...props
}: ComponentProps<"header">): React.JSX.Element {
	return (
		<header
			{...props}
			data-slot="panel-header"
			className={cn(
				"flex min-w-0 items-start justify-between gap-3 border-border border-b px-4 py-3",
				className,
			)}
		>
			{children}
		</header>
	);
}

export function PanelHeading({
	actions,
	className,
	description,
	title,
}: {
	actions?: ReactNode;
	className?: string;
	description?: ReactNode;
	title: ReactNode;
}): React.JSX.Element {
	return (
		<PanelHeader className={className}>
			<div className="min-w-0 flex-1">
				<h3 className="font-black text-xs uppercase">{title}</h3>
				{description ? (
					<p className="mt-1 text-[11px] text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{actions ? <div className="shrink-0">{actions}</div> : null}
		</PanelHeader>
	);
}

export function PanelContent({
	className,
	density = "default",
	...props
}: ComponentProps<"div"> & {
	density?: "compact" | "default";
}): React.JSX.Element {
	return (
		<div
			{...props}
			data-slot="panel-content"
			className={cn(density === "compact" ? "p-3" : "p-4", className)}
		/>
	);
}
