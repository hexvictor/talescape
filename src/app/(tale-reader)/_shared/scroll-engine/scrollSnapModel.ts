import type { SnapPoint } from "../types";
import { NEW_READER_INPUT_SETTINGS } from "./readerInputSettings";

export type ReaderSnapModel = ReturnType<typeof createReaderSnapModel>;
export type ScrollDirection = -1 | 1;

export function createReaderSnapModel(points: SnapPoint[]) {
	const sorted = [...points].sort((left, right) => left.scroll - right.scroll);

	const getNearbyTarget = (scroll: number, direction: ScrollDirection) => {
		let low = 0;
		let high = sorted.length;
		while (low < high) {
			const middle = (low + high) >> 1;
			if ((sorted[middle]?.scroll ?? Number.POSITIVE_INFINITY) < scroll) {
				low = middle + 1;
			} else {
				high = middle;
			}
		}
		const nearest =
			direction === 1 ? (sorted[low] ?? null) : (sorted[low - 1] ?? null);
		if (
			!nearest ||
			Math.abs(nearest.scroll - scroll) >
				NEW_READER_INPUT_SETTINGS.snapCapturePx
		) {
			return null;
		}
		return nearest.scroll;
	};

	return { getNearbyTarget };
}
