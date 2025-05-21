"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { bookEntries, type Page, type BookEntry } from "~/lib/data";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { Slider } from "~/components/ui/Slider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Button } from "~/components/ui/Button";
import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";

// Define the type of each page item in the pagination list
// Either an actual page (with metadata) or an ellipsis placeholder

// Example: { type: "page", number: 3, id: "abc", firstPage: 4, lastPage: 6 }
// or: { type: "ellipsis", key: "ellipsis-before-xyz" }
type PageItem =
	| {
			type: "page";
			number: number;
			id: string;
			firstPage: number;
			lastPage: number;
	  }
	| {
			type: "ellipsis";
			key: string;
	  };

const MAX_VISIBLE = 15;
const VISIBLE_NUMERIC = MAX_VISIBLE - 2;

/**
 * Generates a paginated list of visible page items (actual pages and ellipses)
 * based on the current page index.
 *
 * @param currentPage - 1-based index of the current page
 * @param entryPages - array of Page objects belonging to the current entry
 * @returns PageItem[] including visible page buttons and ellipses
 */
function generatePages(currentPage: number, entryPages: Page[]): PageItem[] {
	const total = entryPages.length;
	if (total === 0) return [];

	// If the total pages fit in the visible limit, return them all
	if (total <= MAX_VISIBLE) {
		return entryPages.map((p, i) => ({
			type: "page",
			number: i + 1,
			id: p.id,
			firstPage: p.firstPage,
			lastPage: p.lastPage,
		}));
	}

	const pages: PageItem[] = [];

	// Determine visible window around the current page (centered window)
	const half = Math.floor((VISIBLE_NUMERIC - 2) / 2);
	let start = Math.max(1, currentPage - half);
	let end = Math.min(total - 2, currentPage + half - 1);

	// Clamp ranges to the beginning or end of list if near the edges
	if (currentPage <= half + 2) {
		start = 1;
		end = VISIBLE_NUMERIC - 1;
	} else if (currentPage >= total - half - 1) {
		start = total - VISIBLE_NUMERIC + 1;
		end = total - 2;
	}

	// Create a helper to standardize page creation
	const pushPage = (p: Page, i: number): PageItem => ({
		type: "page",
		number: i + 1,
		id: p.id,
		firstPage: p.firstPage,
		lastPage: p.lastPage,
	});

	// Always include the first page
	const firstPage = entryPages[0];
	if (firstPage) pages.push(pushPage(firstPage, 0));

	// Insert leading ellipsis if needed
	const prevPage = entryPages[start - 1];
	if (start > 1 && prevPage) {
		pages.push({ type: "ellipsis", key: `ellipsis-before-${prevPage.id}` });
	}

	// Middle page range
	for (let i = start; i <= end; i++) {
		const midPage = entryPages[i];
		if (midPage) pages.push(pushPage(midPage, i));
	}

	// Insert trailing ellipsis if needed
	const nextPage = entryPages[end + 1];
	if (end < total - 2 && nextPage) {
		pages.push({ type: "ellipsis", key: `ellipsis-after-${nextPage.id}` });
	}

	// Always include the last page
	const lastPage = entryPages[total - 1];
	if (lastPage) pages.push(pushPage(lastPage, total - 1));

	return pages;
}

/**
 * Main pagination navigation component.
 * Handles navigating between pages within an entry and between entries.
 */
export default function PageNavigator() {
	const { scrollToPage, scrollToEntry } = useTaleReaderContext();
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const setCurrentPage = useTaleReaderStore((s) => s.setCurrentPage);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);
	const uiVisible = useTaleReaderStore((s) => s.uiVisible);
	const currentBookEntry = bookEntries[currentEntry];

	if (!currentBookEntry) return null;
	const totalPages = currentBookEntry.pages.length;
	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	/**
	 * Navigates to a specific page within the current entry.
	 */
	function goToPage(pageNumber: number) {
		setCurrentPage(pageNumber);
		scrollToPage(currentEntry, pageNumber - 1);
	}

	/**
	 * Handles logic for navigating to the previous page or previous entry.
	 * If already on the first page and there's a previous entry, it jumps to its last page.
	 */
	function goToPrevPage() {
		if (isFirstPage && currentEntry > 0) {
			const previousEntry = bookEntries[currentEntry - 1];
			const lastPage = previousEntry?.pages.length ?? 1;
			setCurrentEntry(currentEntry - 1, lastPage);
			const scrollAction =
				currentEntry - 1 === 0 ? scrollToEntry : scrollToPage;
			scrollAction(currentEntry - 1, lastPage - 1);
		} else if (!isFirstPage) {
			goToPage(currentPage - 1);
		}
	}

	/**
	 * Handles logic for navigating to the next page or next entry.
	 */
	function goToNextPage() {
		if (isLastPage && currentEntry < bookEntries.length - 1) {
			setCurrentEntry(currentEntry + 1, 1);
			scrollToPage(currentEntry + 1, 0);
		} else if (!isLastPage) {
			goToPage(currentPage + 1);
		}
	}

	const pages = generatePages(currentPage, currentBookEntry.pages);

	// Calculates the absolute page number across the entire book
	const absolutePage =
		bookEntries
			.slice(0, currentEntry)
			.reduce((acc, e) => acc + e.pages.length, 0) + currentPage;

	// Total number of pages in the full book (all entries combined)
	const totalBookPages = bookEntries.reduce(
		(acc, e) => acc + e.pages.length,
		0,
	);

	return (
		<div
			className={clsx(
				"fixed right-6 bottom-6 z-50 flex items-center gap-2",
				"transition-opacity duration-300",
				uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<Button
				variant="outline"
				size="icon"
				onClick={goToPrevPage}
				disabled={currentEntry === 0 && isFirstPage}
				aria-label="Previous page"
			>
				<ArrowLeft className="h-4 w-4" />
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger disabled={totalPages === 1} asChild>
					<Button variant="outline" className="min-w-[120px] cursor-pointer">
						Page {absolutePage} of {totalBookPages}
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
							onValueChange={(value) =>
								typeof value[0] === "number" && goToPage(value[0])
							}
							className="mb-4"
						/>

						<div className="grid grid-cols-5 gap-2">
							{pages.map((page) =>
								page.type === "ellipsis" ? (
									<Button
										key={page.key}
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										disabled
									>
										…
									</Button>
								) : (
									<Button
										key={page.id}
										variant={
											currentPage === page.number ? "default" : "outline"
										}
										size="sm"
										className="flex h-auto flex-col p-1"
										onClick={() => goToPage(page.number)}
									>
										<span>{page.number}</span>
										<span className="text-[10px] text-muted-foreground">
											{page.firstPage}-{page.lastPage}
										</span>
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
				disabled={currentEntry === bookEntries.length - 1 && isLastPage}
				aria-label="Next page"
			>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
