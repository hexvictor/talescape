import { Suspense } from "react";
import { DetailPageSkeleton } from "~/app/(site)/_shared/components/skeletons";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
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
			<div className="mx-auto flex w-full max-w-[var(--ts-content-max)] flex-col gap-4 py-2">
				<LibraryBreadcrumbs
					items={[{ label: "Library", href: "/library" }, { label: title }]}
				/>
				<div className="grid gap-5 md:grid-cols-[14rem_1fr]">
					<ComicPanel
						accent="secondary"
						className="aspect-[3/4] bg-secondary"
						shapes="corner-top-left"
					/>
					<ComicPanel
						decorations="brush-halftone"
						accent="primary"
						className="p-6"
						shapes="corner-top-right"
					>
						<ComicRail accent="primary">{label}</ComicRail>
						<h1 className="mt-5 text-balance font-display text-4xl uppercase">
							{title}
						</h1>
						<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
							{description}
						</p>
					</ComicPanel>
				</div>
			</div>
		</Suspense>
	);
}
