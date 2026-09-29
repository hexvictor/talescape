import {
	CardGridSkeleton,
	PanelSkeleton,
} from "~/app/(site)/_shared/components/skeletons";

export default function LoadingCodex() {
	return (
		<div className="mx-auto flex w-full max-w-[var(--ts-content-max)] flex-col gap-8 px-[var(--ts-page-gutter)] py-8 lg:py-12">
			<PanelSkeleton />
			<CardGridSkeleton count={4} />
			<PanelSkeleton />
		</div>
	);
}
