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
	let storyFill: HTMLElement | null = null;
	let storyLabel: HTMLElement | null = null;
	let innerLabel: HTMLElement | null = null;
	let innerFill: HTMLElement | null = null;
	let previousStoryLabel = "";
	let previousInnerLabel = "";
	let previousStoryScale = "";
	let previousInnerScale = "";

	return (
		scroll: number,
		segment: TimelineSegment,
		segmentProgress: number,
	): void => {
		if (!storyFill?.isConnected) {
			storyFill =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-story-progress-fill='true']",
				) ?? null;
			previousStoryScale = "";
		}
		if (!storyLabel?.isConnected) {
			storyLabel =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-story-progress='true']",
				) ?? null;
			previousStoryLabel = "";
		}
		if (!innerLabel?.isConnected) {
			innerLabel =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-inner-progress='true']",
				) ?? null;
			previousInnerLabel = "";
		}
		if (!innerFill?.isConnected) {
			innerFill =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-inner-progress-fill='true']",
				) ?? null;
			previousInnerScale = "";
		}
		const storyProgress = clamp(scroll / compiled.totalScroll, 0, 1);
		const storyScale = `scaleX(${storyProgress})`;
		if (storyFill && storyScale !== previousStoryScale) {
			storyFill.style.transform = storyScale;
			previousStoryScale = storyScale;
		}
		if (storyLabel) {
			const label = `Story ${Math.round(storyProgress * 100)}%`;
			if (label !== previousStoryLabel) {
				storyLabel.textContent = label;
				previousStoryLabel = label;
			}
		}
		if (!innerLabel) return;

		let label: string;
		let innerScale: string;
		if (segment.type === "reading") {
			label = `Page ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			innerScale = `scaleX(${segmentProgress})`;
		} else if (segment.type === "pause") {
			label = `${segment.pauseType === "start" ? "Enter pause" : "Leave pause"} ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			innerScale = `scaleX(${segmentProgress})`;
		} else {
			label = `Transition ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			innerScale = "scaleX(0)";
		}
		if (label !== previousInnerLabel) {
			innerLabel.textContent = label;
			previousInnerLabel = label;
		}
		if (innerFill && innerScale !== previousInnerScale) {
			innerFill.style.transform = innerScale;
			previousInnerScale = innerScale;
		}
	};
}
