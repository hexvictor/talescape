import { CardGridSkeleton, PanelSkeleton } from "../_components/skeletons";

export default function LoadingCodex() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-2">
			<PanelSkeleton />
			<CardGridSkeleton count={4} />
			<PanelSkeleton />
		</div>
	);
}
