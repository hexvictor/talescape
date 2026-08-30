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
import { api } from "~/trpc/react";
import { StudioBlock } from "../components/TaleStudioRenderer/StudioBlock";
import { StudioDebugHeaderActions } from "../components/TaleStudioRenderer/StudioDebugHeaderActions";
import { StudioFragment } from "../components/TaleStudioRenderer/StudioFragment";
import { StudioNodeOverlay } from "../components/TaleStudioRenderer/StudioNodeOverlay";
import { StudioTextFragmentContent } from "../components/TaleStudioRenderer/StudioTextFragmentContent";
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

type TaleStudioContextValue = {
	document: TaleStudioDocument;
	store: StoreApi<TaleStudioState>;
	toolbar: TaleStudioToolbar;
};

const TaleStudioContext = createContext<TaleStudioContextValue | null>(null);

const studioRenderers = {
	Block: StudioBlock,
	DebugHeaderActions: StudioDebugHeaderActions,
	Fragment: StudioFragment,
	NodeOverlay: StudioNodeOverlay,
	TextFragmentContent: StudioTextFragmentContent,
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
	const [savedNoticeVisible, setSavedNoticeVisible] = useState(false);
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
				window.alert(
					error instanceof Error
						? error.message
						: "The selected file could not be imported.",
				);
			}
		},
		[setTale],
	);

	const save = useCallback((): void => {
		saveDraft(createTaleStudioDraftPayload(tale), {
			onSuccess: () => {
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
	}, [markSaved, saveDraft, tale]);

	const dirtyStatus = getStudioDirtyStatus({
		dirty,
		saveFailed,
		savePending,
		savedNoticeVisible,
	});
	const value = useMemo<TaleStudioContextValue>(
		() => ({
			document: { exportTale, openImportDialog },
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
			closeSettings,
			dirtyStatus,
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
			</TaleRenderContext.Provider>
		</TaleStudioContext.Provider>
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
