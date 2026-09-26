import type { TaleSceneResponsiveOverride } from "~/app/(tale-app)/_shared/types";
import type {
	AnimationSelection,
	Direction,
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import type { ReaderSceneBlueprint } from "./readerStoryBlueprint";

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

export type ReaderSceneSeedConfig = {
	readingConfig: ReadingConfig;
	responsiveConfig: Record<string, TaleSceneResponsiveOverride>;
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
export function createReaderSceneSeedConfig(
	page: ReaderSceneBlueprint,
	branchName: string,
): ReaderSceneSeedConfig {
	const panel = getScenePanelTile(page);
	return {
		readingConfig: {
			animationConfig: {
				ambient: { cycleDurationMs: 2400, tracks: [] },
				active: { tracks: [] },
			},
			cameraPath: panel.scrollable
				? { direction: page.readingDirection, mode: "straight" }
				: { mode: "auto" },
			pauses: { atEnd: 0, atStart: 0 },
			activeLength: panel.scrollable ? null : 560,
			activeLengthMode: panel.scrollable ? "content" : "manual",
		},
		responsiveConfig: createResponsiveConfig(page),
		sizeConfig: {
			height: { unit: "viewport", value: panel.height },
			width: { unit: "viewport", value: panel.width },
		},
		sizeMode: "fixed",
		styleConfig: styleForPage(page, branchName),
		transitionConfig: createTransitionConfig(panel),
	};
}

function getScenePanelTile(scene: ReaderSceneBlueprint): PanelTile {
	if (scene.layout === "single-horizontal") {
		return {
			...panel(2.4, 1, scene.readingDirection, "groupEdge"),
			scrollable: true,
		};
	}
	if (scene.layout === "single-vertical") {
		return {
			...panel(
				1,
				scene.order === 3 ? 3.2 : 1,
				scene.readingDirection,
				"groupEdge",
			),
			scrollable: scene.order === 3,
		};
	}
	return panel(1, 1, scene.readingDirection, "groupEdge");
}

/**
 * Creates dimensions for a seeded comic-panel tile.
 *
 * @param page - Authored page definition.
 * @returns Reader block size configuration.
 */
function getSizeConfig(panel: PanelTile): ReaderSizeConfig {
	if (panel.scrollable) {
		return {
			maxHeight: { unit: "viewport", value: panel.height },
			minHeight: { unit: "viewport", value: 1 },
			minWidth: { unit: "viewport", value: 1 },
		};
	}
	return {
		height: { unit: "viewport", value: panel.height },
		width: { unit: "viewport", value: panel.width },
	};
}

type PanelTile = {
	alignment: "center" | "end" | "start";
	direction: Direction;
	height: number;
	placement: "blockEdge" | "groupEdge";
	scrollable?: boolean;
	width: number;
};

const desktopPanels: readonly PanelTile[] = [
	panel(0.5, 0.5, "down", "groupEdge"),
	panel(0.5, 0.5, "right", "blockEdge"),
	panel(0.5, 0.5, "down", "groupEdge"),
	panel(0.5, 0.5, "right", "blockEdge"),
	panel(0.5, 0.5, "down", "groupEdge"),
	panel(0.5, 0.5, "right", "blockEdge"),
	{ ...panel(1, 1, "down", "groupEdge"), scrollable: true },
	panel(0.5, 1, "down", "groupEdge"),
	panel(0.5, 0.5, "right", "blockEdge"),
	panel(0.5, 0.5, "down", "blockEdge"),
	panel(0.5, 1, "down", "groupEdge"),
	panel(0.5, 1, "right", "blockEdge"),
	panel(1, 0.5, "down", "groupEdge"),
	panel(0.5, 0.5, "down", "groupEdge"),
	panel(0.5, 0.5, "right", "blockEdge"),
];

const tabletPortraitPanels: readonly PanelTile[] = [
	panel(1, 0.5, "down", "groupEdge"),
	panel(1, 0.5, "down", "blockEdge"),
	panel(0.5, 1, "down", "groupEdge"),
	panel(0.5, 1, "right", "blockEdge"),
	panel(1, 1, "down", "groupEdge"),
];

const tabletLandscapePanels: readonly PanelTile[] = [
	panel(0.5, 1, "down", "groupEdge"),
	panel(0.5, 1, "right", "blockEdge"),
	panel(1, 0.5, "down", "groupEdge"),
	panel(1, 0.5, "down", "blockEdge"),
	panel(1, 1, "down", "groupEdge"),
];

const mobilePortraitPanels: readonly PanelTile[] = [
	panel(1, 0.5, "down", "groupEdge"),
	panel(1, 0.5, "down", "blockEdge"),
	panel(1, 1, "down", "groupEdge"),
];

const mobileLandscapePanels: readonly PanelTile[] = [
	panel(0.5, 1, "down", "groupEdge"),
	panel(0.5, 1, "right", "blockEdge"),
	panel(1, 1, "down", "groupEdge"),
];

/** Returns the base desktop panel tile for a seeded page. */
export function getDesktopPanelTile(order: number): PanelTile {
	return desktopPanels[order % desktopPanels.length] as PanelTile;
}

/** Returns whether the seeded desktop panel needs compact content. */
export function isCompactSeedPanel(order: number): boolean {
	const tile = getDesktopPanelTile(order);
	return tile.width < 1 || tile.height < 1;
}

function panel(
	width: number,
	height: number,
	direction: Direction,
	placement: PanelTile["placement"],
): PanelTile {
	return { alignment: "start", direction, height, placement, width };
}

function getPanelTile(tiles: readonly PanelTile[], order: number): PanelTile {
	return tiles[order % tiles.length] as PanelTile;
}

function createTransitionConfig(panelTile: PanelTile): TransitionConfig {
	return {
		animationConfig: {
			intro: fade(0, 1),
			outro: { tracks: [] },
			previousVisible: { tracks: [] },
		},
		introLength: null,
		flow: {
			alignment: panelTile.alignment,
			direction: panelTile.direction,
			groupHorizontalAlignment: "start",
			placement: panelTile.placement,
			spacing: { unit: "px", value: 0 },
			type: "linear",
		},
		outroLength: null,
		previousScenesDuringEnter: "keep",
	};
}

function createResponsiveConfig(
	page: ReaderSceneBlueprint,
): Record<string, TaleSceneResponsiveOverride> {
	return {
		"mobile-landscape": createResponsiveOverride(
			panel(1, 1, "down", "groupEdge"),
		),
		"mobile-portrait": createResponsiveOverride(
			panel(1, 1, "down", "groupEdge"),
		),
		"tablet-landscape": createResponsiveOverride(
			getPanelTile(tabletLandscapePanels, page.order),
		),
		"tablet-portrait": createResponsiveOverride(
			getPanelTile(tabletPortraitPanels, page.order),
		),
	};
}

function createResponsiveOverride(
	panelTile: PanelTile,
): TaleSceneResponsiveOverride {
	return {
		size: {
			height: panelTile.height,
			heightUnit: "viewport",
			horizontalAlignment: "auto",
			mode: "manual",
			verticalAlignment: "auto",
			width: panelTile.width,
			widthUnit: "viewport",
		},
		transition: {
			animations: {
				intro: {
					animations: [
						{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
					],
				},
				outro: { animations: [] },
				previousVisible: { animations: [] },
			},
			introLength: null,
			flow: createTransitionConfig(panelTile).flow,
			outroLength: null,
			previousScenesDuringEnter: "keep",
			scrollLength: null,
		},
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
	page: ReaderSceneBlueprint,
	branchName: string,
): ReaderStyleConfig {
	const image = imageBackgrounds[page.order % imageBackgrounds.length];
	const color = colorBackgrounds[page.order % colorBackgrounds.length];
	const backgroundCss =
		page.layout === "single-horizontal" || page.layout === "single-vertical"
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
