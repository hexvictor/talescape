"use client";
import React from "react";
import type { Block } from "~/server/db/data/tale-reader/types/tales";
import { useReaderStore } from "../../contexts/ReaderStoreContext";

type Props = {
	block: Block;
};

function Badge({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold leading-none shadow-sm sm:text-xs ${className}`}
		>
			{children}
		</span>
	);
}

function TaleBlockDebugBadgesComponent({ block }: Props) {
	const debugMode = useReaderStore((s) => s.debugMode);
	if (!debugMode) return null;

	const locationBadges = [
		{
			key: "block",
			label: `Block ${block.globalIndex + 1}`,
			className: "border-sky-300 bg-sky-500/90 text-white",
		},
		{
			key: "section",
			label: `Section ${block.section.index + 1}`,
			className: "border-emerald-300 bg-emerald-500/90 text-white",
		},
		{
			key: "part",
			label: `Part ${block.part.index + 1}`,
			className: "border-rose-300 bg-rose-500/90 text-white",
		},
		{
			key: "entry",
			label: `Entry ${block.entry.globalIndex + 1}`,
			className: "border-violet-300 bg-violet-500/90 text-white",
		},
		block.page?.globalIndex !== undefined
			? {
					key: "page",
					label: `Page ${block.page.globalIndex + 1}`,
					className: "border-pink-300 bg-pink-500/90 text-white",
				}
			: null,
	].filter(Boolean) as { key: string; label: string; className: string }[];

	const stateBadges = [
		block.isPageBlock
			? {
					key: "page-block",
					label: "Page Block",
					className: "border-zinc-300 bg-zinc-900/90 text-white",
				}
			: null,
		{
			key: "snap",
			label: block.isSnap ? "Snap On" : "Snap Off",
			className: block.isSnap
				? "border-amber-300 bg-amber-500/90 text-black"
				: "border-zinc-300 bg-zinc-700/90 text-white",
		},
		{
			key: "orientation",
			label:
				block.section.orientation === "horizontal" ? "Horizontal" : "Vertical",
			className: "border-emerald-300 bg-emerald-500/95 text-emerald-900",
		},
		block.isFirst
			? {
					key: "first",
					label: "First",
					className: "border-sky-300 bg-sky-100/95 text-sky-900",
				}
			: null,
		block.isLast
			? {
					key: "last",
					label: "Last",
					className: "border-sky-300 bg-sky-900/90 text-white",
				}
			: null,
		block.isFirstInSection
			? {
					key: "first-section",
					label: "First in Section",
					className: "border-emerald-300 bg-emerald-100/95 text-emerald-900",
				}
			: null,

		block.isLastInSection
			? {
					key: "last-section",
					label: "Last in Section",
					className: "border-emerald-300 bg-emerald-900/90 text-white",
				}
			: null,
		block.isFirstInPart
			? {
					key: "first-part",
					label: "First in Part",
					className: "border-rose-300 bg-rose-100/95 text-rose-900",
				}
			: null,
		block.isLastInPart
			? {
					key: "last-part",
					label: "Last in Part",
					className: "border-rose-300 bg-rose-900/90 text-white",
				}
			: null,
		block.isFirstInEntry
			? {
					key: "first-entry",
					label: "First in Entry",
					className: "border-violet-300 bg-violet-100/95 text-violet-900",
				}
			: null,
		block.isLastInEntry
			? {
					key: "last-entry",
					label: "Last in Entry",
					className: "border-violet-300 bg-violet-900/90 text-white",
				}
			: null,
	].filter(Boolean) as { key: string; label: string; className: string }[];

	return (
		<div className="pointer-events-none absolute top-2 right-2 z-50 max-w-[min(92vw,32rem)] rounded-2xl border border-white/20 bg-black/70 p-2 text-white shadow-2xl backdrop-blur-md sm:top-3 sm:right-3 sm:p-3">
			<div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
				{locationBadges.map((item) => (
					<Badge key={item.key} className={item.className}>
						{item.label}
					</Badge>
				))}
			</div>

			<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
				{stateBadges.map((item) => (
					<Badge key={item.key} className={item.className}>
						{item.label}
					</Badge>
				))}
			</div>
		</div>
	);
}

const TaleBlockDebugBadges = React.memo(TaleBlockDebugBadgesComponent);
export default TaleBlockDebugBadges;
