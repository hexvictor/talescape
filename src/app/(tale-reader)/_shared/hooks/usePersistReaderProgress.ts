"use client";

import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useReaderStoreInstance } from "../contexts/ReaderStoreContext";
import type { SavedReaderProgress } from "../types";

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
	const store = useReaderStoreInstance();
	const lastPayloadRef = useRef<string>("");
	const timerRef = useRef<number | null>(null);
	const mutation = api.taleReader.progress.update.useMutation();

	useEffect(() => {
		return store.subscribe((state, previousState) => {
			const progress = state.progress.data;
			if (progress === previousState.progress.data) return;
			if (!isDatabaseBackedProgress(progress)) return;

			const payload = JSON.stringify(progress);
			if (payload === lastPayloadRef.current) return;

			if (timerRef.current) window.clearTimeout(timerRef.current);
			timerRef.current = window.setTimeout(() => {
				lastPayloadRef.current = payload;
				mutation.mutate(progress);
			}, 900);
		});
	}, [mutation, store]);

	useEffect(() => {
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);
}
