"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { bookEntries, type BookEntry } from "~/lib/data";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { Button } from "~/components/ui/Button";
import { Slider } from "~/components/ui/Slider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface PageNavigatorProps {
	scrollToEntryAction: (entryNumber: number) => void;
	scrollToPageAction: (entryNumber: number, pageNumber: number) => void;
}

export default function PageNavigator({
	scrollToPageAction,
	scrollToEntryAction,
}: PageNavigatorProps) {
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const setCurrentPage = useTaleReaderStore((s) => s.setCurrentPage);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);
	const uiVisible = useTaleReaderStore((s) => s.uiVisible);

	const currentBookEntry = bookEntries[currentEntry];
	const totalPages = currentBookEntry?.pages.length ?? 1;

	if (!currentBookEntry) return null;

	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	function goToPage(pageNumber: number) {
		setCurrentPage(pageNumber);
		scrollToPageAction(currentEntry, pageNumber - 1);
	}

	function goToPrevPage() {
		if (isFirstPage) {
			if (currentEntry > 0) {
				const previousEntry = bookEntries[currentEntry - 1];
				const lastPageOfPreviousEntry = previousEntry?.pages.length ?? 1;
				setCurrentEntry(currentEntry - 1, lastPageOfPreviousEntry);
				if (currentEntry - 1 === 0) {
					requestAnimationFrame(() => {
						scrollToEntryAction(0);
					});
				} else {
					scrollToPageAction(currentEntry - 1, lastPageOfPreviousEntry - 1);
				}
			}
		} else {
			goToPage(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (isLastPage) {
			if (currentEntry < bookEntries.length - 1) {
				setCurrentEntry(currentEntry + 1, 1);
				scrollToPageAction(currentEntry + 1, 0);
			}
		} else {
			goToPage(currentPage + 1);
		}
	}
	type PageItem =
		| { number: number; id: string; firstPage: number; lastPage: number }
		| "...";

	const maxVisible = 15;
	const visibleNumeric = maxVisible - 2;

	const generatePages = (currentPage: number, entryPages: any[]): any[] => {
		const total = entryPages.length;
		if (total === 0) return [];

		if (total <= maxVisible) {
			return entryPages.map((p, i) => ({
				number: i + 1,
				id: p.id,
				firstPage: p.firstPage,
				lastPage: p.lastPage,
			}));
		}

		const pages: PageItem[] = [
			{
				number: 1,
				id: entryPages[0].id,
				firstPage: entryPages[0].firstPage,
				lastPage: entryPages[0].lastPage,
			},
		];

		const half = Math.floor((visibleNumeric - 2) / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(total - 2, currentPage + half - 1);

		if (currentPage <= half + 2) {
			start = 1;
			end = visibleNumeric - 1;
		} else if (currentPage >= total - half - 1) {
			start = total - visibleNumeric + 1;
			end = total - 2;
		}

		if (start > 1) pages.push("...");

		for (let i = start; i <= end; i++) {
			const p = entryPages[i];
			if (p) {
				pages.push({
					number: i + 1,
					id: p.id,
					firstPage: p.firstPage,
					lastPage: p.lastPage,
				});
			}
		}

		if (end < total - 2) pages.push("...");

		const last = entryPages[total - 1];
		if (last) {
			pages.push({
				number: total,
				id: last.id,
				firstPage: last.firstPage,
				lastPage: last.lastPage,
			});
		}

		return pages;
	};

	const pages = currentBookEntry?.pages
		? generatePages(currentPage, currentBookEntry.pages)
		: [];

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
				className="cursor-pointer"
				aria-label="Previous page"
			>
				<ArrowLeft className="h-4 w-4" />
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger disabled={totalPages === 1} asChild>
					<Button variant="outline" className="min-w-[120px] cursor-pointer">
						Page{" "}
						{bookEntries
							.slice(0, currentEntry)
							.reduce((acc, entry) => acc + entry.pages.length, 0) +
							currentPage}{" "}
						of {bookEntries.reduce((acc, entry) => acc + entry.pages.length, 0)}
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
									goToPage(value[0]);
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
				className="cursor-pointer"
				disabled={currentEntry === bookEntries.length - 1 && isLastPage}
				aria-label="Next page"
			>
				<ArrowRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
