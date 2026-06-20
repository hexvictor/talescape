"use client";

import { Eye, EyeOff, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import { usePersistReaderProgress } from "~/app/(tale-app)/_shared/hooks/usePersistReaderProgress";
import { createTaleEditorDraftPayload } from "~/app/(tale-app)/(tale-editor)/_shared/services/createTaleEditorDraftPayload";
import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import {
	useTaleEditorStore,
	useTaleEditorStoreShallow,
} from "../../hooks/useTaleEditorStore";
import { EditorInspectorOverlay } from "../EditorInspectorOverlay";
import { EditorModeToolbar } from "./EditorModeToolbar";
import { EditorPaneResizeHandle } from "./EditorPaneResizeHandle";
import { TaleBranchGraph } from "./TaleBranchGraph";
import { TaleEditorSelectionPanel } from "./TaleEditorSelectionPanel";

/**
 * Renders the editable tale workspace and reading-mode toggle for edit routes.
 *
 * @returns Tale editor workspace.
 *
 * @example
 * <TaleEditorWorkspace />
 */
export function TaleEditorWorkspace(): React.JSX.Element {
	const editorBodyRef = useRef<HTMLDivElement>(null);
	const currentBranchId = useTaleEditorStore(
		(state) => state.navigation.current?.branchId ?? null,
	);
	const tale = useTaleEditorStore((state) => state.tale.data);
	const {
		closeInspector,
		openInspector,
		setHighlightedBranchId,
		setSelectedBlockId,
		setSelectedBranchId,
	} = useTaleEditorStoreShallow((state) => state.editor);
	const { setSelectedPathId } = useTaleEditorStoreShallow(
		(state) => state.editorGraph,
	);
	const {
		previewOpen,
		previewWidth,
		rightPanelOpen,
		rightPanelWidth,
		setPreviewOpen,
		setPreviewWidth,
		setRightPanelOpen,
		setRightPanelWidth,
		setSurface,
		surface,
	} = useTaleEditorStoreShallow((state) => state.editorWorkspace);
	const saveDraft = api.taleReader.editor.saveDraft.useMutation();

	const selectBlock = useCallback(
		(blockId: string): void => {
			const target: TaleInspectorTarget = { id: blockId, type: "block" };
			setSelectedPathId(null);
			openInspector(target);
		},
		[openInspector, setSelectedPathId],
	);
	const selectBranch = useCallback(
		(branchId: string): void => {
			setSelectedPathId(null);
			closeInspector();
			setSelectedBlockId(null);
			setSelectedBranchId(branchId);
		},
		[
			closeInspector,
			setSelectedBlockId,
			setSelectedBranchId,
			setSelectedPathId,
		],
	);
	const selectPath = useCallback(
		(pathId: string): void => {
			setSelectedPathId(pathId);
			closeInspector();
			setSelectedBlockId(null);
			setSelectedBranchId(null);
		},
		[
			closeInspector,
			setSelectedBlockId,
			setSelectedBranchId,
			setSelectedPathId,
		],
	);
	const clearSelection = useCallback((): void => {
		setSelectedPathId(null);
		closeInspector();
		setSelectedBlockId(null);
		setSelectedBranchId(null);
	}, [
		closeInspector,
		setSelectedBlockId,
		setSelectedBranchId,
		setSelectedPathId,
	]);
	const save = useCallback((): void => {
		saveDraft.mutate(createTaleEditorDraftPayload(tale));
	}, [saveDraft, tale]);

	if (surface === "reading") {
		return (
			<div
				data-reader-component="TaleEditorWorkspace"
				data-reader-role="reading-mode"
			>
				<EditorModeToolbar
					surface={surface}
					onChange={setSurface}
					onSave={save}
				/>
				<EditorReadingProgressPersistence />
				<ReaderViewport additionalOverlay={<EditorInspectorOverlay />} />
			</div>
		);
	}

	return (
		<div
			data-reader-component="TaleEditorWorkspace"
			data-reader-role="edit-mode"
			className="fixed inset-0 z-50 flex flex-col bg-[#050506] text-white"
		>
			<EditorModeToolbar
				saving={saveDraft.isPending}
				status={
					saveDraft.isPending
						? "Saving"
						: saveDraft.isSuccess
							? "Saved"
							: saveDraft.isError
								? "Save failed"
								: "Unsaved"
				}
				surface={surface}
				onChange={setSurface}
				onSave={save}
			/>
			<div ref={editorBodyRef} className="flex min-h-0 flex-1">
				{previewOpen ? (
					<div
						data-reader-component="TaleEditorWorkspace"
						data-reader-role="live-preview-pane"
						className="relative min-w-[22rem] max-w-[70vw] border-white/10 border-r"
						style={{ width: `${previewWidth}vw` }}
					>
						<ReaderViewport
							additionalOverlay={<EditorInspectorOverlay />}
							embedded
							showReaderUi={false}
						/>
					</div>
				) : null}
				{previewOpen ? (
					<EditorPaneResizeHandle
						label="Resize preview"
						onDrag={(clientX) => {
							const bounds = editorBodyRef.current?.getBoundingClientRect();
							if (!bounds) return;
							const width = ((clientX - bounds.left) / window.innerWidth) * 100;
							setPreviewWidth(Math.max(28, Math.min(70, width)));
						}}
					/>
				) : null}
				<main className="relative flex min-w-0 flex-1">
					<button
						type="button"
						className="absolute top-3 left-3 z-20 flex h-9 items-center gap-2 rounded border border-white/12 bg-black/70 px-3 text-white/70 text-xs hover:bg-white/8 hover:text-white"
						onClick={() => setPreviewOpen(!previewOpen)}
					>
						{previewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
						Preview
					</button>
					<TaleBranchGraph
						activeBranchId={currentBranchId}
						onClearSelection={clearSelection}
						onHighlightBranch={setHighlightedBranchId}
						onSelectBlock={selectBlock}
						onSelectBranch={selectBranch}
						onSelectPath={selectPath}
						showActiveState={previewOpen}
					/>
					<button
						type="button"
						className="absolute top-14 right-3 z-30 grid h-9 w-9 place-items-center rounded border border-white/12 bg-black/72 text-white/62 hover:bg-white/8 hover:text-white"
						title={rightPanelOpen ? "Hide editor panel" : "Show editor panel"}
						onClick={() => setRightPanelOpen(!rightPanelOpen)}
					>
						{rightPanelOpen ? (
							<PanelRightClose size={15} />
						) : (
							<PanelRightOpen size={15} />
						)}
					</button>
					{rightPanelOpen ? (
						<>
							<EditorPaneResizeHandle
								label="Resize editor panel"
								onDrag={(clientX) => {
									const bounds = editorBodyRef.current?.getBoundingClientRect();
									if (!bounds) return;
									setRightPanelWidth(
										Math.max(280, Math.min(640, bounds.right - clientX)),
									);
								}}
							/>
							<TaleEditorSelectionPanel />
						</>
					) : null}
				</main>
			</div>
		</div>
	);
}

/**
 * Persists progress while the edit route is temporarily showing reading mode.
 *
 * @returns Null because it only owns persistence effects.
 *
 * @example
 * <EditorReadingProgressPersistence />
 */
function EditorReadingProgressPersistence(): null {
	usePersistReaderProgress();
	return null;
}
