"use client";
import {
	BookEntries,
	ContentsNavigator,
	EntryNavigator,
	PageNavigator,
	ReaderUiToggle,
	TaleProgress,
} from "~/features/talereader/components/reader";
import { TaleReaderProvider } from "~/features/talereader/contexts/TaleReaderContext";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { bookEntries } from "~/lib/data";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const sections: {
	type: "vertical" | "horizontal";
	pages: number;
	color: string;
}[] = [
	{
		type: "vertical",
		pages: 4,
		color: "bg-blue-200",
	},
	{
		type: "vertical",
		pages: 4,
		color: "bg-red-200",
	},
];

function ScrollSections() {
	const containerRef = useRef<HTMLDivElement>(null);
	const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [currentSection, setCurrentSection] = useState(0);
	const [scrolling, setScrolling] = useState(false);
	const params = useSearchParams();
	const direction =
		params.get("direction") === "horizontal" ? "horizontal" : "vertical";

	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			if (scrolling) return;

			const delta = e.deltaY;
			const nextIndex = currentSection + (delta > 0 ? 1 : -1);
			if (nextIndex < 0 || nextIndex >= sectionRefs.current.length) return;

			setScrolling(true);
			setCurrentSection(nextIndex);
			sectionRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth" });

			setTimeout(() => setScrolling(false), 500); // debounce interval
		};

		window.addEventListener("wheel", handleWheel, { passive: false });
		return () => window.removeEventListener("wheel", handleWheel);
	}, [currentSection, scrolling]);

	return (
		<div
			ref={containerRef}
			className={`flex ${direction === "horizontal" ? "h-screen flex-row" : "min-h-screen flex-col"}`}
		>
			{sections.flatMap((section, index) =>
				Array.from({ length: section.pages }, (_, i) => (
					<div
						key={`${index}-${i}`}
						ref={(el) => (sectionRefs.current[index * section.pages + i] = el)}
						className={`${section.color} flex h-screen ${direction === "horizontal" ? "w-screen" : ""} flex-shrink-0 items-center justify-center font-bold text-3xl`}
					>
						Section {index + 1} Page {i + 1}
					</div>
				)),
			)}
		</div>
	);
}

function StoryView() {
	return (
		<TaleReaderProvider>
			<ScrollSections />
		</TaleReaderProvider>
	);
}

export default StoryView;
