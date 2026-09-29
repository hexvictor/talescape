import { Skeleton } from "~/components/data-display/skeleton";
import { ComicPanel } from "~/components/layout/comic-panel";

export function HeroSkeleton() {
	return (
		<section className="grid min-h-[calc(100dvh-9rem)] items-center gap-8 py-6 md:grid-cols-[1.05fr_0.95fr]">
			<div className="max-w-2xl space-y-4">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-12 w-72 sm:h-16 sm:w-96" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-full max-w-xl" />
					<Skeleton className="h-5 w-full max-w-lg" />
					<Skeleton className="h-5 w-3/4 max-w-md" />
				</div>
				<div className="flex gap-3 pt-3">
					<Skeleton className="h-10 w-36" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>
			<Skeleton className="min-h-[420px] w-full" />
		</section>
	);
}

export function CardGridSkeleton({
	count = 3,
	aspect = "aspect-[4/3]",
}: {
	count?: number;
	aspect?: string;
}) {
	const skeletonItems = Array.from({ length: count }, (_, index) => ({
		id: `card-skeleton-${index}`,
	}));

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{skeletonItems.map((item) => (
				<ComicPanel
					key={item.id}
					className="overflow-hidden"
					shape="corner-top-right"
				>
					<Skeleton className={aspect} />
					<div className="space-y-3 p-4">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</ComicPanel>
			))}
		</section>
	);
}

export function PanelSkeleton() {
	return (
		<section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
			<Skeleton className="h-44 w-full" />
			<Skeleton className="h-44 w-full" />
		</section>
	);
}

export function LibraryHeaderSkeleton() {
	return (
		<ComicPanel className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:flex-row lg:items-end">
			<div className="w-full max-w-2xl space-y-3">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-9 w-80 max-w-full" />
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-3/4" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
			</div>
		</ComicPanel>
	);
}

export function DetailPageSkeleton() {
	return (
		<div className="mx-auto grid w-full max-w-[var(--ts-content-max)] gap-5 py-2 md:grid-cols-[14rem_1fr]">
			<Skeleton className="aspect-[3/4] w-full" />
			<ComicPanel className="p-5" shape="corner-top-right">
				<div className="space-y-3">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-9 w-72 max-w-full" />
					<Skeleton className="h-5 w-full" />
					<Skeleton className="h-5 w-4/5" />
				</div>
			</ComicPanel>
		</div>
	);
}
