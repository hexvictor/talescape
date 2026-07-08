"use client";

import {
	editBranch,
	editPath,
} from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { Tale, TalePath } from "~/app/(tale-app)/_shared/types";
import { useAppStore } from "~/contexts/AppStoreContext";
import {
	useTaleEditorStore,
	useTaleEditorStoreShallow,
} from "../../hooks/useTaleEditorStore";
import { TaleInspectorPanel } from "../Inspector/TaleInspectorPanel";
import { TaleSettingsPanel } from "./TaleSettingsPanel";

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
	const isMobile = useAppStore((state) => state.derived.isMobile);
	const { selectedBranchId, inspector: selectedTarget } =
		useTaleEditorStoreShallow((state) => state.editor);
	const selectedPathId = useTaleEditorStore(
		(state) => state.editorGraph.selectedPathId,
	);
	const width = useTaleEditorStore(
		(state) => state.editorWorkspace.rightPanelWidth,
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
			className="h-[45dvh] w-full overflow-hidden border-foreground/10 border-t bg-background/84 md:h-full md:border-t-0 md:border-l"
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
	return (
		<div data-reader-component="BranchEditor" data-reader-role="branch-form">
			<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
				Branch
			</p>
			<label className="mt-4 block text-foreground/62 text-xs">
				Title
				<input
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
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
			</label>
			<label className="mt-3 block text-foreground/62 text-xs">
				Description
				<textarea
					className="mt-1 min-h-28 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 py-2 text-foreground text-sm outline-none focus:border-primary/60"
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
			</label>
		</div>
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
		<div data-reader-component="PathEditor" data-reader-role="path-form">
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
			<label className="mt-3 block text-foreground/62 text-xs">
				Type
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
					value={path.type}
					onChange={(event) =>
						onChange(
							editPath(tale, path.id, (current) => ({
								...current,
								type: event.target.value as PathType,
							})),
						)
					}
				>
					<option value="choice">Choice</option>
					<option value="linear">Linear</option>
					<option value="return">Return</option>
					<option value="teleport">Teleport</option>
				</select>
			</label>
			<label className="mt-3 block text-foreground/62 text-xs">
				Description
				<textarea
					className="mt-1 min-h-24 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 py-2 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
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
			</label>
			<PathBlockSelect
				blocks={fromBlocks}
				label="From block"
				value={path.fromBlockId}
				onChange={(fromBlockId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, fromBlockId })),
					)
				}
			/>
			<PathBlockSelect
				blocks={toBlocks}
				label="To block"
				value={path.toBlockId}
				onChange={(toBlockId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, toBlockId })),
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
		<label className="mt-4 block text-foreground/62 text-xs">
			{label}
			<input
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders a block selector for one path endpoint.
 *
 * @param props - Block selector props.
 * @param props.blocks - Selectable branch blocks.
 * @param props.label - Field label.
 * @param props.onChange - Receives selected block id.
 * @param props.value - Selected block id.
 * @returns Block endpoint selector.
 *
 * @example
 * <PathBlockSelect label="From" blocks={blocks} value="1" onChange={setBlock} />
 */
function PathBlockSelect({
	blocks,
	label,
	onChange,
	value,
}: {
	blocks: Tale["structure"]["blocks"];
	label: string;
	onChange: (blockId: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-3 block text-foreground/62 text-xs">
			{label}
			<select
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{blocks.map((block) => (
					<option key={block.id} value={block.id}>
						{block.order + 1}. {block.title}
					</option>
				))}
			</select>
		</label>
	);
}

/**
 * Gets ordered blocks for one branch.
 *
 * @param tale - Current tale.
 * @param branchId - Branch id to read.
 * @returns Ordered branch blocks.
 *
 * @example
 * const blocks = getPathBranchBlocks(tale, path.fromBranchId);
 */
function getPathBranchBlocks(
	tale: Tale,
	branchId: string,
): Tale["structure"]["blocks"] {
	return tale.structure.blocks
		.filter((block) => block.branchId === branchId)
		.sort((first, second) => first.order - second.order);
}
