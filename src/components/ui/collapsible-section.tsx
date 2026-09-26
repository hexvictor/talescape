"use client";

import { ChevronDown, PanelsTopLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	Disclosure,
	DisclosurePanel,
	type DisclosureProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";

export type CollapsibleSectionProps = Omit<
	DisclosureProps,
	"children" | "className"
> & {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
	headingClassName?: string;
	icon?: ReactNode;
	title: ReactNode;
};

/**
 * An accessible, compact disclosure for dense tool and Inspector surfaces.
 */
export function CollapsibleSection({
	children,
	className,
	contentClassName,
	headingClassName,
	icon,
	title,
	...props
}: CollapsibleSectionProps): React.JSX.Element {
	return (
		<Disclosure
			{...props}
			data-slot="collapsible-section"
			className={cn(
				"@container min-w-0 border-2 border-foreground bg-card shadow-[3px_3px_0_var(--comic-teal)]",
				className,
			)}
		>
			{({ isExpanded }) => (
				<>
					<h3 data-slot="collapsible-section-heading">
						<AriaButton
							slot="trigger"
							className={cn(
								"flex min-h-10 w-full items-center gap-2 px-3 text-left font-black text-[10px] text-primary uppercase tracking-[0.17em] outline-none hover:bg-foreground/[0.045] focus-visible:ring-4 focus-visible:ring-ring/40",
								headingClassName,
							)}
						>
							<span className="shrink-0" aria-hidden="true">
								{icon ?? <PanelsTopLeft size={14} />}
							</span>
							<span className="min-w-0 flex-1 truncate">{title}</span>
							<ChevronDown
								aria-hidden="true"
								size={15}
								className={cn(
									"shrink-0 transition-transform",
									isExpanded && "rotate-180",
								)}
							/>
						</AriaButton>
					</h3>
					<DisclosurePanel
						data-slot="collapsible-section-content"
						className={cn(
							"grid @md:grid-cols-2 grid-cols-1 gap-2 border-foreground/12 border-t p-3",
							contentClassName,
						)}
					>
						{children}
					</DisclosurePanel>
				</>
			)}
		</Disclosure>
	);
}
