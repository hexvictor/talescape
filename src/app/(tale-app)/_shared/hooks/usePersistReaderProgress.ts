"use client";

import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useTaleReaderStoreInstance } from "../contexts/TaleReaderStoreContext";
import type { SavedReaderProgress } from "../types";

const progressPersistenceDelayMs = 2000;

/**
 * Checks whether a progress object can be persisted to the database.
 *
 * @param progress - The current reader progress.
 * @returns True when the progress row has database identity values.
 *
 * @example
 * const canPersist = isDatabaseBackedProgress(progress);
 */
function isDatabaseBackedProgress(
	progress: SavedReaderProgress,
): progress is SavedReaderProgress & { id: number; taleId: number } {
	return typeof progress.id === "number" && typeof progress.taleId === "number";
}

/**
 * Persists reader progress to the database without subscribing React renders to scroll.
 *
 * @returns Nothing. The hook wires a debounced store subscription.
 *
 * @example
 * usePersistReaderProgress();
 */
export function usePersistReaderProgress(): void {
	const store = useTaleReaderStoreInstance();
	const mutation = api.taleReader.progress.update.useMutation();
	const inFlightRef = useRef(false);
	const lastFingerprintRef = useRef("");
	const latestProgressRef = useRef<SavedReaderProgress | null>(null);
	const mutationRef = useRef(mutation.mutateAsync);
	const timerRef = useRef<number | null>(null);
	mutationRef.current = mutation.mutateAsync;

	useEffect(() => {
		const flush = async (): Promise<void> => {
			if (inFlightRef.current) return;
			const progress = latestProgressRef.current;
			const mutate = mutationRef.current;
			if (!progress || !mutate || !isDatabaseBackedProgress(progress)) return;
			const fingerprint = createProgressFingerprint(progress);
			if (fingerprint === lastFingerprintRef.current) return;

			inFlightRef.current = true;
			latestProgressRef.current = null;
			try {
				await mutate(progress);
				lastFingerprintRef.current = fingerprint;
			} catch {
				latestProgressRef.current ??= progress;
			} finally {
				inFlightRef.current = false;
				if (latestProgressRef.current) {
					timerRef.current = window.setTimeout(
						flush,
						progressPersistenceDelayMs,
					);
				}
			}
		};
		const schedule = (progress: SavedReaderProgress): void => {
			latestProgressRef.current = progress;
			window.clearTimeout(timerRef.current ?? undefined);
			timerRef.current = window.setTimeout(flush, progressPersistenceDelayMs);
		};
		const flushWhenHidden = (): void => {
			if (document.visibilityState === "hidden") void flush();
		};
		const unsubscribe = store.subscribe((state, previousState) => {
			const progress = state.progress.data;
			if (progress === previousState.progress.data) return;
			if (!isDatabaseBackedProgress(progress)) return;
			if (createProgressFingerprint(progress) === lastFingerprintRef.current) {
				return;
			}
			schedule(progress);
		});
		window.addEventListener("pagehide", flush);
		document.addEventListener("visibilitychange", flushWhenHidden);
		return () => {
			unsubscribe();
			window.removeEventListener("pagehide", flush);
			document.removeEventListener("visibilitychange", flushWhenHidden);
		};
	}, [store]);

	useEffect(() => {
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);
}

/**
 * Creates a timestamp-independent signature for persisted reader progress.
 *
 * @param progress - Reader progress snapshot.
 * @returns Stable semantic progress signature.
 */
function createProgressFingerprint(progress: SavedReaderProgress): string {
	return JSON.stringify({
		blockId: progress.blockId,
		committedAnimationIds: progress.committedAnimationIds,
		innerProgress: progress.innerProgress,
		seenBlockIds: progress.seenBlockIds,
		seenEntryIds: progress.seenEntryIds,
		seenPageIds: progress.seenPageIds,
		seenPartIds: progress.seenPartIds,
		selectedBranchIds: progress.selectedBranchIds,
	});
}
