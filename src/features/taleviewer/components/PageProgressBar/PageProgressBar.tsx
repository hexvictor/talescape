"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { Progress } from "~/components/ui/Progress";
import { bookEntries } from "~/lib/data";

export default function PageProgressBar() {
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);

	if (!bookEntries?.length) return null;

	const pagesBefore = bookEntries
		.slice(0, currentEntry)
		.reduce((acc, entry) => acc + entry.pages, 0);

	const totalPages = bookEntries.reduce((acc, entry) => acc + entry.pages, 0);
	const currentProgress = pagesBefore + currentPage;

	const progress = Math.min((currentProgress / totalPages) * 100, 100);

	return (
		<div className="fixed top-0 right-0 left-0 z-50">
			<Progress value={progress} className="h-1" />
		</div>
	);
}
