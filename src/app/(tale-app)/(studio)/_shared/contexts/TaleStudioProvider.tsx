"use client";

import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	TaleRenderContext,
	type TaleRenderSlots,
} from "~/app/(tale-app)/_shared/contexts/TaleRenderContext";
import type { Tale, TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import { api } from "~/trpc/react";
import { StudioDebugHeaderActions } from "../components/TaleStudioRenderer/StudioDebugHeaderActions";
import { StudioElement } from "../components/TaleStudioRenderer/StudioElement";
import { StudioFrameOverlay } from "../components/TaleStudioRenderer/StudioFrameOverlay";
import { StudioScene } from "../components/TaleStudioRenderer/StudioScene";
import { StudioTextElementContent } from "../components/TaleStudioRenderer/StudioTextElementContent";
import { useStudioDraftRecovery } from "../hooks/useStudioDraftRecovery";
import { useStudioWorkspacePersistence } from "../hooks/useStudioWorkspacePersistence";
import { createTaleStudioDraftPayload } from "../services/createTaleStudioDraftPayload";
import {
	createTaleJsonExport,
	getTaleJsonExportFileName,
	parseTaleJsonImport,
} from "../services/taleJsonTransfer";
import {
	type TaleStudioState,
	createTaleStudioStore,
} from "../store/taleStudioStore";
import { TaleStudioStoreContext } from "./TaleStudioStoreContext";

type TaleStudioDocument = {
	exportTale: () => void;
	openImportDialog: () => void;
};

type TaleStudioToolbar = {
	closeSettings: () => void;
	dirtyStatus: string;
	openSettings: () => void;
	save: () => void;
	savePending: boolean;
	settingsOpen: boolean;
};

type StudioDialog =
	| {
			confirmLabel?: string;
			description?: string;
			kind: "confirm";
			onConfirm: () => void;
			title: string;
	  }
	| {
			defaultValue?: string;
			description?: string;
			kind: "prompt";
			label?: string;
			onConfirm: (value: string) => void;
			title: string;
	  }
	| { description?: string; kind: "notice"; title: string };

type TaleStudioDialogs = {
	confirm: (
		dialog: Omit<Extract<StudioDialog, { kind: "confirm" }>, "kind">,
	) => void;
	notice: (
		dialog: Omit<Extract<StudioDialog, { kind: "notice" }>, "kind">,
	) => void;
	prompt: (
		dialog: Omit<Extract<StudioDialog, { kind: "prompt" }>, "kind">,
	) => void;
};

type TaleStudioContextValue = {
	recovery: ReturnType<typeof useStudioDraftRecovery>;
	document: TaleStudioDocument;
	dialogs: TaleStudioDialogs;
	store: StoreApi<TaleStudioState>;
	toolbar: TaleStudioToolbar;
};

const TaleStudioContext = createContext<TaleStudioContextValue | null>(null);

const studioRenderers = {
	Scene: StudioScene,
	DebugHeaderActions: StudioDebugHeaderActions,
	Element: StudioElement,
	FrameOverlay: StudioFrameOverlay,
	TextElementContent: StudioTextElementContent,
} satisfies TaleRenderSlots;

/**
 * Provides all state and render integrations owned by Tale Studio.
 *
 * @param props - Provider props.
 * @param props.children - Tale Studio workspace subtree.
 * @returns Tale Studio provider.
 */
export function TaleStudioProvider({
	children,
}: PropsWithChildren): React.JSX.Element {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const inspectedLink = useRef<string | null>(null);
	const savedNoticeTimerRef = useRef<number | null>(null);
	const storeRef = useRef<StoreApi<TaleStudioState> | null>(null);
	if (!storeRef.current) storeRef.current = createTaleStudioStore();
	const store = storeRef.current;

	const { dirty, markSaved, setTale, tale } = useTaleAppStoreShallow(
		(state) => ({
			dirty: state.document.dirty,
			markSaved: state.document.markSaved,
			setTale: state.document.setTale,
			tale: state.document.tale,
		}),
	);
	const [settingsOpen, setSettingsOpen] = useState(false);
	useStudioWorkspacePersistence(store, tale.id);
	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		const id = query.get("inspectId");
		const type = query.get("inspect");
		if (!id) return;
		const linkKey = `${tale.id}:${type}:${id}`;
		if (inspectedLink.current === linkKey) return;
		let target: TaleInspectorTarget | null = null;
		if (type === "scene") target = { type, id };
		if (type === "frame") {
			const frame = tale.indexMap.framesById[id];
			const scene = Object.values(tale.indexMap.scenesById).find((scene) =>
				scene.frameIds.includes(id),
			);
			if (frame && scene) target = { type, id, sceneId: scene.id };
		}
		if (type === "element") {
			const element = tale.indexMap.elementsById[id];
			if (element) target = { type, id, sceneId: element.sceneId };
		}
		if (target && isInspectorTargetAvailable(target, tale)) {
			inspectedLink.current = linkKey;
			store.getState().studioSelection.openInspector(target);
		}
	}, [store, tale]);
	const recovery = useStudioDraftRecovery();
	const [savedNoticeVisible, setSavedNoticeVisible] = useState(false);
	const [dialog, setDialog] = useState<StudioDialog | null>(null);
	const {
		isError: saveFailed,
		isPending: savePending,
		mutate: saveDraft,
	} = api.taleApp.studio.saveDraft.useMutation();

	useEffect(
		() => () => {
			if (savedNoticeTimerRef.current !== null) {
				window.clearTimeout(savedNoticeTimerRef.current);
			}
		},
		[],
	);

	const closeSettings = useCallback(() => setSettingsOpen(false), []);
	const openSettings = useCallback(() => setSettingsOpen(true), []);
	const openImportDialog = useCallback(() => inputRef.current?.click(), []);

	const exportTale = useCallback((): void => {
		const exportedAt = new Date();
		const exportData = createTaleJsonExport(tale, exportedAt);
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = getTaleJsonExportFileName(tale, exportedAt);
		link.click();
		URL.revokeObjectURL(url);
	}, [tale]);

	const importTale = useCallback(
		async (file: File): Promise<void> => {
			try {
				const importedTale = parseTaleJsonImport(await file.text());
				setTale(importedTale, {
					invalidation: "measurement",
					reason: "tale-json-imported",
				});
			} catch (error) {
				setDialog({
					description:
						error instanceof Error
							? error.message
							: "The selected file could not be imported.",
					kind: "notice",
					title: "Import failed",
				});
			}
		},
		[setTale],
	);

	const save = useCallback((): void => {
		saveDraft(createTaleStudioDraftPayload(tale), {
			onSuccess: (result) => {
				if (result.tale) {
					setTale(result.tale, {
						markDirty: false,
						reason: "studio-draft-saved",
					});
				}
				markSaved();
				setSavedNoticeVisible(true);
				if (savedNoticeTimerRef.current !== null) {
					window.clearTimeout(savedNoticeTimerRef.current);
				}
				savedNoticeTimerRef.current = window.setTimeout(
					() => setSavedNoticeVisible(false),
					2400,
				);
			},
		});
	}, [markSaved, saveDraft, setTale, tale]);

	const dirtyStatus = getStudioDirtyStatus({
		dirty,
		saveFailed,
		savePending,
		savedNoticeVisible,
	});
	const dialogs = useMemo<TaleStudioDialogs>(
		() => ({
			confirm: (nextDialog) => setDialog({ ...nextDialog, kind: "confirm" }),
			notice: (nextDialog) => setDialog({ ...nextDialog, kind: "notice" }),
			prompt: (nextDialog) => setDialog({ ...nextDialog, kind: "prompt" }),
		}),
		[],
	);

	useEffect(() => {
		store.setState((state) => sanitizeStudioSelection(state, tale));
	}, [store, tale]);

	const value = useMemo<TaleStudioContextValue>(
		() => ({
			recovery,
			document: { exportTale, openImportDialog },
			dialogs,
			store,
			toolbar: {
				closeSettings,
				dirtyStatus,
				openSettings,
				save,
				savePending,
				settingsOpen,
			},
		}),
		[
			recovery,
			closeSettings,
			dirtyStatus,
			dialogs,
			exportTale,
			openImportDialog,
			openSettings,
			save,
			savePending,
			settingsOpen,
			store,
		],
	);

	return (
		<TaleStudioContext.Provider value={value}>
			<TaleStudioStoreContext.Provider value={store}>
				<TaleRenderContext.Provider value={studioRenderers}>
					<input
						ref={inputRef}
						aria-label="Import tale JSON"
						className="hidden"
						accept="application/json,.json"
						type="file"
						onChange={(event) => {
							const file = event.currentTarget.files?.[0];
							event.currentTarget.value = "";
							if (file) void importTale(file);
						}}
					/>
					{children}
					<StudioDialog dialog={dialog} onClose={() => setDialog(null)} />
				</TaleRenderContext.Provider>
			</TaleStudioStoreContext.Provider>
		</TaleStudioContext.Provider>
	);
}

function sanitizeStudioSelection(
	state: TaleStudioState,
	tale: Tale,
): TaleStudioState {
	const firstSceneId = tale.order.sceneIds[0] ?? null;
	const selectedSceneId = tale.indexMap.scenesById[
		state.studioSelection.selectedSceneId ?? ""
	]
		? state.studioSelection.selectedSceneId
		: firstSceneId;
	const selectedBranchId = tale.indexMap.branchesById[
		state.studioSelection.selectedBranchId ?? ""
	]
		? state.studioSelection.selectedBranchId
		: null;
	const inspector = isInspectorTargetAvailable(
		state.studioSelection.inspector,
		tale,
	)
		? state.studioSelection.inspector
		: null;
	const secondaryInspector = isInspectorTargetAvailable(
		state.studioSelection.secondaryInspector,
		tale,
	)
		? state.studioSelection.secondaryInspector
		: null;
	const highlightedBranchId = tale.indexMap.branchesById[
		state.studioSelection.highlightedBranchId ?? ""
	]
		? state.studioSelection.highlightedBranchId
		: null;
	const hoveredSceneId = tale.indexMap.scenesById[
		state.studioSelection.hoveredSceneId ?? ""
	]
		? state.studioSelection.hoveredSceneId
		: null;
	const selectedPathId = tale.indexMap.pathsById[
		state.editorGraph.selectedPathId ?? ""
	]
		? state.editorGraph.selectedPathId
		: null;
	if (
		selectedSceneId === state.studioSelection.selectedSceneId &&
		selectedBranchId === state.studioSelection.selectedBranchId &&
		inspector === state.studioSelection.inspector &&
		secondaryInspector === state.studioSelection.secondaryInspector &&
		highlightedBranchId === state.studioSelection.highlightedBranchId &&
		hoveredSceneId === state.studioSelection.hoveredSceneId &&
		selectedPathId === state.editorGraph.selectedPathId
	)
		return state;
	return {
		...state,
		editorGraph: { ...state.editorGraph, selectedPathId },
		studioSelection: {
			...state.studioSelection,
			highlightedBranchId,
			hoveredSceneId,
			inspector,
			secondaryInspector,
			selectedBranchId,
			selectedSceneId,
		},
	};
}

function isInspectorTargetAvailable(
	target: TaleInspectorTarget | null,
	tale: Tale,
): boolean {
	if (!target) return false;
	if (
		"sceneId" in target &&
		target.sceneId &&
		!tale.indexMap.scenesById[target.sceneId]
	)
		return false;
	if (target.type === "scene")
		return Boolean(tale.indexMap.scenesById[target.id]);
	if (target.type === "frame")
		return Boolean(tale.indexMap.framesById[target.id]);
	if (target.type === "element")
		return Boolean(tale.indexMap.elementsById[target.id]);
	return Boolean(tale.indexMap.keyframesById[target.id]);
}

function StudioDialog({
	dialog,
	onClose,
}: {
	dialog: StudioDialog | null;
	onClose: () => void;
}): React.JSX.Element | null {
	const [value, setValue] = useState("");
	useEffect(
		() =>
			setValue(dialog?.kind === "prompt" ? (dialog.defaultValue ?? "") : ""),
		[dialog],
	);
	if (!dialog) return null;
	const submit = () => {
		if (dialog.kind === "confirm") dialog.onConfirm();
		if (dialog.kind === "prompt") dialog.onConfirm(value.trim());
		onClose();
	};
	return (
		<Dialog
			open={Boolean(dialog)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent
				data-reader-component="StudioDialog"
				data-reader-role="studio-dialog"
				data-studio-component="StudioDialog"
				data-studio-role="studio-dialog"
				className="max-w-md p-5 shadow-[9px_9px_0_var(--comic-teal)]"
				overlayClassName="z-[1100]"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle className="text-xl">{dialog.title}</DialogTitle>
					{dialog.description ? (
						<DialogDescription>{dialog.description}</DialogDescription>
					) : null}
				</DialogHeader>
				{dialog.kind === "prompt" ? (
					<Field label={dialog.label ?? "Name"}>
						<Input
							aria-label={dialog.label ?? "Name"}
							density="compact"
							value={value}
							onChange={(event) => setValue(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && value.trim()) submit();
							}}
						/>
					</Field>
				) : null}
				<DialogFooter>
					<Button size="sm" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						disabled={dialog.kind === "prompt" && !value.trim()}
						size="sm"
						onClick={submit}
					>
						{dialog.kind === "notice"
							? "Close"
							: dialog.kind === "confirm"
								? (dialog.confirmLabel ?? "Confirm")
								: "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Reads the active Tale Studio concerns.
 *
 * @returns Studio store, toolbar state, and document actions.
 */
export function useTaleStudio(): TaleStudioContextValue {
	const value = useContext(TaleStudioContext);
	if (!value) {
		throw new Error("useTaleStudio must be used inside TaleStudioProvider.");
	}
	return value;
}

function getStudioDirtyStatus({
	dirty,
	saveFailed,
	savePending,
	savedNoticeVisible,
}: {
	dirty: boolean;
	saveFailed: boolean;
	savePending: boolean;
	savedNoticeVisible: boolean;
}): string {
	if (savePending) return "Saving";
	if (saveFailed) return "Save failed";
	if (dirty) return "Save";
	return savedNoticeVisible ? "Saved" : "Save";
}
