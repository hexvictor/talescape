"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import { Button } from "~/components/ui/button";
import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type { Path } from "~/server/db/data/tale-reader/types/paths";
import type { SectionOrientation } from "~/server/db/types/tale-reader/section";
import { ReaderScrollCue } from "../../ReaderUi";
import { ReaderFragment } from "../ReaderFragment";

type ReaderBlockProps = {
	block: Block;
};

const bgColors = [
	"bg-red-900/30",
	"bg-green-900/30",
	"bg-blue-900/30",
	"bg-yellow-900/30",
	"bg-purple-900/30",
	"bg-pink-900/30",
];

export function ReaderBlockComponent({ block }: ReaderBlockProps) {
	const fragmentsById = useReaderStore(
		(s) => s.tale.data.content.indexMap.fragmentsById,
	);
	const pathsById = useReaderStore(
		(s) => s.tale.data.content.indexMap.pathsById,
	);
	const choosePath = useReaderStore((s) => s.progress.choosePath);

	const choicePaths = useMemo(() => {
		if (!block.position.isLastInBranch) return [];
		if (!block.branch.position.isChoiceBranch) return [];

		return block.branch.links.outgoingPathIds
			.map((id) => pathsById[id])
			.filter((path): path is NonNullable<typeof path> => !!path);
	}, [
		block.branch.links.outgoingPathIds,
		block.branch.position.isChoiceBranch,
		block.position.isLastInBranch,
		pathsById,
	]);

	const bg = bgColors[block.position.index % bgColors.length];
	const isHorizontal = block.section.orientation === "horizontal";
	const hasBranchChoices = choicePaths.length > 0;

	const blockFragments = block.children.fragmentIds
		.map((id) => fragmentsById[id])
		.filter((fragment): fragment is NonNullable<typeof fragment> => !!fragment);

	return (
		<div
			id={String(block.id)}
			data-block-id={block.id}
			data-snap={block.isSnap}
			className={clsx(
				"relative overflow-hidden",
				isHorizontal
					? "flex h-screen shrink-0 items-center justify-center"
					: "flex min-h-screen min-w-screen items-center justify-center",
				bg,
			)}
		>
			<div
				className={clsx(
					"relative z-10 flex items-center justify-center",
					isHorizontal
						? "h-full shrink-0 px-4 py-4 sm:px-6 sm:py-6"
						: "min-h-screen w-full px-4 py-10 sm:px-8 sm:py-14",
				)}
			>
				<div
					className={clsx(
						"flex items-center justify-center",
						isHorizontal
							? "h-full shrink-0 flex-col gap-4"
							: "w-full max-w-5xl flex-col gap-6",
					)}
				>
					{hasBranchChoices ? (
						<ReaderBranchChoices
							paths={choicePaths}
							orientation={block.section.orientation}
							onChoosePath={(pathId) => {
								choosePath(pathId, { navigate: false });
							}}
						/>
					) : (
						blockFragments.map((fragment) => (
							<ReaderFragment
								key={fragment.id}
								fragment={fragment}
								orientation={block.section.orientation}
							/>
						))
					)}
				</div>
			</div>

			{block.position.isFirst ? <ReaderScrollCue /> : null}
		</div>
	);
}

const ReaderBlock = React.memo(ReaderBlockComponent);

export default ReaderBlock;

function ReaderBranchChoices({
	paths,
	orientation,
	onChoosePath,
}: {
	paths: Path[];
	orientation: SectionOrientation;
	onChoosePath: (pathId: number) => void;
}) {
	const isHorizontal = orientation === "horizontal";

	return (
		<div
			className={clsx(
				"flex w-full flex-col items-center justify-center gap-5 text-center",
				isHorizontal ? "max-w-[min(88vw,44rem)]" : "max-w-3xl px-6",
			)}
		>
			<div className="space-y-2">
				<p className="font-semibold text-white/70 text-xs uppercase tracking-[0.24em]">
					Choose a path
				</p>
				<h2 className="font-semibold text-2xl text-white sm:text-3xl">
					Where does the tale go next?
				</h2>
			</div>

			<div className="flex w-full flex-col gap-3 sm:max-w-xl">
				{paths.map((path) => (
					<Button
						key={path.id}
						type="button"
						variant="outline"
						size="lg"
						className="pointer-events-auto h-auto min-h-12 justify-between whitespace-normal rounded-lg border-white/20 bg-black/40 px-5 py-4 text-left text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-black"
						onClick={() => onChoosePath(path.id)}
					>
						<span className="min-w-0">
							<span className="block font-semibold">
								{path.label ?? path.toBranch?.name ?? "Continue"}
							</span>
							{path.toBranch?.name && path.label ? (
								<span className="mt-1 block text-xs opacity-70">
									{path.toBranch.name}
								</span>
							) : null}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
