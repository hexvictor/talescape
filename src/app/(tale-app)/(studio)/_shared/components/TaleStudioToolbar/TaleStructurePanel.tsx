"use client";

import {
	Boxes,
	Frame,
	GitBranch,
	Image,
	Layers3,
	Plus,
	Type,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import { useTaleStudioStore } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import {
	addDraftBranch,
	addDraftScene,
	editBranch,
	moveBlockInTale,
	removeDraftBranch,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	getTaleBranches,
	getTaleScenes,
} from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleScene,
	Tale,
	TaleElement,
	TaleFrame,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import { Tab, TabList, Tabs } from "~/components/ui/tabs";

type StructureTab = "branches" | "elements" | "frames" | "scenes";

const tabs: { icon: React.ElementType; id: StructureTab; label: string }[] = [
	{ icon: GitBranch, id: "branches", label: "Branches" },
	{ icon: Layers3, id: "scenes", label: "Scenes" },
	{ icon: Frame, id: "frames", label: "Frames" },
	{ icon: Boxes, id: "elements", label: "Elements" },
];

/** A compact, inert structure browser for draft-only tale editing. */
export function TaleStructurePanel(): React.JSX.Element {
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const [tab, setTab] = useState<StructureTab>("branches");
	const branches = useMemo(() => getTaleBranches(tale), [tale]);
	const scenes = useMemo(() => getTaleScenes(tale), [tale]);

	return (
		<section
			data-reader-component="TaleStructurePanel"
			data-reader-role="tale-structure-panel"
			data-studio-component="TaleStructurePanel"
			data-studio-role="tale-structure-panel"
			className="space-y-3"
		>
			<Tabs
				selectedKey={tab}
				onSelectionChange={(key) => setTab(String(key) as StructureTab)}
			>
				<TabList aria-label="Tale structure sections" density="compact">
					{tabs.map(({ icon: Icon, id, label }) => (
						<Tab key={id} density="compact" id={id}>
							<Icon size={14} />
							{label}
						</Tab>
					))}
				</TabList>
			</Tabs>
			{tab === "branches" ? (
				<BranchList
					branches={branches}
					scenes={scenes}
					tale={tale}
					onChange={(next, reason) => setTale(next, { reason })}
					onOpenScene={(sceneId) =>
						openInspector({ id: sceneId, type: "scene" })
					}
				/>
			) : null}
			{tab === "scenes" ? (
				<SceneList
					scenes={scenes}
					onOpen={(id) => openInspector({ id, type: "scene" })}
				/>
			) : null}
			{tab === "frames" ? (
				<FrameList
					tale={tale}
					scenes={scenes}
					onOpen={(id, sceneId) =>
						openInspector({ id, sceneId, type: "frame" })
					}
				/>
			) : null}
			{tab === "elements" ? (
				<ElementList
					tale={tale}
					scenes={scenes}
					onOpen={(id, sceneId) =>
						openInspector({ id, sceneId, type: "element" })
					}
				/>
			) : null}
		</section>
	);
}

function BranchList({
	branches,
	onChange,
	onOpenScene,
	scenes,
	tale,
}: {
	branches: ReturnType<typeof getTaleBranches>;
	onChange: (next: Tale, reason: string) => void;
	onOpenScene: (sceneId: string) => void;
	scenes: ResolvedTaleScene[];
	tale: Tale;
}): React.JSX.Element {
	const { dialogs } = useTaleStudio();
	const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
	const addBranch = (): void => {
		dialogs.prompt({
			defaultValue: "New Branch",
			onConfirm: (title) =>
				onChange(addDraftBranch(tale, title), "structure-add-branch"),
			title: "Name this Branch",
		});
	};
	const moveScene = (
		sceneId: string,
		branchId: string,
		targetId: string,
	): void => {
		if (sceneId === targetId) return;
		const branchScenes = scenes.filter((scene) => scene.branchId === branchId);
		const targetIndex = branchScenes.findIndex(
			(scene) => scene.id === targetId,
		);
		if (targetIndex < 0) return;
		onChange(
			moveBlockInTale(tale, sceneId, branchId, targetIndex),
			"structure-reorder-scene",
		);
	};
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-2">
				<p className="font-black text-xs uppercase">Branch structure</p>
				<Button size="sm" variant="secondary" onClick={addBranch}>
					<Plus size={14} /> Add branch
				</Button>
			</div>
			{branches.map((branch) => {
				const branchScenes = scenes.filter(
					(scene) => scene.branchId === branch.id,
				);
				return (
					<details
						className="border border-foreground/14 bg-background p-2"
						key={branch.id}
						open
					>
						<summary className="cursor-pointer font-bold text-xs">
							{branch.title}
						</summary>
						<div className="mt-3 grid gap-2">
							<Field label="Name">
								<Input
									aria-label={`${branch.title} branch name`}
									density="compact"
									value={branch.title}
									onChange={(event) =>
										onChange(
											editBranch(tale, branch.id, (current) => ({
												...current,
												title: event.target.value,
											})),
											"structure-rename-branch",
										)
									}
								/>
							</Field>
							<div className="flex items-center justify-between gap-2">
								<p className="font-bold text-[10px] uppercase">Scenes</p>
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										dialogs.prompt({
											defaultValue: "New Scene",
											onConfirm: (title) =>
												onChange(
													addDraftScene(tale, branch.id, title),
													"structure-add-scene",
												),
											title: "Name this Scene",
										})
									}
								>
									<Plus size={14} /> Add scene
								</Button>
							</div>
							{branchScenes.map((scene) => (
								<button
									key={scene.id}
									type="button"
									draggable
									className="grid min-h-12 grid-cols-[88px_minmax(0,1fr)] overflow-hidden border border-foreground/12 text-left hover:border-primary"
									onDragStart={() => setDraggedSceneId(scene.id)}
									onDragEnd={() => setDraggedSceneId(null)}
									onDragOver={(event) => event.preventDefault()}
									onDrop={() => {
										if (draggedSceneId)
											moveScene(draggedSceneId, branch.id, scene.id);
										setDraggedSceneId(null);
									}}
									onClick={() => onOpenScene(scene.id)}
								>
									<SceneThumbnail scene={scene} tale={tale} />
									<span className="min-w-0 p-2">
										<span className="block truncate font-bold text-xs">
											{scene.title}
										</span>
										<span className="block text-[10px] text-foreground/45">
											{countSceneFrames(tale, scene)} frames
										</span>
									</span>
								</button>
							))}
							{branch.id !== tale.bounds.rootBranchId ? (
								<Button
									variant="destructive"
									size="sm"
									onClick={() =>
										dialogs.confirm({
											confirmLabel: "Remove",
											description: `Remove ${branch.title} and its scenes?`,
											onConfirm: () =>
												onChange(
													removeDraftBranch(tale, branch.id),
													"structure-remove-branch",
												),
											title: "Remove Branch",
										})
									}
								>
									Remove branch
								</Button>
							) : null}
						</div>
					</details>
				);
			})}
		</div>
	);
}

function SceneList({
	scenes,
	onOpen,
}: { scenes: ResolvedTaleScene[]; onOpen: (id: string) => void }) {
	const { tale } = useTaleAppStoreShallow((state) => ({
		tale: state.document.tale,
	}));
	return (
		<div className="grid gap-2">
			{scenes.map((scene) => (
				<Button
					className="grid h-auto w-full grid-cols-[96px_minmax(0,1fr)] overflow-hidden whitespace-normal border border-foreground/14 p-0 text-left normal-case shadow-none hover:border-primary"
					key={scene.id}
					motion="flat"
					variant="outline"
					onPress={() => onOpen(scene.id)}
				>
					<SceneThumbnail scene={scene} tale={tale} />
					<span className="min-w-0 p-2">
						<span className="block truncate font-bold text-xs">
							{scene.title}
						</span>
						<span className="text-[10px] text-foreground/45">
							{countSceneFrames(tale, scene)} frames · {scene.elementIds.length}{" "}
							elements
						</span>
					</span>
				</Button>
			))}
		</div>
	);
}

function FrameList({
	tale,
	scenes,
	onOpen,
}: {
	tale: Tale;
	scenes: ResolvedTaleScene[];
	onOpen: (id: string, sceneId: string) => void;
}) {
	return (
		<div className="grid gap-2">
			{scenes
				.flatMap((scene) =>
					scene.frameIds
						.filter(
							(frameId) => tale.indexMap.framesById[frameId]?.kind !== "group",
						)
						.map((frameId) => ({
							frame: tale.indexMap.framesById[frameId],
							scene,
						})),
				)
				.flatMap(({ frame, scene }) =>
					frame
						? [
								<Button
									className="grid h-auto w-full grid-cols-[72px_minmax(0,1fr)] overflow-hidden whitespace-normal border border-foreground/14 p-0 text-left normal-case shadow-none hover:border-primary"
									key={frame.id}
									motion="flat"
									variant="outline"
									onPress={() => onOpen(frame.id, scene.id)}
								>
									<FrameThumbnail frame={frame} tale={tale} />
									<span className="min-w-0 p-2">
										<span className="block truncate font-bold text-xs">
											{frame.name || "Frame"}
										</span>
										<span className="text-[10px] text-foreground/45">
											{scene.title}
										</span>
									</span>
								</Button>,
							]
						: [],
				)}
		</div>
	);
}

function ElementList({
	tale,
	scenes,
	onOpen,
}: {
	tale: Tale;
	scenes: ResolvedTaleScene[];
	onOpen: (id: string, sceneId: string) => void;
}) {
	return (
		<div className="grid gap-2">
			{scenes
				.flatMap((scene) =>
					scene.elementIds.map((id) => ({
						element: tale.indexMap.elementsById[id],
						scene,
					})),
				)
				.flatMap(({ element, scene }) =>
					element
						? [
								<Button
									className="grid h-auto w-full grid-cols-[72px_minmax(0,1fr)] overflow-hidden whitespace-normal border border-foreground/14 p-0 text-left normal-case shadow-none hover:border-primary"
									key={element.id}
									motion="flat"
									variant="outline"
									onPress={() => onOpen(element.id, scene.id)}
								>
									<ElementThumbnail element={element} />
									<span className="min-w-0 p-2">
										<span className="block truncate font-bold text-xs">
											{element.label || element.type}
										</span>
										<span className="text-[10px] text-foreground/45">
											{scene.title}
										</span>
									</span>
								</Button>,
							]
						: [],
				)}
		</div>
	);
}

function countSceneFrames(tale: Tale, scene: ResolvedTaleScene): number {
	return scene.frameIds.filter(
		(id) => tale.indexMap.framesById[id]?.kind !== "group",
	).length;
}

/** Inert HTML thumbnail: no animation, media playback, navigation, or scroll hooks. */
function SceneThumbnail({
	scene,
	tale,
}: { scene: ResolvedTaleScene; tale: Tale }) {
	const first = scene.elementIds
		.map((id) => tale.indexMap.elementsById[id])
		.find(Boolean);
	return (
		<div
			className="h-14 overflow-hidden border-foreground/12 border-r p-1"
			style={{
				background:
					scene.container?.style?.background ??
					scene.style?.background ??
					"var(--card)",
			}}
		>
			<ElementThumbnail element={first} />
		</div>
	);
}

function FrameThumbnail({ frame, tale }: { frame: TaleFrame; tale: Tale }) {
	const elementId = frame.children.find(
		(child) => child.type === "element",
	)?.elementId;
	return (
		<div
			className="h-14 overflow-hidden border-foreground/12 border-r p-1"
			style={frame.style}
		>
			{elementId ? (
				<ElementThumbnail element={tale.indexMap.elementsById[elementId]} />
			) : null}
		</div>
	);
}

function ElementThumbnail({ element }: { element?: TaleElement }) {
	if (!element) return <div className="h-full bg-foreground/5" />;
	if (element.type === "image" && element.src)
		return (
			<img className="h-full w-full object-cover" src={element.src} alt="" />
		);
	if (element.type === "text" || element.type === "quote")
		return (
			<div className="line-clamp-3 h-full overflow-hidden text-[8px] leading-tight">
				{element.text || element.label || "Text"}
			</div>
		);
	const Icon = element.type === "image" ? Image : Type;
	return (
		<div className="grid h-full place-items-center bg-foreground/5">
			<Icon size={15} />
		</div>
	);
}
