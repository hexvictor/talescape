"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import {
	Breadcrumb as AriaBreadcrumb,
	Breadcrumbs as AriaBreadcrumbs,
	Button as AriaButton,
	Link as AriaLink,
} from "react-aria-components";
import cn from "~/lib/utils/cn";

export type BreadcrumbItem = {
	href?: string;
	id: string;
	isCurrent?: boolean;
	label: ReactNode;
	onPress?: () => void;
};

export function Breadcrumbs({
	"aria-label": ariaLabel = "Breadcrumbs",
	className,
	items,
}: {
	"aria-label"?: string;
	className?: string;
	items: BreadcrumbItem[];
}): React.JSX.Element {
	return (
		<nav aria-label={ariaLabel} data-slot="breadcrumbs" className={className}>
			<AriaBreadcrumbs className="flex min-w-0 items-center gap-1 overflow-hidden text-[10px] text-muted-foreground uppercase">
				{items.map((item, index) => {
					const isCurrent = item.isCurrent ?? index === items.length - 1;
					return (
						<AriaBreadcrumb
							id={item.id}
							key={item.id}
							className="flex min-w-0 items-center gap-1"
						>
							{index > 0 ? (
								<ChevronRight aria-hidden="true" className="size-3 shrink-0" />
							) : null}
							{isCurrent ? (
								<span
									aria-current="page"
									className="truncate font-bold text-foreground"
								>
									{item.label}
								</span>
							) : item.href ? (
								<AriaLink
									href={item.href}
									className="truncate font-bold outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
								>
									{item.label}
								</AriaLink>
							) : (
								<AriaButton
									className={cn(
										"truncate font-bold outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
										!item.onPress && "pointer-events-none",
									)}
									onPress={item.onPress}
								>
									{item.label}
								</AriaButton>
							)}
						</AriaBreadcrumb>
					);
				})}
			</AriaBreadcrumbs>
		</nav>
	);
}
