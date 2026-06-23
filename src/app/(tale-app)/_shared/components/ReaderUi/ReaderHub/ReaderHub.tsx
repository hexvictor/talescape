"use client";

import clsx from "clsx";
import {
	BookMarked,
	Image,
	MessageCircle,
	PanelRightClose,
	Settings,
	Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	useTaleReaderStore,
	useTaleReaderStoreShallow,
} from "../../../contexts/TaleReaderStoreContext";
import { useReaderLocationContext } from "../../../hooks/useReaderLocationContext";
import { getReaderHubContent } from "../../../services/readerHubContent";
import type { ReaderHubPanel } from "../../../store/slices/hubSlice";
import { ReaderHubSettings } from "./ReaderHubSettings";

type HubPanelOption = {
	icon: typeof MessageCircle;
	id: ReaderHubPanel;
	label: string;
};

const contextPanels: HubPanelOption[] = [
	{ icon: MessageCircle, id: "community", label: "Community" },
	{ icon: Image, id: "art", label: "Art" },
	{ icon: BookMarked, id: "codex", label: "Codex" },
	{ icon: Sparkles, id: "trivia", label: "Trivia" },
	{ icon: Settings, id: "settings", label: "Settings" },
];

/**
 * Renders the camera-shifting Reader Hub panel.
 *
 * @returns Reader Hub launcher and sidebar.
 *
 * @example
 * <ReaderHub />
 */
export function ReaderHub(): React.JSX.Element {
	const { page } = useReaderLocationContext();
	const { activePanel, open, setActivePanel, toggleOpen } =
		useTaleReaderStoreShallow((state) => ({
			activePanel: state.hub.activePanel,
			open: state.hub.open,
			setActivePanel: state.hub.setActivePanel,
			toggleOpen: state.hub.toggleOpen,
		}));
	const layout = useTaleReaderStore((state) => state.derived.viewportLayout);
	const pageTitle = page?.title ?? page?.type ?? "Current page";
	const content = getReaderHubContent(page?.id ?? "unknown", pageTitle);
	const mobilePortrait = layout === "mobile-portrait";
	const mobileLandscape = layout === "mobile-landscape";

	return (
		<>
			{!open ? (
				<button
					data-reader-ui="true"
					data-reader-component="ReaderHub"
					data-reader-role="collapsed-handle"
					type="button"
					aria-label="Open Reader Hub"
					className="pointer-events-auto absolute top-4 right-4 z-45 grid h-12 w-12 place-items-center rounded-lg border border-foreground/12 bg-background/78 text-foreground/72 opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:text-foreground hover:opacity-100"
					onClick={toggleOpen}
				>
					<BookMarked size={18} />
				</button>
			) : null}
			<AnimatePresence>
				{open ? (
					<motion.aside
						data-reader-ui="true"
						data-reader-component="ReaderHub"
						data-reader-role="reader-hub-sidebar"
						className={clsx(
							"pointer-events-auto absolute z-80 flex flex-col border-foreground/12 bg-background/96 shadow-2xl backdrop-blur-xl",
							mobilePortrait
								? "inset-x-0 bottom-0 h-[70dvh] w-full rounded-t-xl border-t"
								: "inset-y-0 right-0 w-[min(28rem,42vw)] border-l",
							!mobileLandscape && !mobilePortrait && "w-[min(28rem,42vw)]",
						)}
						initial={mobilePortrait ? { y: "100%" } : { x: "100%" }}
						animate={mobilePortrait ? { y: 0 } : { x: 0 }}
						exit={mobilePortrait ? { y: "100%" } : { x: "100%" }}
						transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					>
						<header className="flex h-16 shrink-0 items-center gap-3 border-foreground/10 border-b px-4">
							<BookMarked size={17} className="text-primary" />
							<div className="min-w-0 flex-1">
								<p className="font-semibold text-foreground/90 text-sm">
									Reader Hub
								</p>
								<p className="truncate text-[11px] text-foreground/40">
									{pageTitle}
								</p>
							</div>
							<button
								type="button"
								aria-label="Close Reader Hub"
								className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/48 hover:bg-foreground/7 hover:text-foreground"
								onClick={toggleOpen}
							>
								<PanelRightClose size={16} />
							</button>
						</header>
						<HubPanelSelector
							activePanel={activePanel}
							contextPanels={contextPanels}
							onSelect={setActivePanel}
						/>
						<div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:none]">
							{activePanel === "community" ? (
								<div className="space-y-2">
									{content.comments.map((comment) => (
										<HubCard key={`${comment.author}-${comment.body}`}>
											<p className="font-semibold text-primary text-xs">
												{comment.author}
											</p>
											<p className="mt-1 text-foreground/62 text-xs leading-relaxed">
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
											<p className="text-foreground/68 text-xs">
												{art.caption}
											</p>
											<p className="mt-1 text-[10px] text-foreground/35">
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
											<p className="text-[10px] text-foreground/35 uppercase">
												{item.type}
											</p>
											<p className="mt-1 font-semibold text-foreground/85 text-sm">
												{item.name}
											</p>
											<p className="mt-1 text-foreground/55 text-xs leading-relaxed">
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
											<p className="text-foreground/62 text-xs leading-relaxed">
												{item}
											</p>
										</HubCard>
									))}
								</div>
							) : null}
							{activePanel === "settings" ? <ReaderHubSettings /> : null}
						</div>
					</motion.aside>
				) : null}
			</AnimatePresence>
		</>
	);
}

/**
 * Renders compact grouped Reader Hub destinations without nested tab bars.
 *
 * @param props - Panel groups, active panel, and selection callback.
 * @returns Grouped panel selector.
 */
function HubPanelSelector({
	activePanel,
	contextPanels,
	onSelect,
}: {
	activePanel: ReaderHubPanel;
	contextPanels: HubPanelOption[];
	onSelect: (panel: ReaderHubPanel) => void;
}): React.JSX.Element {
	return (
		<nav
			data-reader-component="ReaderHub"
			data-reader-role="hub-panel-selector"
			className="flex shrink-0 items-center gap-3 overflow-x-auto border-foreground/10 border-b px-3 py-2 [scrollbar-width:none]"
		>
			<HubPanelGroup
				activePanel={activePanel}
				label="Explore"
				onSelect={onSelect}
				panels={contextPanels}
			/>
		</nav>
	);
}

/**
 * Renders one labeled group of Reader Hub destinations.
 *
 * @param props - Panel group configuration.
 * @returns Compact panel controls.
 */
function HubPanelGroup({
	activePanel,
	label,
	onSelect,
	panels,
}: {
	activePanel: ReaderHubPanel;
	label: string;
	onSelect: (panel: ReaderHubPanel) => void;
	panels: HubPanelOption[];
}): React.JSX.Element {
	return (
		<div className="flex shrink-0 items-center gap-1">
			<span className="mr-1 hidden text-[9px] text-foreground/28 uppercase sm:inline">
				{label}
			</span>
			{panels.map((panel) => {
				const Icon = panel.icon;
				return (
					<button
						key={panel.id}
						type="button"
						title={panel.label}
						aria-label={panel.label}
						className={clsx(
							"grid h-8 w-8 place-items-center rounded",
							activePanel === panel.id
								? "bg-primary text-background"
								: "text-foreground/48 hover:bg-foreground/7 hover:text-foreground",
						)}
						onClick={() => onSelect(panel.id)}
					>
						<Icon size={13} />
					</button>
				);
			})}
		</div>
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
		<div
			data-reader-component="HubCard"
			data-reader-role="hub-content-card"
			className="rounded-md border border-foreground/8 bg-foreground/[0.035] p-3"
		>
			{children}
		</div>
	);
}
