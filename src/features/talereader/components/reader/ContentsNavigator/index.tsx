"use client";

import { ChevronDown } from "lucide-react";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { bookEntries, type BookEntry } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import clsx from "clsx";
import { Button } from "~/components/ui/Button";

interface ContentsNavigatorProps {
	goToEntryAction: (entryIndex: number) => void;
	goToPageAction: (entryIndex: number, pageIndex: number) => void;
}

function useContentsNavigatorState() {
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);
	const setCurrentPage = useTaleReaderStore((s) => s.setCurrentPage);
	const uiVisible = useTaleReaderStore((s) => s.uiVisible);

	return {
		currentEntry,
		currentPage,
		setCurrentEntry,
		setCurrentPage,
		uiVisible,
		currentBookEntry: bookEntries[currentEntry],
	};
}

export default function ContentsNavigator({
	goToEntryAction,
	goToPageAction,
}: ContentsNavigatorProps) {
	const { currentEntry, currentPage, currentBookEntry, uiVisible } =
		useContentsNavigatorState();

	const allPages =
		currentBookEntry?.pages.flatMap((page) => {
			const range = [];
			for (let i = page.firstPage; i <= page.lastPage; i++) {
				range.push(i);
			}
			return range;
		}) ?? [];

	return (
		<div
			className={clsx(
				"fixed bottom-6 left-6 z-50 flex items-center gap-2",
				"transition-opacity duration-300",
				uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="cursor-pointer">
						{currentBookEntry?.title ?? "Unknown Entry"}
						<ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="max-h-[400px] w-64 overflow-y-auto"
				>
					<DropdownMenuLabel>Entries</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{bookEntries.map((entry, index) => (
						<DropdownMenuItem
							key={entry.id}
							className={clsx(
								"capitalize",
								index === currentEntry && "bg-muted font-semibold",
							)}
							onClick={() => goToEntryAction(index)}
						>
							<span className="mr-2 text-muted-foreground">[{entry.type}]</span>
							<span>{entry.title}</span>
						</DropdownMenuItem>
					))}

					{allPages.length > 0 && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>
								Pages in "{currentBookEntry?.title}"
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div className="grid grid-cols-5 gap-2 p-2">
								{allPages.map((num, i) => (
									<Button
										key={`pageButton-${currentBookEntry}-${num}`}
										variant={
											num === allPages[currentPage - 1] ? "default" : "outline"
										}
										size="sm"
										className="h-8 w-8 p-0 text-xs"
										onClick={() => goToPageAction(currentEntry, i)}
									>
										{num}
									</Button>
								))}
							</div>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
