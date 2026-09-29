"use client";

import {
	FileText,
	GitBranch,
	Image,
	ListTree,
	Settings,
	Shapes,
	X,
} from "lucide-react";
import { useMemo } from "react";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { getTaleBranches } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	Tale,
	TaleElement,
	TaleInspectorTarget,
} from "~/app/(tale-app)/_shared/types";

type LeftPanel = "assets" | "narrative" | "settings" | "tree";

const railItems: Array<{
	icon: React.ElementType;
	id: "map" | LeftPanel;
	label: string;
}> = [
	{ icon: GitBranch, id: "map", label: "Map" },
	{ icon: ListTree, id: "tree", label: "Tree" },
	{ icon: Shapes, id: "assets", label: "Assets" },
	{ icon: FileText, id: "narrative", label: "Narrative" },
	{ icon: Settings, id: "settings", label: "Settings" },
];

/** Renders the left Studio navigation rail and structural drawers. */
export function TaleEditorLeftRail(): React.JSX.Element {
	const tale = useTaleAppStore((state) => state.document.tale);
	const { toolbar } = useTaleStudio();
	const {
		activeLeftPanel,
		graphOpen,
		openInspector,
		setActiveLeftPanel,
		setGraphOpen,
	} = useTaleStudioStoreShallow((state) => ({
		activeLeftPanel: state.editorLayout.activeLeftPanel,
		graphOpen: state.editorLayout.graphOpen,
		openInspector: state.studioSelection.openInspector,
		setActiveLeftPanel: state.editorLayout.setActiveLeftPanel,
		setGraphOpen: state.editorLayout.setGraphOpen,
	}));
	const openPanel = (panel: LeftPanel): void => {
		if (panel === "settings") {
			toolbar.openSettings();
			return;
		}
		setActiveLeftPanel(activeLeftPanel === panel ? null : panel);
	};
	return (
		<aside
			data-reader-component="TaleEditorLeftRail"
			data-reader-role="editor-left-rail"
			data-studio-component="TaleEditorLeftRail"
			data-studio-role="editor-left-rail"
			className="flex min-h-0 border-foreground border-r-[3px] bg-card"
		>
			<nav className="flex w-16 shrink-0 flex-col items-center gap-2 p-2">
				{railItems.map(({ icon: Icon, id, label }) => {
					const active = id === "map" ? graphOpen : activeLeftPanel === id;
					return (
						<button
							key={id}
							type="button"
							aria-label={label}
							aria-pressed={active}
							className={[
								"hover:-translate-y-0.5 grid h-12 w-12 place-items-center border-2 border-foreground text-[9px] shadow-[2px_2px_0_var(--comic-ink)] transition",
								active
									? "bg-primary text-primary-foreground"
									: "bg-background text-foreground hover:bg-accent",
							].join(" ")}
							title={label}
							onClick={() => {
								if (id === "map") {
									setGraphOpen(!graphOpen);
									return;
								}
								openPanel(id);
							}}
						>
							<Icon size={17} />
						</button>
					);
				})}
			</nav>
			{activeLeftPanel ? (
				<section className="w-[min(25rem,calc(100vw-4rem))] overflow-hidden border-foreground border-l-[3px] bg-background">
					<header className="flex items-center justify-between border-foreground/15 border-b px-3 py-2">
						<p className="font-black text-xs uppercase">
							{getPanelTitle(activeLeftPanel)}
						</p>
						<button
							type="button"
							aria-label="Close structure panel"
							className="grid h-8 w-8 place-items-center border border-foreground/15 hover:bg-foreground/8"
							onClick={() => setActiveLeftPanel(null)}
						>
							<X size={15} />
						</button>
					</header>
					<div className="max-h-full overflow-y-auto p-3 text-xs">
						{activeLeftPanel === "tree" ? (
							<StructureTree tale={tale} onOpen={openInspector} />
						) : activeLeftPanel === "assets" ? (
							<AssetInventory tale={tale} onOpen={openInspector} />
						) : activeLeftPanel === "narrative" ? (
							<NarrativeTree tale={tale} />
						) : null}
					</div>
				</section>
			) : null}
		</aside>
	);
}

function StructureTree({
	onOpen,
	tale,
}: {
	onOpen: (target: TaleInspectorTarget) => void;
	tale: Tale;
}): React.JSX.Element {
	const branches = useMemo(() => getTaleBranches(tale), [tale]);
	return (
		<div className="grid gap-2">
			{branches.map((branch) => (
				<details
					key={branch.id}
					open
					className="border border-foreground/12 p-2"
				>
					<summary className="cursor-pointer font-bold">{branch.title}</summary>
					<div className="mt-2 grid gap-2 pl-2">
						{branch.sceneIds.map((sceneId) => {
							const scene = tale.indexMap.scenesById[sceneId];
							if (!scene) return null;
							return (
								<details key={scene.id} open className="border-l pl-2">
									<summary>
										<button
											type="button"
											className="font-semibold hover:text-primary"
											onClick={() => onOpen({ id: scene.id, type: "scene" })}
										>
											{scene.title}
										</button>
									</summary>
									<div className="mt-1 grid gap-1 pl-3">
										{scene.frameIds.map((frameId) => {
											const frame = tale.indexMap.framesById[frameId];
											if (!frame || frame.kind === "group") return null;
											return (
												<div key={frame.id} className="grid gap-1">
													<button
														type="button"
														className="text-left hover:text-primary"
														onClick={() =>
															onOpen({ id: frame.id, sceneId, type: "frame" })
														}
													>
														{frame.name || "Frame"} ({frame.id})
													</button>
												</div>
											);
										})}
										{scene.keyframeIds.map((keyframeId) => {
											const keyframe = tale.indexMap.keyframesById[keyframeId];
											if (!keyframe) return null;
											return (
												<button
													key={keyframe.id}
													type="button"
													className="text-left text-foreground/60 hover:text-primary"
													onClick={() =>
														onOpen({
															id: keyframe.id,
															sceneId,
															type: "keyframe",
														})
													}
												>
													Keyframe: {keyframe.title}
												</button>
											);
										})}
									</div>
								</details>
							);
						})}
					</div>
				</details>
			))}
		</div>
	);
}

function AssetInventory({
	onOpen,
	tale,
}: {
	onOpen: (target: TaleInspectorTarget) => void;
	tale: Tale;
}): React.JSX.Element {
	const branchesBySceneId = new Map(
		Object.values(tale.indexMap.scenesById).map((scene) => [
			scene.id,
			tale.indexMap.branchesById[scene.branchId]?.title ?? "",
		]),
	);
	return (
		<div className="grid gap-2">
			{tale.order.elementIds.flatMap((id) => {
				const element = tale.indexMap.elementsById[id];
				const scene = element
					? tale.indexMap.scenesById[element.sceneId]
					: undefined;
				const frame = element?.frameId
					? tale.indexMap.framesById[element.frameId]
					: undefined;
				return element && scene
					? [
							<button
								key={element.id}
								type="button"
								className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 border border-foreground/12 p-2 text-left hover:border-primary"
								onClick={() =>
									onOpen({ id: element.id, sceneId: scene.id, type: "element" })
								}
							>
								<ElementThumb element={element} />
								<span className="min-w-0">
									<span className="block truncate font-bold">
										{element.label || element.type}
									</span>
									<span className="block truncate text-foreground/50">
										{branchesBySceneId.get(scene.id)} / {scene.title}
									</span>
									<span className="block truncate text-foreground/40">
										{frame?.name || "Frame"} / {element.type}
									</span>
								</span>
							</button>,
						]
					: [];
			})}
		</div>
	);
}

function NarrativeTree({ tale }: { tale: Tale }): React.JSX.Element {
	return (
		<div className="grid gap-2">
			{tale.order.partIds.map((partId) => {
				const part = tale.indexMap.partsById[partId];
				if (!part) return null;
				return (
					<details
						key={part.id}
						open
						className="border border-foreground/12 p-2"
					>
						<summary className="cursor-pointer font-bold">{part.title}</summary>
						<div className="mt-2 grid gap-1 pl-2">
							{part.entryIds.map((entryId) => {
								const entry = tale.indexMap.entriesById[entryId];
								if (!entry) return null;
								return (
									<details key={entry.id} open className="border-l pl-2">
										<summary>{entry.title}</summary>
										<div className="grid gap-1 pl-3 text-foreground/62">
											{entry.pageIds.map((pageId) => {
												const page = tale.indexMap.pagesById[pageId];
												return page ? (
													<span key={page.id}>{page.title}</span>
												) : null;
											})}
										</div>
									</details>
								);
							})}
						</div>
					</details>
				);
			})}
		</div>
	);
}

function ElementThumb({
	element,
}: { element: TaleElement }): React.JSX.Element {
	if (element.type === "image" && element.src)
		return <img className="h-12 w-12 object-cover" src={element.src} alt="" />;
	return (
		<span className="grid h-12 w-12 place-items-center bg-foreground/5">
			<Image size={15} />
		</span>
	);
}

function getPanelTitle(panel: LeftPanel): string {
	if (panel === "tree") return "Structure Tree";
	if (panel === "assets") return "Assets";
	if (panel === "narrative") return "Narrative";
	return "Settings";
}
