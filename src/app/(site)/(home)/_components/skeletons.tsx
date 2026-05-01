function Pulse({ className }: { className: string }) {
	return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function HeroSkeleton() {
	return (
		<section className="grid min-h-[calc(100dvh-9rem)] items-center gap-8 py-6 md:grid-cols-[1.05fr_0.95fr]">
			<div className="max-w-2xl space-y-4">
				<Pulse className="h-4 w-48" />
				<Pulse className="h-12 w-72 sm:h-16 sm:w-96" />
				<div className="space-y-2">
					<Pulse className="h-5 w-full max-w-xl" />
					<Pulse className="h-5 w-full max-w-lg" />
					<Pulse className="h-5 w-3/4 max-w-md" />
				</div>
				<div className="flex gap-3 pt-3">
					<Pulse className="h-10 w-36" />
					<Pulse className="h-10 w-32" />
				</div>
			</div>
			<Pulse className="min-h-[420px] w-full" />
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
				<div
					key={item.id}
					className="overflow-hidden rounded-md border bg-card shadow-sm"
				>
					<Pulse className={`${aspect} rounded-none`} />
					<div className="space-y-3 p-4">
						<Pulse className="h-3 w-24" />
						<Pulse className="h-5 w-3/4" />
						<Pulse className="h-4 w-full" />
						<Pulse className="h-4 w-2/3" />
					</div>
				</div>
			))}
		</section>
	);
}

export function PanelSkeleton() {
	return (
		<section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
			<Pulse className="h-44 w-full" />
			<Pulse className="h-44 w-full" />
		</section>
	);
}

export function LibraryHeaderSkeleton() {
	return (
		<section className="flex flex-col justify-between gap-5 rounded-md border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end">
			<div className="w-full max-w-2xl space-y-3">
				<Pulse className="h-4 w-28" />
				<Pulse className="h-9 w-80 max-w-full" />
				<Pulse className="h-5 w-full" />
				<Pulse className="h-5 w-3/4" />
			</div>
			<div className="flex gap-2">
				<Pulse className="h-9 w-24" />
				<Pulse className="h-9 w-24" />
			</div>
		</section>
	);
}

export function DetailPageSkeleton() {
	return (
		<div className="mx-auto grid w-full max-w-5xl gap-5 py-2 md:grid-cols-[14rem_1fr]">
			<Pulse className="aspect-[3/4] w-full" />
			<div className="rounded-md border bg-card p-5 shadow-sm">
				<div className="space-y-3">
					<Pulse className="h-4 w-32" />
					<Pulse className="h-9 w-72 max-w-full" />
					<Pulse className="h-5 w-full" />
					<Pulse className="h-5 w-4/5" />
				</div>
			</div>
		</div>
	);
}
