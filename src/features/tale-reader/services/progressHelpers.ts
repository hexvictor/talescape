import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createTaleReaderStore";

export const debounceProgressUpdate = (
	store: StoreApi<TaleReaderState>,
	blockId: number,
	updateFn: (blockId: number) => void,
) => {
	const {
		progressDebounceTimer,
		setProgressDebounceTimer,
		setLastQueuedBlockId,
	} = store.getState();

	setLastQueuedBlockId(blockId);

	if (progressDebounceTimer) {
		return;
	}

	const timer = setTimeout(() => {
		const { lastQueuedBlockId } = store.getState();

		if (lastQueuedBlockId != null) {
			updateFn(lastQueuedBlockId);
		}

		store.setState({
			progressDebounceTimer: null,
			lastQueuedBlockId: null,
		});
	}, 2000);

	setProgressDebounceTimer(timer);
};
