import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyState } from "./LibraryCards";

export type NodeLink = {
	label: string;
	href: string;
};

export type NodeRow = {
	id: number;
	anchorId?: string;
	icon: ReactNode;
	title: string;
	meta: string;
	detail: string;
	badges: string[];
	links: NodeLink[];
	preview?: ReactNode;
};

export function LibraryNodeList({
	emptyTitle,
	rows,
}: {
	emptyTitle: string;
	rows: NodeRow[];
}) {
	if (!rows.length) {
		return (
			<EmptyState
				title={emptyTitle}
				description="Readable nodes will appear here when their tale or node permissions allow access."
			/>
		);
	}

	return (
		<section className="grid gap-3">
			{rows.map((row) => (
				<article
					key={row.id}
					id={row.anchorId}
					className="grid gap-4 rounded-md border bg-card p-4 shadow-sm md:grid-cols-[auto_1fr]"
				>
					<div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
						{row.icon}
					</div>
					<div className="min-w-0">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
							<div className="min-w-0">
								<p className="text-muted-foreground text-xs uppercase tracking-normal">
									{row.meta}
								</p>
								<h2 className="mt-1 truncate font-semibold text-lg">
									{row.title}
								</h2>
								<p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
									{row.detail}
								</p>
							</div>
							<div className="flex flex-wrap gap-2 lg:justify-end">
								{row.badges.map((badge) => (
									<Badge key={badge} variant="outline">
										{badge}
									</Badge>
								))}
							</div>
						</div>
						{row.links.length ? (
							<div className="mt-4 flex flex-wrap gap-2">
								{row.links.map((link) => (
									<Button
										key={`${row.id}-${link.label}-${link.href}`}
										asChild
										size="sm"
										variant="outline"
									>
										<Link href={link.href}>
											<ArrowUpRight aria-hidden="true" />
											{link.label}
										</Link>
									</Button>
								))}
							</div>
						) : null}
						{row.preview ? <div className="mt-4">{row.preview}</div> : null}
					</div>
				</article>
			))}
		</section>
	);
}
