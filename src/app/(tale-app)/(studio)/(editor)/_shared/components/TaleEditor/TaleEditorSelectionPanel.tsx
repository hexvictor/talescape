"use client";

import { useState } from "react";
import { NarrativePanel } from "~/app/(tale-app)/(studio)/_shared/components/Inspector/NarrativePanel";
import { TaleInspectorPanel } from "~/app/(tale-app)/(studio)/_shared/components/Inspector/TaleInspectorPanel";
import { TaleSettingsPanel } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleSettingsPanel";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import {
	useTaleStudioStore,
	useTaleStudioStoreShallow,
} from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import {
	addDraftScene,
	editBranch,
	editPath,
	moveBlockInTale,
	removeDraftBranch,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	getSceneProgressionFrameIds,
	getTaleScenes,
} from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleScene,
	Tale,
	TalePath,
} from "~/app/(tale-app)/_shared/types";
import { useTaleRootStore } from "~/app/_shared/contexts/TaleRootStoreContext";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Tab, TabList, Tabs } from "~/components/ui/tabs";
import Textarea from "~/components/ui/textarea";

type PathType = TalePath["type"];

/**
 * Renders focused editing controls for the selected branch or block.
 *
 * @returns Editor selection panel.
 *
 * @example
 * <TaleEditorSelectionPanel />
 */
export function TaleEditorSelectionPanel(): React.JSX.Element {
	const { dialogs } = useTaleStudio();
	const isMobile = useTaleRootStore((state) => state.derived.isMobile);
	const { selectedBranchId, inspector: selectedTarget } =
		useTaleStudioStoreShallow((state) => state.studioSelection);
	const selectedPathId = useTaleStudioStore(
		(state) => state.editorGraph.selectedPathId,
	);
	const width = useTaleStudioStore(
		(state) => state.editorLayout.rightPanelWidth,
	);
	const { setTale: setData, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const branch = selectedBranchId
		? tale.indexMap.branchesById[selectedBranchId]
		: null;
	const path = selectedPathId ? tale.indexMap.pathsById[selectedPathId] : null;

	return (
		<aside
			data-reader-component="TaleEditorSelectionPanel"
			data-reader-role="editor-right-panel"
			data-studio-component="TaleEditorSelectionPanel"
			data-studio-role="editor-right-panel"
			className="studio-inspector-drawer h-[45dvh] w-full overflow-hidden border-foreground border-t-[3px] bg-card md:h-full md:border-t-0 md:border-l-[3px]"
			style={isMobile ? undefined : { width }}
		>
			<div className="h-full min-h-0 overflow-y-auto p-3">
				{selectedTarget ? (
					<TaleInspectorPanel target={selectedTarget} />
				) : path ? (
					<PathEditor path={path} tale={tale} onChange={setData} />
				) : branch ? (
					<BranchEditor
						branchId={branch.id}
						description={branch.description ?? ""}
						tale={tale}
						title={branch.title}
						onChange={setData}
					/>
				) : (
					<TaleSettingsPanel />
				)}
			</div>
		</aside>
	);
}

/**
 * Renders branch metadata controls.
 *
 * @param props - Branch editor props.
 * @param props.branchId - Branch id being edited.
 * @param props.description - Current branch description.
 * @param props.onChange - Receives the next tale.
 * @param props.tale - Current tale.
 * @param props.title - Current branch title.
 * @returns Branch metadata form.
 *
 * @example
 * <BranchEditor branchId="1" title="Route" description="" tale={tale} onChange={setData} />
 */
function BranchEditor({
	branchId,
	description,
	onChange,
	tale,
	title,
}: {
	branchId: string;
	description: string;
	onChange: (tale: Tale) => void;
	tale: Tale;
	title: string;
}): React.JSX.Element {
	const { dialogs } = useTaleStudio();
	const [tab, setTab] = useState<"details" | "narrative">("details");
	return (
		<div
			data-reader-component="BranchEditor"
			data-reader-role="branch-form"
			data-studio-component="BranchEditor"
			data-studio-role="branch-form"
		>
			<Tabs
				selectedKey={tab}
				className="mb-3"
				onSelectionChange={(key) =>
					setTab(String(key) as "details" | "narrative")
				}
			>
				<TabList aria-label="Branch editor sections" density="compact">
					{(["details", "narrative"] as const).map((value) => (
						<Tab
							key={value}
							className="flex-1 capitalize"
							density="compact"
							id={value}
						>
							{value}
						</Tab>
					))}
				</TabList>
			</Tabs>
			{tab === "narrative" ? <NarrativePanel branchId={branchId} /> : null}
			<div hidden={tab !== "details"}>
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Branch
				</p>
				<Field label="Title" className="mt-4">
					<Input
						aria-label="Branch title"
						density="compact"
						value={title}
						onChange={(event) =>
							onChange(
								editBranch(tale, branchId, (current) => ({
									...current,
									title: event.target.value,
								})),
							)
						}
					/>
				</Field>
				<Field label="Description" className="mt-3">
					<Textarea
						aria-label="Branch description"
						className="min-h-28"
						density="compact"
						value={description}
						onChange={(event) =>
							onChange(
								editBranch(tale, branchId, (current) => ({
									...current,
									description: event.target.value,
								})),
							)
						}
					/>
				</Field>
				<BranchSceneList branchId={branchId} tale={tale} onChange={onChange} />
				{branchId !== tale.bounds.rootBranchId ? (
					<Button
						className="mt-3"
						variant="destructive"
						onClick={() => {
							dialogs.confirm({
								confirmLabel: "Remove",
								description: `Remove ${title} and its scenes?`,
								onConfirm: () => onChange(removeDraftBranch(tale, branchId)),
								title: "Remove Branch",
							});
						}}
					>
						Remove branch
					</Button>
				) : null}
			</div>
		</div>
	);
}

function BranchSceneList({
	branchId,
	onChange,
	tale,
}: {
	branchId: string;
	onChange: (tale: Tale) => void;
	tale: Tale;
}): React.JSX.Element {
	const { dialogs } = useTaleStudio();
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const scenes = getTaleScenes(tale).filter(
		(scene) => scene.branchId === branchId,
	);
	return (
		<section className="mt-4 border-foreground/12 border-t pt-3">
			<div className="flex items-center justify-between gap-2">
				<p className="font-black text-xs uppercase">Scenes</p>
				<Button
					size="sm"
					variant="ghost"
					onClick={() =>
						dialogs.prompt({
							defaultValue: "New Scene",
							onConfirm: (title) =>
								onChange(addDraftScene(tale, branchId, title)),
							title: "Name this Scene",
						})
					}
				>
					Add scene
				</Button>
			</div>
			<div className="mt-2 grid gap-2">
				{scenes.map((scene) => (
					<button
						key={scene.id}
						type="button"
						draggable
						className="flex min-h-10 items-center justify-between gap-2 border border-foreground/12 bg-background px-2 text-left text-xs hover:border-primary"
						onClick={() => openInspector({ id: scene.id, type: "scene" })}
						onDragEnd={() => setDraggedId(null)}
						onDragOver={(event) => event.preventDefault()}
						onDragStart={() => setDraggedId(scene.id)}
						onDrop={() => {
							if (draggedId && draggedId !== scene.id) {
								onChange(
									moveBlockInTale(
										tale,
										draggedId,
										branchId,
										scenes.findIndex((item) => item.id === scene.id),
									),
								);
							}
							setDraggedId(null);
						}}
					>
						<span className="min-w-0 truncate font-bold">{scene.title}</span>
						<span className="text-[10px] text-foreground/45">
							{getSceneProgressionFrameIds(tale, scene).length} frames
						</span>
					</button>
				))}
			</div>
		</section>
	);
}

/**
 * Renders path metadata and endpoint controls.
 *
 * @param props - Path editor props.
 * @param props.onChange - Receives the next tale.
 * @param props.path - Path being edited.
 * @param props.tale - Current tale.
 * @returns Path metadata form.
 *
 * @example
 * <PathEditor path={path} tale={tale} onChange={setData} />
 */
function PathEditor({
	onChange,
	path,
	tale,
}: {
	onChange: (tale: Tale) => void;
	path: TalePath;
	tale: Tale;
}): React.JSX.Element {
	const fromBlocks = getPathBranchBlocks(tale, path.fromBranchId);
	const toBlocks = getPathBranchBlocks(tale, path.toBranchId);

	return (
		<div
			data-reader-component="PathEditor"
			data-reader-role="path-form"
			data-studio-component="PathEditor"
			data-studio-role="path-form"
		>
			<p className="font-black text-[#67e8f9] text-xs uppercase tracking-[0.18em]">
				Path
			</p>
			<EditorTextField
				label="Label"
				value={path.label}
				onChange={(label) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, label })),
					)
				}
			/>
			<Field label="Type" className="mt-3">
				<Select
					aria-label="Path type"
					value={path.type}
					onValueChange={(value) =>
						onChange(
							editPath(tale, path.id, (current) => ({
								...current,
								type: value as PathType,
							})),
						)
					}
				>
					<SelectTrigger className="w-full" density="compact">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="choice">Choice</SelectItem>
						<SelectItem value="linear">Linear</SelectItem>
						<SelectItem value="return">Return</SelectItem>
						<SelectItem value="teleport">Teleport</SelectItem>
					</SelectContent>
				</Select>
			</Field>
			<Field label="Description" className="mt-3">
				<Textarea
					aria-label="Path description"
					className="min-h-24"
					density="compact"
					value={path.description ?? ""}
					onChange={(event) =>
						onChange(
							editPath(tale, path.id, (current) => ({
								...current,
								description: event.target.value,
							})),
						)
					}
				/>
			</Field>
			<PathBlockSelect
				scenes={fromBlocks}
				label="From Scene"
				value={path.fromSceneId}
				onChange={(fromSceneId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, fromSceneId })),
					)
				}
			/>
			<PathBlockSelect
				scenes={toBlocks}
				label="To Scene"
				value={path.toSceneId}
				onChange={(toSceneId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, toSceneId })),
					)
				}
			/>
		</div>
	);
}

/**
 * Renders a single text input used by editor forms.
 *
 * @param props - Text field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives changed value.
 * @param props.value - Current value.
 * @returns Text field.
 *
 * @example
 * <EditorTextField label="Title" value={title} onChange={setTitle} />
 */
function EditorTextField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<Field label={label} className="mt-4">
			<Input
				aria-label={label}
				density="compact"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Field>
	);
}

/**
 * Renders a block selector for one path endpoint.
 *
 * @param props - Scene selector props.
 * @param props.scenes - Selectable branch scenes.
 * @param props.label - Field label.
 * @param props.onChange - Receives selected block id.
 * @param props.value - Selected block id.
 * @returns Scene endpoint selector.
 *
 * @example
 * <PathBlockSelect label="From" scenes={scenes} value="1" onChange={setBlock} />
 */
function PathBlockSelect({
	scenes,
	label,
	onChange,
	value,
}: {
	scenes: ResolvedTaleScene[];
	label: string;
	onChange: (sceneId: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<Field label={label} className="mt-3">
			<Select aria-label={label} value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full" density="compact">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{scenes.map((block) => (
						<SelectItem key={block.id} value={block.id}>
							{block.order + 1}. {block.title}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}

/**
 * Gets ordered scenes for one branch.
 *
 * @param tale - Current tale.
 * @param branchId - Branch id to read.
 * @returns Ordered branch scenes.
 *
 * @example
 * const scenes = getPathBranchBlocks(tale, path.fromBranchId);
 */
function getPathBranchBlocks(
	tale: Tale,
	branchId: string,
): ResolvedTaleScene[] {
	return getTaleScenes(tale)
		.filter((block) => block.branchId === branchId)
		.sort((first, second) => first.order - second.order);
}
