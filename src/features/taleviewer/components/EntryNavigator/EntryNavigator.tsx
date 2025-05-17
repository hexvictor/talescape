"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "~/components/ui/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/Tooltip";

import type { BookEntry } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

const ICON_MAP: Record<string, string> = {
	prologue: "🚪",
	epilogue: "📜",
	timeline: "🕰️",
	codex: "📖",
	flashback: "🧠",
	quote: "❝",
	dream: "💤",
	letter: "✉️",
	interlude: "🎭",
	map: "🗺️",
	table_of_contents: "📚",
	vocabulary: "🔤",
	appendix: "📎",
	poem: "📝",
	note: "🗒️",
	unknown: "❓",
};

interface EntryNavigatorProps {
	entries: BookEntry[];
	visibleCount?: number;
}

export default function EntryNavigator({
	entries,
	visibleCount = 7,
}: EntryNavigatorProps) {
	const uiVisible = useTaleReaderStore((s) => s.uiVisible);
	const currentEntry = useTaleReaderStore((s) => s.currentEntry);
	const setCurrentEntry = useTaleReaderStore((s) => s.setCurrentEntry);

	const goTo = (i: number) => setCurrentEntry(i, 1);

	const activeRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		activeRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}, [currentEntry]);

	if (entries.length <= 1) return null;

	let start = Math.max(0, currentEntry - Math.floor(visibleCount / 2));
	const end = Math.min(entries.length - 1, start + visibleCount - 1);
	if (end === entries.length - 1) start = Math.max(0, end - visibleCount + 1);

	const visibleEntries = entries.slice(start, end + 1);
	const numberedEntries = entries.filter((entry) => entry.type === "chapter");

	const entryHeight = 40;
	const buttonOffset = 64;
	const containerHeight = visibleCount * entryHeight + buttonOffset;

	return (
		<div
			className={clsx(
				"-translate-y-1/2 fixed top-1/2 right-6 z-100 hidden md:flex",
				!uiVisible && "pointer-events-none opacity-0",
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
											onClick={() => goTo(Math.max(0, currentEntry - 1))}
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
												onClick={() => goTo(globalIndex)}
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
												{entry.pages} pages
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>

					<AnimatePresence mode="wait">
						{currentEntry < entries.length - 1 && (
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
											onClick={() =>
												goTo(Math.min(entries.length - 1, currentEntry + 1))
											}
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
