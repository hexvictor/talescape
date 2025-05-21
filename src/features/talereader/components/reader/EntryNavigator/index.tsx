"use client";

import { useMemo, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/Tooltip";

import { bookEntries, type BookEntry, type EntryType } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { ICON_MAP } from "./entryIcons";
import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import { Button } from "~/components/ui/Button";

interface EntryNavigatorProps {
	visibleCount?: number;
}

export default function EntryNavigator({
	visibleCount = 7,
}: EntryNavigatorProps) {
	const { scrollToEntry } = useTaleReaderContext();

	const uiVisible = useTaleReaderStore((s) => s.uiVisible);
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);

	const goTo = (i: number) => {
		setCurrentEntry(i, 1);
	};

	const activeRef = useRef<HTMLButtonElement | null>(null);

	if (bookEntries.length <= 1) return null;

	const { visibleEntries, start } = useMemo(() => {
		let start = Math.max(0, currentEntry - Math.floor(visibleCount / 2));
		const end = Math.min(bookEntries.length - 1, start + visibleCount - 1);
		if (end === bookEntries.length - 1) {
			start = Math.max(0, end - visibleCount + 1);
		}
		return { start, visibleEntries: bookEntries.slice(start, end + 1) };
	}, [currentEntry, visibleCount]);

	const numberedEntries = useMemo(() => {
		return bookEntries.filter((entry) => entry.type === "chapter");
	}, []);

	const entryHeight = 40;
	const buttonOffset = 64;
	const containerHeight = visibleCount * entryHeight + buttonOffset;

	return (
		<div
			className={clsx(
				"-translate-y-1/2 fixed top-1/2 right-6 z-100 hidden md:flex",
				"transition-opacity duration-300",
				uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<TooltipProvider>
				<div
					className="relative flex flex-col items-center justify-center"
					style={{ height: `${containerHeight}px` }}
				>
					<AnimatePresence mode="wait">
						{currentEntry > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className="-top-4 -translate-x-1/2 absolute left-1/2 z-10"
							>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="h-6 w-6 rounded-full"
											aria-label="Previous"
											onClick={() => {
												const previousEntry = Math.max(0, currentEntry - 1);
												goTo(previousEntry);
												scrollToEntry(previousEntry);
											}}
										>
											<ChevronUp className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="left">Previous</TooltipContent>
								</Tooltip>
							</motion.div>
						)}
					</AnimatePresence>

					<div
						className="scrollbar-none mask-fade-vertical flex h-full flex-col items-center justify-center gap-3 overflow-hidden overflow-y-auto px-1 pt-8 pb-8"
						style={{
							overflowAnchor: "none",
							scrollbarGutter: "stable",
						}}
					>
						{visibleEntries.map((entry, index) => {
							const globalIndex = start + index;
							const isActive = globalIndex === currentEntry;

							const isChapter = entry.type === "chapter";
							const display = isChapter
								? numberedEntries.findIndex((e) => e === entry) + 1
								: (ICON_MAP[entry.type] ?? "❓");

							return (
								<Tooltip key={globalIndex}>
									<TooltipTrigger asChild>
										<motion.div
											layout="position"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.2 }}
											className="relative"
										>
											<button
												ref={isActive ? activeRef : null}
												onClick={() => {
													goTo(globalIndex);
													scrollToEntry(globalIndex);
												}}
												aria-label={`Go to ${entry.type}: ${entry.title}`}
												type="button"
												className={clsx(
													"h-8 w-8 cursor-pointer rounded-full border bg-background p-0 font-medium text-sm transition-transform hover:bg-muted hover:text-black",
													isActive
														? "z-10 bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
														: "hover:scale-105",
												)}
											>
												{display}
											</button>
										</motion.div>
									</TooltipTrigger>
									<TooltipContent side="left">
										<div>
											<div className="capitalize">
												{entry.type.replace(/_/g, " ")}: {entry.title}
											</div>
											<div className="text-muted-foreground text-xs">
												{entry.pages.length} pages
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>

					<AnimatePresence mode="wait">
						{currentEntry < bookEntries.length - 1 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className="-bottom-4 -translate-x-1/2 absolute left-1/2 z-10"
							>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="h-6 w-6 rounded-full"
											aria-label="Next"
											onClick={() => {
												const nextEntry = Math.min(
													bookEntries.length - 1,
													currentEntry + 1,
												);
												goTo(nextEntry);
												requestAnimationFrame(() => {
													scrollToEntry(nextEntry);
												});
											}}
										>
											<ChevronDown className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="left">Next</TooltipContent>
								</Tooltip>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</TooltipProvider>
		</div>
	);
}
