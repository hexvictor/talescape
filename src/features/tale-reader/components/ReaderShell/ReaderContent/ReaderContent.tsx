"use client";

import React from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import ReaderSection from "../ReaderSection";

function ReaderContentComponent() {
	const sectionIds = useReaderStore((s) => s.tale.structure.sectionIds);

	if (!sectionIds.length) return null;

	return (
		<>
			{sectionIds.map((sectionId) => (
				<ReaderSection key={sectionId} sectionId={sectionId} />
			))}
		</>
	);
}

const ReaderContent = React.memo(ReaderContentComponent);

export default ReaderContent;
