import type {
	AnimationSelection,
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import type { ReaderPageBlueprint } from "./readerStoryBlueprint";

const imageBackgrounds = [
	"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=80",
	"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80",
	"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
	"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=80",
] as const;

const colorBackgrounds = [
	"#17121b",
	"#102326",
	"#291d14",
	"#111827",
	"#25152a",
] as const;

export type ReaderBlockSeedConfig = {
	readingConfig: ReadingConfig;
	sizeConfig: ReaderSizeConfig;
	sizeMode: ReaderSizeMode;
	styleConfig: ReaderStyleConfig;
	transitionConfig: TransitionConfig;
};

/**
 * Creates block configuration from one authored page layout.
 *
 * @param page - Authored page definition.
 * @param branchName - Owning database branch name.
 * @returns Persistable direct block configuration.
 */
export function createReaderBlockSeedConfig(
	page: ReaderPageBlueprint,
	branchName: string,
): ReaderBlockSeedConfig {
	const fullscreen = page.layout === "fullscreen";
	const horizontal = page.layout === "horizontal";
	const stack = fullscreen && !page.isChoice && page.order % 4 === 0;
	return {
		readingConfig: {
			animationConfig: {
				ambient: { cycleDurationMs: 2400, tracks: [] },
				scrolling: { tracks: [] },
			},
			cameraPath: fullscreen
				? { mode: "auto" }
				: horizontal
					? {
							direction: page.readingDirection,
							mode: "straight",
						}
					: { direction: page.readingDirection, mode: "straight" },
			pauses: { atEnd: 0, atStart: 0 },
			readingLength: fullscreen ? 800 : null,
			readingLengthMode: fullscreen ? "manual" : "content",
		},
		sizeConfig: getSizeConfig(page),
		sizeMode: fullscreen ? "fixed" : "contentResponsive",
		styleConfig: styleForPage(page, branchName),
		transitionConfig: {
			animationConfig: stack
				? {
						entering: fade(0, 1),
						leaving: fade(1, 0),
					}
				: {
						entering: { tracks: [] },
						leaving: { tracks: [] },
					},
			enteringLength: null,
			flow: stack
				? { type: "stack" }
				: {
						direction: page.readingDirection,
						placement: "blockEdge",
						spacing: { unit: "px", value: 0 },
						type: "linear",
					},
			leavingLength: null,
		},
	};
}

/**
 * Creates dimensions for fullscreen and content-responsive pages.
 *
 * @param page - Authored page definition.
 * @returns Reader block size configuration.
 */
function getSizeConfig(page: ReaderPageBlueprint): ReaderSizeConfig {
	if (page.layout === "fullscreen") {
		return {
			height: { unit: "viewport", value: 1 },
			width: { unit: "viewport", value: 1 },
		};
	}
	if (page.layout === "horizontal") {
		return {
			maxHeight: { unit: "viewport", value: 1 },
			minHeight: { unit: "viewport", value: 1 },
			minWidth: { unit: "viewport", value: 1 },
		};
	}
	return {
		maxWidth: { unit: "viewport", value: 1 },
		minHeight: { unit: "viewport", value: 1 },
		minWidth: { unit: "viewport", value: 1 },
	};
}

/**
 * Creates a fade animation selection.
 *
 * @param from - Initial opacity.
 * @param to - Final opacity.
 * @returns Opacity animation selection.
 */
function fade(from: number, to: number): AnimationSelection {
	return {
		tracks: [{ end: 1, from, property: "opacity", start: 0, to }],
	};
}

/**
 * Creates page-specific block background styling.
 *
 * @param page - Authored page definition.
 * @param branchName - Current branch name.
 * @returns Reader block style.
 */
function styleForPage(
	page: ReaderPageBlueprint,
	branchName: string,
): ReaderStyleConfig {
	const image = imageBackgrounds[page.order % imageBackgrounds.length];
	const color = colorBackgrounds[page.order % colorBackgrounds.length];
	const backgroundCss =
		page.layout === "fullscreen"
			? `linear-gradient(135deg, rgba(5,7,10,0.64), rgba(5,7,10,0.82)), url(${image}) center / cover no-repeat`
			: `linear-gradient(145deg, ${color}, #090b10)`;
	return {
		backgroundCss,
		color: branchName === "main" ? "#f5f1e8" : "#fff8e8",
		minHeight: "100%",
		overflow: "visible",
		width: "100%",
	};
}
