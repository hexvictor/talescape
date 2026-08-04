import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type BreadcrumbItem = {
	label: string;
	href?: string;
};

export function LibraryBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav aria-label="Breadcrumb" className="text-sm">
			<ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li
							key={`${item.label}-${index}`}
							className="flex items-center gap-1"
						>
							{item.href && !isLast ? (
								<Link href={item.href} className="hover:text-foreground">
									{item.label}
								</Link>
							) : (
								<span className={isLast ? "text-foreground" : undefined}>
									{item.label}
								</span>
							)}
							{!isLast ? (
								<ChevronRight aria-hidden="true" className="size-3.5" />
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
