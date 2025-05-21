"use client";

import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import { bookEntries } from "~/lib/data";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { ScrollArea } from "~/components/ui/ScrollArea";
import { Button } from "~/components/ui/Button";
import { BookOpenIcon, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { ICON_MAP } from "../EntryNavigator/entryIcons";

function generatePages(
	entryPages: { id: string; firstPage: number; lastPage: number }[],
) {
	return entryPages.map((page, i) => ({
		id: page.id,
		number: i + 1,
		firstPage: page.firstPage,
		lastPage: page.lastPage,
	}));
}

export default function ContentsNavigator() {
	const { scrollToEntry, scrollToPage } = useTaleReaderContext();
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const uiVisible = useTaleReaderStore((s) => s.uiVisible);
	const currentPage = useTaleReaderStore((s) => s.currentPage);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);

	const activeEntry = bookEntries[currentEntry];
	if (!activeEntry) return null;
	const activePages = generatePages(activeEntry.pages);

	const handleGoToPage = (entryIndex: number, pageIndex: number) => {
		setCurrentEntry(entryIndex, pageIndex + 1);
		scrollToPage(entryIndex, pageIndex);
	};

	return (
		<div
			className={clsx(
				"fixed top-6 right-6 z-100 flex items-center gap-2",
				"transition-opacity duration-300",
				uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="secondary"
						size="sm"
						className="flex items-center gap-1"
					>
						<span className="flex items-center gap-1 text-sm">
							{activeEntry.title}
						</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="z-100 max-h-[500px] w-72">
					<ScrollArea className="h-[200px]">
						<div className="px-1 pb-2">
							{bookEntries.map((entry, entryIndex) => {
								const icon =
									entry.type === "chapter"
										? bookEntries
												.filter((e) => e.type === "chapter")
												.indexOf(entry) + 1
										: (ICON_MAP[entry.type] ?? "❓");

								return (
									<DropdownMenuItem
										key={entry.id}
										className={clsx(
											"flex items-center gap-2",
											entryIndex === currentEntry && "bg-muted font-medium",
										)}
										onClick={() => {
											setCurrentEntry(entryIndex, 1);
											scrollToEntry(entryIndex);
										}}
									>
										<span className="w-6 text-center text-muted-foreground text-xs">
											{icon}
										</span>
										<span className="truncate">{entry.title}</span>
									</DropdownMenuItem>
								);
							})}
						</div>
					</ScrollArea>

					{activePages.length > 1 && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>
								Pages in "{activeEntry.title}"
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<div className="grid grid-cols-5 gap-1 p-1">
								{activePages.map((page, i) => {
									const pageNumber =
										page.firstPage === page.lastPage
											? page.firstPage
											: `${page.firstPage}-${page.lastPage}`;
									return (
										<Button
											key={page.id}
											variant={i + 1 === currentPage ? "default" : "outline"}
											size="sm"
											className="h-8 w-8 p-0 text-xs"
											onClick={() => handleGoToPage(currentEntry, i)}
										>
											{pageNumber}
										</Button>
									);
								})}
							</div>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
