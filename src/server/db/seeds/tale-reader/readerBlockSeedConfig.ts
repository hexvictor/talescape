import type {
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import type { ReaderPageBlueprint } from "./readerStoryBlueprint";

const imageBackgrounds = [
	"/reader-demo/thornwick-town.svg",
	"/reader-demo/thornwick-market.svg",
	"/reader-demo/thornwick-church.svg",
	"/reader-demo/thornwick-crypt.svg",
	"/reader-demo/thornwick-woods.svg",
] as const;

const colorBackgrounds = [
	"linear-gradient(145deg, #130f18 0%, #302334 55%, #0b1016 100%)",
	"linear-gradient(135deg, #101b1c 0%, #173638 52%, #080d11 100%)",
	"linear-gradient(150deg, #21170f 0%, #4a2e1c 48%, #0f0c0b 100%)",
	"linear-gradient(135deg, #111827 0%, #26364f 55%, #080a0f 100%)",
] as const;

export type ReaderBlockSeedConfig = {
	readingConfig: ReadingConfig;
	sizeConfig: ReaderSizeConfig;
	sizeMode: ReaderSizeMode;
	styleConfig: ReaderStyleConfig;
	transitionConfig: TransitionConfig;
};

/**
 * Creates direct block configuration for one page and route.
 *
 * @param page - Authored page definition.
 * @param branchName - Database branch name.
 * @returns Persistable block configuration without preset references.
 */
export function createReaderBlockSeedConfig(
	page: ReaderPageBlueprint,
	branchName: string,
): ReaderBlockSeedConfig {
	const contentSized = isContentSizedPage(page);
	const direction = contentSized ? "down" : directionForPage(page.order);
	return {
		readingConfig: {
			animationConfig: {
				entering: { tracks: [] },
				leaving: { tracks: [] },
				scrolling: { tracks: [] },
			},
			cameraPath: { direction, mode: "straight" },
			pauses: {
				atEnd: page.order % 7 === 0 ? 180 : 0,
				atStart: page.order % 11 === 0 ? 120 : 0,
			},
			readingLength: contentSized ? null : 720,
			readingLengthMode: contentSized ? "content" : "manual",
		},
		sizeConfig: contentSized
			? {
					minHeight: { unit: "viewport", value: 1 },
					minWidth: { unit: "viewport", value: 1 },
				}
			: {
					height: { unit: "viewport", value: 1 },
					width: { unit: "viewport", value: 1 },
				},
		sizeMode: contentSized ? "contentResponsive" : "fixed",
		styleConfig: styleForPage(page, branchName),
		transitionConfig: {
			animationConfig: {
				entering: { tracks: [] },
				leaving: { tracks: [] },
			},
			enteringLength: 760,
			flow: {
				direction,
				spacing: { unit: "px", value: 0 },
				type: "linear",
			},
			leavingLength: 760,
		},
	};
}

/**
 * Determines whether page content should control block height.
 *
 * @param page - Authored page definition.
 * @returns True for long chapter text pages.
 */
export function isContentSizedPage(page: ReaderPageBlueprint): boolean {
	return page.isPaginated && page.localOrder % 2 === 0;
}

/**
 * Selects a mostly right/down transition direction with occasional reverse travel.
 *
 * @param order - Tale-wide page order.
 * @returns Transition direction.
 */
function directionForPage(order: number): "down" | "left" | "right" | "up" {
	if (order > 0 && order % 17 === 0) return "up";
	if (order > 0 && order % 11 === 0) return "left";
	if (order % 3 === 0) return "down";
	return "right";
}

/**
 * Creates page-specific block background and foreground styling.
 *
 * @param page - Authored page definition.
 * @param branchName - Current branch name.
 * @returns Reader block style.
 */
function styleForPage(
	page: ReaderPageBlueprint,
	branchName: string,
): ReaderStyleConfig {
	const usesImage =
		page.type !== "chapter" || page.order % 6 === 0 || page.localOrder === 1;
	const branchTint =
		branchName === "lantern"
			? "rgba(214, 164, 84, 0.18)"
			: branchName === "river"
				? "rgba(65, 157, 190, 0.18)"
				: "rgba(255, 255, 255, 0.04)";
	return {
		backgroundCss: usesImage
			? `linear-gradient(135deg, rgba(5,7,10,0.9), ${branchTint}), url(${imageBackgrounds[page.order % imageBackgrounds.length]}) center / cover no-repeat`
			: colorBackgrounds[page.order % colorBackgrounds.length],
		color: "#f5f1e8",
		minHeight: "100%",
		overflow: "visible",
		width: "100%",
	};
}
