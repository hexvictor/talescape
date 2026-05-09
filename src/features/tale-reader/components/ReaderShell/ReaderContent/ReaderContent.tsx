"use client";

import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import { selectVisibleBranches } from "~/features/tale-reader/store/selectors/branchVisibility";
import ReaderBranch from "../ReaderBranch";

function ReaderContentComponent() {
	const branches = useReaderStore(useShallow(selectVisibleBranches));
	const setIsStructureMounted = useReaderStore(
		(s) => s.reader.setIsStructureMounted,
	);

	const visibleStructureKey = branches
		.map((branch) => `${branch.id}:${branch.children.blockIds.join(",")}`)
		.join("|");

	useEffect(() => {
		setIsStructureMounted(false);

		if (!visibleStructureKey) return;

		const frame = window.requestAnimationFrame(() => {
			setIsStructureMounted(true);
		});

		return () => {
			window.cancelAnimationFrame(frame);
		};
	}, [setIsStructureMounted, visibleStructureKey]);

	if (!branches.length) return null;

	return (
		<>
			{branches.map((branch) => (
				<ReaderBranch key={branch.id} branchId={branch.id} />
			))}
		</>
	);
}

const ReaderContent = React.memo(ReaderContentComponent);

export default ReaderContent;
