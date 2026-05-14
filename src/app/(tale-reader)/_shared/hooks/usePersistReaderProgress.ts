"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function usePersistReaderProgress() {
	const { isLoaded, isSignedIn } = useAuth();

	const progress = useReaderStore((s) => s.progress.data);
	const progressTrackingPaused = useReaderStore(
		(s) => s.progress.isTrackingPaused,
	);
	const setProgressSaving = useReaderStore((s) => s.progress.setIsSaving);

	const { mutateAsync } = api.taleReader.progress.update.useMutation();

	const lastSavedUpdatedAtRef = useRef<string | null>(null);
	const hasSeededInitialProgressRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	if (!hasSeededInitialProgressRef.current && progress?.updatedAt) {
		hasSeededInitialProgressRef.current = true;
		lastSavedUpdatedAtRef.current = getProgressUpdatedAtKey(progress.updatedAt);
	}

	useEffect(() => {
		if (!isLoaded) return;
		if (!progress?.updatedAt) return;

		const updatedAtKey = getProgressUpdatedAtKey(progress.updatedAt);

		if (progressTrackingPaused) return;

		if (updatedAtKey === lastSavedUpdatedAtRef.current) return;

		if (timerRef.current) clearTimeout(timerRef.current);

		timerRef.current = setTimeout(async () => {
			setProgressSaving(true);

			try {
				if (!isSignedIn) {
					const key = `tale_progress_${progress.taleId}`;
					localStorage.setItem(key, JSON.stringify(progress));
				} else {
					await mutateAsync({
						id: progress.id,
						taleId: progress.taleId,
						updatedAt: new Date(progress.updatedAt),
						seenBlockIds: progress.seenBlockIds,
						lastBlockId: progress.lastBlockId,
						maxBlockIdReached: progress.maxBlockIdReached,
						activePathIds: progress.activePathIds,
						seenPathIds: progress.seenPathIds,
						seenBlockProgress: progress.seenBlockProgress,
						maxReadProgress: progress.maxReadProgress,
					});
				}

				lastSavedUpdatedAtRef.current = updatedAtKey;
			} catch (error) {
				console.error("[PersistReaderProgress] save failed", error);
			} finally {
				setProgressSaving(false);
			}
		}, 400);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = null;
		};
	}, [
		progress,
		progressTrackingPaused,
		isLoaded,
		isSignedIn,
		mutateAsync,
		setProgressSaving,
	]);
}

function getProgressUpdatedAtKey(updatedAt: Date | string) {
	return updatedAt instanceof Date
		? updatedAt.toISOString()
		: new Date(updatedAt).toISOString();
}
