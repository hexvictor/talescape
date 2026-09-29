"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useTaleAppStoreInstance } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { Tale } from "~/app/(tale-app)/_shared/types";

type Recovery = { version: 1; base: Tale; snapshots: Tale[]; cursor: number };
const MAX_LOCAL_HISTORY_SNAPSHOTS = 12;

/** Local recovery is separate from the explicit database save operation. */
export function useStudioDraftRecovery() {
	const app = useTaleAppStoreInstance();
	const baseline = useRef(app.getState().document.tale);
	const { user } = useUser();
	const userId = user?.id;
	const history = useRef<Recovery | null>(null);
	const replaying = useRef(false);
	const [revision, refresh] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [conflict, setConflict] = useState(false);
	const taleId = app.getState().document.tale.id;
	useEffect(() => {
		if (!userId) return;
		setConflict(false);
		const key = `talescape:studio-draft:v1:${userId}:${taleId}`;
		const base = baseline.current;
		history.current = { version: 1, base, snapshots: [base], cursor: 0 };
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				const cached = JSON.parse(raw) as Recovery;
				if (
					cached.version !== 1 ||
					cached.base.id !== taleId ||
					!Array.isArray(cached.snapshots) ||
					!cached.snapshots[cached.cursor]?.indexMap
				)
					throw new Error("Invalid draft recovery data");
				if (JSON.stringify(cached.base) === JSON.stringify(base)) {
					history.current = cached;
					const restored = cached.snapshots[cached.cursor];
					if (restored)
						app
							.getState()
							.document.setTale(restored, { reason: "draft-recovered" });
				} else {
					setConflict(true);
					setError(
						"A local draft was preserved, but the saved tale changed. Automatic recovery is paused.",
					);
					return;
				}
			}
		} catch {
			setError(
				"Browser draft recovery is unavailable. The Save button still works.",
			);
		}
		refresh((value) => value + 1);
		return app.subscribe((state, previous) => {
			if (state.document.tale === previous.document.tale) return;
			const current = history.current;
			if (!current) return;
			if (!state.document.dirty) {
				baseline.current = state.document.tale;
				history.current = {
					version: 1,
					base: state.document.tale,
					snapshots: [state.document.tale],
					cursor: 0,
				};
			} else if (!replaying.current) {
				current.snapshots = [
					...current.snapshots.slice(0, current.cursor + 1),
					state.document.tale,
				].slice(-MAX_LOCAL_HISTORY_SNAPSHOTS);
				current.cursor = current.snapshots.length - 1;
			}
			try {
				if (!state.document.dirty) localStorage.removeItem(key);
				else persistRecovery(key, history.current);
				setError(null);
			} catch {
				setError(
					"Browser draft backup is unavailable. The Save button still works.",
				);
			}
			refresh((value) => value + 1);
		});
	}, [app, taleId, userId]);
	const restore = (cursor: number) => {
		const current = history.current;
		const snapshot = current?.snapshots[cursor];
		if (!current || !snapshot || conflict) return;
		current.cursor = cursor;
		replaying.current = true;
		try {
			app
				.getState()
				.document.setTale(snapshot, { reason: "draft-history-restored" });
		} finally {
			replaying.current = false;
		}
	};
	return {
		revision,
		error,
		canUndo: !conflict && (history.current?.cursor ?? 0) > 0,
		canRedo:
			!conflict &&
			!!history.current &&
			history.current.cursor < history.current.snapshots.length - 1,
		undo: () => restore((history.current?.cursor ?? 0) - 1),
		redo: () => restore((history.current?.cursor ?? 0) + 1),
		discard: () => {
			if (!history.current || conflict) return;
			app.getState().document.setTale(history.current.base, {
				markDirty: false,
				reason: "draft-discarded",
			});
		},
	};
}

function persistRecovery(key: string, recovery: Recovery | null): void {
	if (!recovery) return;
	const keepStart = Math.max(
		0,
		recovery.snapshots.length - MAX_LOCAL_HISTORY_SNAPSHOTS,
	);
	let next: Recovery = {
		...recovery,
		snapshots: recovery.snapshots.slice(keepStart),
		cursor: Math.max(
			0,
			Math.min(
				recovery.cursor - keepStart,
				Math.max(0, recovery.snapshots.length - keepStart - 1),
			),
		),
	};
	while (next.snapshots.length > 0) {
		try {
			localStorage.setItem(key, JSON.stringify(next));
			recovery.snapshots = next.snapshots;
			recovery.cursor = next.cursor;
			return;
		} catch (error) {
			if (next.snapshots.length === 1) throw error;
			next = {
				...next,
				snapshots: next.snapshots.slice(Math.ceil(next.snapshots.length / 2)),
			};
			next.cursor = next.snapshots.length - 1;
		}
	}
}
