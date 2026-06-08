import { clamp } from "../services/readerMath";
import type { CompiledReader, TimelineSegment } from "../types";

/**
 * Creates an imperative progress UI painter for the reader engine.
 *
 * @param progressRoot - DOM root containing progress indicators.
 * @param compiled - Compiled reader timeline.
 * @returns Function that paints story and segment progress without React state.
 *
 * @example
 * const paintProgress = createProgressPainter(root, compiled);
 */
export function createProgressPainter(
	progressRoot: HTMLElement | null,
	compiled: CompiledReader,
) {
	const storyFill = progressRoot?.querySelector<HTMLElement>(
		"[data-reader-story-progress-fill='true']",
	);
	const storyLabel = progressRoot?.querySelector<HTMLElement>(
		"[data-reader-story-progress='true']",
	);
	const innerLabel = progressRoot?.querySelector<HTMLElement>(
		"[data-reader-inner-progress='true']",
	);
	const innerFill = progressRoot?.querySelector<HTMLElement>(
		"[data-reader-inner-progress-fill='true']",
	);

	return (
		scroll: number,
		segment: TimelineSegment,
		segmentProgress: number,
	): void => {
		const storyProgress = clamp(scroll / compiled.totalScroll, 0, 1);
		if (storyFill) storyFill.style.transform = `scaleX(${storyProgress})`;
		if (storyLabel) {
			storyLabel.textContent = `Story ${Math.round(storyProgress * 100)}%`;
		}
		if (!innerLabel) return;

		if (segment.type === "reading") {
			innerLabel.textContent = `Page ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			if (innerFill) innerFill.style.transform = `scaleX(${segmentProgress})`;
			return;
		}
		if (segment.type === "pause") {
			innerLabel.textContent = `${segment.pauseType === "start" ? "Enter pause" : "Leave pause"} ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			if (innerFill) innerFill.style.transform = `scaleX(${segmentProgress})`;
			return;
		}
		innerLabel.textContent = `Transition ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
		if (innerFill) innerFill.style.transform = "scaleX(0)";
	};
}
