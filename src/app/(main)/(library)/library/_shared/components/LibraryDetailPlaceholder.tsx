import { Suspense } from "react";
import { DetailPageSkeleton } from "~/app/(main)/_shared/components/skeletons";
import { LibraryBreadcrumbs } from "./LibraryBreadcrumbs";

export function LibraryDetailPlaceholder({
	label,
	title,
	description,
}: {
	label: string;
	title: string;
	description: string;
}) {
	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-2">
				<LibraryBreadcrumbs
					items={[{ label: "Library", href: "/library" }, { label: title }]}
				/>
				<div className="grid gap-5 md:grid-cols-[14rem_1fr]">
					<div className="aspect-[3/4] rounded-md border bg-secondary" />
					<div className="rounded-md border bg-card p-5 shadow-sm">
						<p className="font-semibold text-primary text-sm uppercase tracking-normal">
							{label}
						</p>
						<h1 className="mt-2 text-balance font-bold text-3xl">{title}</h1>
						<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
							{description}
						</p>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
