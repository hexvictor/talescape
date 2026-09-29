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
import { Button } from "~/components/ui/button";

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
			className="studio-navigation-shell flex min-h-0 border-foreground border-r-[3px] bg-card"
		>
			<nav
				aria-label="Studio tools"
				className="studio-navigation-rail flex w-16 shrink-0 flex-col items-center gap-2 p-2"
			>
				{railItems.map(({ icon: Icon, id, label }) => {
					const active = id === "map" ? graphOpen : activeLeftPanel === id;
					return (
						<Button
							key={id}
							aria-label={label}
							aria-pressed={active}
							className={[
								"studio-rail-control grid h-12 w-12 place-items-center border-2 p-0 text-[9px]",
								active
									? "bg-primary text-primary-foreground"
									: "bg-background text-foreground hover:bg-accent",
							].join(" ")}
							motion="flat"
							size="icon"
							title={label}
							variant={active ? "default" : "outline"}
							onPress={() => {
								if (id === "map") {
									setGraphOpen(!graphOpen);
									return;
								}
								openPanel(id);
							}}
						>
							<Icon size={17} />
						</Button>
					);
				})}
			</nav>
			{activeLeftPanel ? (
				<section
					data-reader-component="TaleEditorLeftRail"
					data-reader-role="editor-left-drawer"
					data-studio-component="TaleEditorLeftRail"
					data-studio-role="editor-left-drawer"
					className="studio-left-drawer w-[min(25rem,calc(100vw-4rem))] overflow-hidden border-foreground border-l-[3px] bg-background"
				>
					<header className="studio-drawer-header flex items-center justify-between border-foreground border-b-2 px-3 py-2">
						<p className="font-display text-sm uppercase">
							{getPanelTitle(activeLeftPanel)}
						</p>
						<Button
							aria-label="Close structure panel"
							className="h-8 w-8 border-foreground/15 p-0"
							motion="flat"
							size="icon"
							variant="ghost"
							onPress={() => setActiveLeftPanel(null)}
						>
							<X size={15} />
						</Button>
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
										<Button
											className="h-auto border-0 p-0 font-semibold normal-case shadow-none hover:text-primary"
											motion="flat"
											variant="ghost"
											onPress={() => onOpen({ id: scene.id, type: "scene" })}
										>
											{scene.title}
										</Button>
									</summary>
									<div className="mt-1 grid gap-1 pl-3">
										{scene.frameIds.map((frameId) => {
											const frame = tale.indexMap.framesById[frameId];
											if (!frame || frame.kind === "group") return null;
											return (
												<div key={frame.id} className="grid gap-1">
													<Button
														className="h-auto justify-start border-0 p-0 text-left font-normal normal-case shadow-none hover:text-primary"
														motion="flat"
														variant="ghost"
														onPress={() =>
															onOpen({ id: frame.id, sceneId, type: "frame" })
														}
													>
														{frame.name || "Frame"} ({frame.id})
													</Button>
												</div>
											);
										})}
										{scene.keyframeIds.map((keyframeId) => {
											const keyframe = tale.indexMap.keyframesById[keyframeId];
											if (!keyframe) return null;
											return (
												<Button
													key={keyframe.id}
													className="h-auto justify-start border-0 p-0 text-left font-normal text-foreground/60 normal-case shadow-none hover:text-primary"
													motion="flat"
													variant="ghost"
													onPress={() =>
														onOpen({
															id: keyframe.id,
															sceneId,
															type: "keyframe",
														})
													}
												>
													Keyframe: {keyframe.title}
												</Button>
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
							<Button
								key={element.id}
								className="grid h-auto w-full grid-cols-[3rem_minmax(0,1fr)] gap-2 whitespace-normal border border-foreground/12 p-2 text-left normal-case shadow-none hover:border-primary"
								motion="flat"
								variant="outline"
								onPress={() =>
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
							</Button>,
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
