import { CardGridSkeleton, HeroSkeleton } from "./_components/skeletons";

export default function LoadingHome() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
			<HeroSkeleton />
			<CardGridSkeleton count={3} />
		</div>
	);
}
