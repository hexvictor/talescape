"use client";
import React from "react";
import EntryPage from "../ScrollSection";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import TaleSection from "../TaleSection";

const TaleContentComponent = () => {
	const sections = useTaleReaderStore((s) => s.tale.sections);
	return (
		<>
			{sections.map((section) => (
				<TaleSection key={section.id} section={section} />
			))}
		</>
	);
};

export default React.memo(TaleContentComponent);
