import {
	CardGridSkeleton,
	HeroSkeleton,
} from "~/app/(site)/_shared/components/skeletons";

export default function LoadingHome() {
	return (
		<div className="mx-auto flex w-full max-w-[var(--ts-content-max)] flex-col gap-10 px-[var(--ts-page-gutter)]">
			<HeroSkeleton />
			<CardGridSkeleton count={3} />
		</div>
	);
}
