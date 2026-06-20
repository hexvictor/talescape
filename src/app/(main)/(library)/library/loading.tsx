import {
	CardGridSkeleton,
	LibraryHeaderSkeleton,
} from "~/app/(main)/_shared/components/skeletons";

export default function LoadingLibrary() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-2">
			<LibraryHeaderSkeleton />
			<CardGridSkeleton count={4} aspect="aspect-[3/4]" />
			<CardGridSkeleton count={3} />
		</div>
	);
}
