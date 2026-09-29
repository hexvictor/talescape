"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import type { StoreApi } from "zustand/vanilla";
import type { EditorPathType } from "../store/editorGraphTypes";
import type { TaleStudioState } from "../store/taleStudioStore";

/** Persist workspace data while keeping the live store's action functions. */
export function useStudioWorkspacePersistence(
	store: StoreApi<TaleStudioState>,
	taleId: number,
): void {
	const { user } = useUser();
	const userId = user?.id;
	useEffect(() => {
		if (!userId) return;
		const key = `talescape:studio-workspace:v1:${userId}:${taleId}`;
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				const saved = JSON.parse(raw);
				store.setState((current) => {
					const next = { ...current };
					for (const name of [
						"editorLayout",
						"editorGraph",
						"studioSelection",
					] as const) {
						const slice = { ...current[name] };
						for (const field of Object.keys(slice)) {
							const original = Reflect.get(slice, field);
							const value = saved?.[name]?.[field];
							if (
								typeof original !== "function" &&
								value !== undefined &&
								(original === null || typeof original === typeof value)
							) {
								Reflect.set(slice, field, value);
							}
						}
						if (name === "editorGraph") {
							Reflect.set(
								slice,
								"collapsedBranchIds",
								toStringSet(saved.editorGraph?.collapsedBranchIds),
							);
							Reflect.set(
								slice,
								"expandedBranchIds",
								toStringSet(saved.editorGraph?.expandedBranchIds),
							);
							Reflect.set(
								slice,
								"visiblePathTypes",
								toStringSet<EditorPathType>(
									saved.editorGraph?.visiblePathTypes,
									current.editorGraph.visiblePathTypes,
								),
							);
						}
						Object.assign(next, { [name]: slice });
					}
					return next;
				});
			}
		} catch {
			// An unavailable or obsolete cache must not prevent opening Studio.
		}
		return store.subscribe((state) => {
			try {
				const selection = state.studioSelection;
				const withTab = (target: typeof selection.inspector) =>
					target
						? {
								...target,
								initialTab:
									selection.inspectorTabMemory[target.type] ??
									("initialTab" in target ? target.initialTab : undefined),
							}
						: null;
				localStorage.setItem(
					key,
					JSON.stringify({
						editorGraph: {
							...state.editorGraph,
							collapsedBranchIds: [...state.editorGraph.collapsedBranchIds],
							expandedBranchIds: [...state.editorGraph.expandedBranchIds],
							visiblePathTypes: [...state.editorGraph.visiblePathTypes],
						},
						editorLayout: state.editorLayout,
						studioSelection: {
							...selection,
							inspector: withTab(selection.inspector),
							secondaryInspector: withTab(selection.secondaryInspector),
						},
					}),
				);
			} catch {
				// Workspace caching is best-effort; document saving is independent.
			}
		});
	}, [store, taleId, userId]);
}

function toStringSet<T extends string>(
	value: unknown,
	fallback: Set<T> = new Set<T>(),
): Set<T> {
	if (value instanceof Set) return new Set([...value] as T[]);
	if (Array.isArray(value))
		return new Set(value.filter((item): item is T => typeof item === "string"));
	return new Set(fallback);
}
