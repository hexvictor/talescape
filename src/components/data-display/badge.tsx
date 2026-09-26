import { type VariantProps, cva } from "class-variance-authority";
import {
	Children,
	type ReactElement,
	type ReactNode,
	cloneElement,
	isValidElement,
} from "react";
import cn from "~/lib/utils/cn";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border-2 px-2 py-0.5 font-black text-[10px] uppercase transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
				info: "border-ts-cyan bg-ts-cyan/12 text-foreground",
				outline:
					"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				success: "border-ts-green bg-ts-green/12 text-foreground",
				warning: "border-ts-yellow bg-ts-yellow/20 text-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export type BadgeProps = React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & {
		asChild?: boolean;
		"data-slot"?: string;
	};

function Badge({
	asChild = false,
	children,
	className,
	"data-slot": dataSlot = "badge",
	variant,
	...props
}: BadgeProps): React.JSX.Element {
	const resolvedClassName = cn(badgeVariants({ variant }), className);

	if (asChild) {
		const child = Children.only(children);
		if (!isValidElement(child)) {
			throw new Error("Badge with asChild requires one valid React element.");
		}

		const element = child as ReactElement<{
			className?: string;
			"data-slot"?: string;
		}>;
		return cloneElement(element, {
			...props,
			"data-slot": dataSlot,
			className: cn(resolvedClassName, element.props.className),
		});
	}

	return (
		<span {...props} data-slot={dataSlot} className={resolvedClassName}>
			{children}
		</span>
	);
}

export type TagProps = Omit<BadgeProps, "variant">;

function Tag({ className, ...props }: TagProps): React.JSX.Element {
	return (
		<Badge
			{...props}
			data-slot="tag"
			variant="outline"
			className={cn(
				"rounded-full border text-foreground normal-case tracking-normal",
				className,
			)}
		/>
	);
}

export type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export type StatusBadgeProps = Omit<BadgeProps, "children" | "variant"> & {
	children?: ReactNode;
	status: string;
	tone?: StatusTone;
};

const statusToneByName: Record<string, StatusTone> = {
	approved: "success",
	archived: "neutral",
	deleted: "danger",
	draft: "neutral",
	private: "neutral",
	published: "success",
	rejected: "danger",
	review: "warning",
};

const statusVariantByTone = {
	danger: "destructive",
	info: "info",
	neutral: "outline",
	success: "success",
	warning: "warning",
} as const;

function StatusBadge({
	children,
	status,
	tone,
	...props
}: StatusBadgeProps): React.JSX.Element {
	const resolvedTone = tone ?? statusToneByName[status.toLowerCase()] ?? "info";

	return (
		<Badge
			{...props}
			data-slot="status-badge"
			variant={statusVariantByTone[resolvedTone]}
		>
			{children ?? status}
		</Badge>
	);
}

export { Badge, StatusBadge, Tag };
