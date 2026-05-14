"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import ReaderSection from "../ReaderSection";

type ReaderBranchProps = {
	branchId: number;
};

function ReaderBranchComponent({ branchId }: ReaderBranchProps) {
	const debugMode = useReaderStore((s) => s.ui.isDebugEnabled);
	const branchesById = useReaderStore(
		(s) => s.tale.data.content.indexMap.branchesById,
	);
	const sectionsById = useReaderStore(
		(s) => s.tale.data.content.indexMap.sectionsById,
	);

	const branch = branchesById[branchId];

	const branchSections = useMemo(() => {
		if (!branch) return [];
		return branch.children.sectionIds
			.map((id) => sectionsById[id])
			.filter((section): section is NonNullable<typeof section> => !!section);
	}, [branch, sectionsById]);

	if (!branch) return null;
	if (!branchSections.length) return null;

	return (
		<div
			id={`branch-${branch.id}`}
			data-branch-id={branch.id}
			data-root-branch={branch.position.isRootBranch}
			data-choice-branch={branch.position.isChoiceBranch}
			data-terminal-branch={branch.position.isTerminalBranch}
			className={clsx(
				"reader-branch relative",
				debugMode && "outline-2 outline-emerald-400/70",
			)}
		>
			{branchSections.map((section) => (
				<ReaderSection key={section.id} sectionId={section.id} />
			))}
		</div>
	);
}

const ReaderBranch = React.memo(ReaderBranchComponent);

export default ReaderBranch;
