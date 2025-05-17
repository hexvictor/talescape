"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { bookEntries } from "~/lib/data";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { Button } from "~/components/ui/Button";
import { Slider } from "~/components/ui/Slider";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PageItem = number | "...";

export default function PageNavigator() {
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const setCurrentPage = useTaleReaderStore((s) => s.setCurrentPage);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);

	const currentBookEntry = bookEntries[currentEntry];
	const totalPages = currentBookEntry?.pages ?? 1;

	if (!currentBookEntry) return null;

	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	function goToPrevPage() {
		if (isFirstPage) {
			if (currentEntry > 0) {
				const previousEntry = bookEntries[currentEntry - 1];
				setCurrentEntry(currentEntry - 1, previousEntry?.pages ?? 1);
			}
		} else {
			setCurrentPage(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (isLastPage) {
			if (currentEntry < bookEntries.length - 1) {
				setCurrentEntry(currentEntry + 1, 1);
			}
		} else {
			setCurrentPage(currentPage + 1);
		}
	}

	// --- Pagination logic ---
	const maxVisible = 15;
	const visibleNumeric = maxVisible - 2; // reserve 2 for potential ellipses

	const generatePages = (): PageItem[] => {
		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: PageItem[] = [1];
		const half = Math.floor((visibleNumeric - 2) / 2); // for centering

		let start = Math.max(2, currentPage - half);
		let end = Math.min(totalPages - 1, currentPage + half);

		// adjust window if we're too close to start or end
		if (currentPage <= half + 2) {
			start = 2;
			end = visibleNumeric;
		} else if (currentPage >= totalPages - half - 1) {
			start = totalPages - visibleNumeric + 1;
			end = totalPages - 1;
		}

		if (start > 2) pages.push("..." as const);
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		if (end < totalPages - 1) pages.push("..." as const);

		pages.push(totalPages);
		return pages;
	};

	const pages: PageItem[] = generatePages();

	return (
		<div className="fixed right-6 bottom-6 z-50 flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={goToPrevPage}
				disabled={currentEntry === 0 && isFirstPage}
				className="cursor-pointer"
				aria-label="Previous page"
			>
				<ArrowLeft className="h-4 w-4" />
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="min-w-[120px] cursor-pointer">
						Page {currentPage} of {totalPages}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="center">
					<div className="w-[220px] p-4">
						<div className="mb-4 flex justify-between text-sm">
							<span>Page {currentPage}</span>
							<span className="text-muted-foreground">of {totalPages}</span>
						</div>

						<Slider
							value={[currentPage]}
							min={1}
							max={totalPages}
							step={1}
							onValueChange={(value) => {
								if (typeof value[0] === "number") {
									setCurrentPage(value[0]);
								}
							}}
							className="mb-4"
						/>

						<div className="grid grid-cols-5 gap-2">
							{pages.map((page, i) =>
								page === "..." ? (
									<Button
										key={`ellipsis-${i}`}
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										disabled
									>
										...
									</Button>
								) : (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "outline"}
										size="sm"
										className="h-8 w-8 p-0"
										onClick={() => setCurrentPage(page)}
									>
										{page}
									</Button>
								),
							)}
						</div>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

			<Button
				variant="outline"
				size="icon"
				onClick={goToNextPage}
				className="cursor-pointer"
				disabled={currentEntry === bookEntries.length - 1 && isLastPage}
				aria-label="Next page"
			>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
