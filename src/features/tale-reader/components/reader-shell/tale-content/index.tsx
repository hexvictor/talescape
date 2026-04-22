"use client";

import React from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import TaleSection from "../tale-section";

function TaleContentComponent() {
	const sectionIds = useReaderStore((s) => s.tale.structure.sectionIds);

	if (!sectionIds.length) return null;

	return (
		<>
			{sectionIds.map((sectionId) => (
				<TaleSection key={sectionId} sectionId={sectionId} />
			))}
		</>
	);
}

const TaleContent = React.memo(TaleContentComponent);

export default TaleContent;
