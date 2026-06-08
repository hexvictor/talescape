"use client";

import clsx from "clsx";
import {
	BookMarked,
	ChevronDown,
	Image,
	MessageCircle,
	Sparkles,
} from "lucide-react";
import { useReaderHubState } from "../../../hooks/store/useReaderNavigationSelectors";
import { useReaderLocationContext } from "../../../hooks/useReaderLocationContext";
import { getReaderHubContent } from "../../../services/readerHubContent";
import type { ReaderHubPanel } from "../../../store/slices/hubSlice";

const panels: {
	icon: typeof MessageCircle;
	id: ReaderHubPanel;
	label: string;
}[] = [
	{ icon: MessageCircle, id: "community", label: "Community" },
	{ icon: Image, id: "art", label: "Art" },
	{ icon: BookMarked, id: "codex", label: "Codex" },
	{ icon: Sparkles, id: "trivia", label: "Trivia" },
];

/**
 * Renders contextual community and reference information for the current page.
 *
 * @returns The contextual Reader Hub.
 *
 * @example
 * <ReaderHub />
 */
export function ReaderHub(): React.JSX.Element {
	const { page } = useReaderLocationContext();
	const { activePanel, open, setActivePanel, toggleOpen } = useReaderHubState();
	const pageTitle = page?.title ?? page?.type ?? "Current page";
	const content = getReaderHubContent(page?.id ?? "unknown", pageTitle);

	return (
		<aside
			data-reader-ui="true"
			className={clsx(
				"pointer-events-auto absolute top-4 right-4 z-50 overflow-hidden border border-white/12 bg-black/88 shadow-2xl backdrop-blur-md transition",
				open
					? "bottom-4 flex w-[min(34rem,calc(100vw-2rem))] flex-col rounded-lg"
					: "h-12 w-12 rounded-lg",
			)}
		>
			<button
				type="button"
				aria-label="Toggle Reader Hub"
				className="flex h-12 w-full shrink-0 items-center gap-2 border-white/10 border-b px-3 text-left font-semibold text-white/82 text-xs"
				onClick={toggleOpen}
			>
				<BookMarked size={16} />
				{open ? (
					<>
						<span className="min-w-0 flex-1 truncate">
							Reader Hub · {pageTitle}
						</span>
						<ChevronDown size={15} />
					</>
				) : null}
			</button>
			{open ? (
				<div className="flex min-h-0 flex-1 flex-col p-3">
					<div className="mb-3 flex gap-1 overflow-x-auto [scrollbar-width:none]">
						{panels.map((panel) => {
							const Icon = panel.icon;
							return (
								<button
									key={panel.id}
									type="button"
									className={clsx(
										"flex items-center gap-1.5 rounded px-2.5 py-1.5 font-semibold text-[11px]",
										activePanel === panel.id
											? "bg-[#d9b56f] text-black"
											: "text-white/52 hover:bg-white/8 hover:text-white",
									)}
									onClick={() => setActivePanel(panel.id)}
								>
									<Icon size={13} />
									{panel.label}
								</button>
							);
						})}
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
						{activePanel === "community" ? (
							<div className="space-y-2">
								{content.comments.map((comment) => (
									<HubCard key={`${comment.author}-${comment.body}`}>
										<p className="font-semibold text-[#e2c98f] text-xs">
											{comment.author}
										</p>
										<p className="mt-1 text-white/62 text-xs leading-relaxed">
											{comment.body}
										</p>
									</HubCard>
								))}
							</div>
						) : null}
						{activePanel === "art" ? (
							<div className="grid grid-cols-2 gap-2">
								{content.art.map((art) => (
									<HubCard key={art.credit}>
										<div className="mb-2 aspect-video rounded bg-[linear-gradient(135deg,#24211d,#55472f,#171717)]" />
										<p className="text-white/68 text-xs">{art.caption}</p>
										<p className="mt-1 text-[10px] text-white/35">
											{art.credit}
										</p>
									</HubCard>
								))}
							</div>
						) : null}
						{activePanel === "codex" ? (
							<div className="space-y-2">
								{content.codex.map((item) => (
									<HubCard key={item.name}>
										<p className="text-[10px] text-white/35 uppercase">
											{item.type}
										</p>
										<p className="mt-1 font-semibold text-sm text-white/85">
											{item.name}
										</p>
										<p className="mt-1 text-white/55 text-xs leading-relaxed">
											{item.description}
										</p>
									</HubCard>
								))}
							</div>
						) : null}
						{activePanel === "trivia" ? (
							<div className="space-y-2">
								{content.trivia.map((item) => (
									<HubCard key={item}>
										<p className="text-white/62 text-xs leading-relaxed">
											{item}
										</p>
									</HubCard>
								))}
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</aside>
	);
}

/**
 * Renders a shared Reader Hub content surface.
 *
 * @param props - Hub card child content.
 * @returns A contextual hub card.
 */
function HubCard({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<div className="rounded-md border border-white/8 bg-white/[0.035] p-3">
			{children}
		</div>
	);
}
