import { normalizeBlockSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import type {
	RawTaleRecord,
	ReaderStyle,
	TaleBlock,
	TaleBlockResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import type {
	AmbientAnimationSelection as DbAmbientAnimationSelection,
	AnimationSelection as DbAnimationSelection,
	ReaderSizeConfig,
	ReaderSizeMode,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";
import { formatSize } from "./formatSize";

type RawBlockRow = {
	branchId?: number | null;
	description?: string | null;
	entryId?: number | null;
	fragmentIds?: number[];
	fragments?: { id: number }[];
	id: number;
	isChoiceBlock?: boolean;
	nodes?: { id: number }[];
	order?: number;
	pageId?: number | null;
	partId?: number | null;
	readingConfig?: {
		animationConfig?: {
			ambient?: DbAmbientAnimationSelection;
			scrolling?: DbAnimationSelection;
		};
		cameraPath?: TaleBlock["reading"]["cameraPath"];
		pauses?: TaleBlock["reading"]["pauses"];
		readingLength?: number | null;
		readingLengthMode?: TaleBlock["reading"]["readingLengthMode"];
	};
	sizeConfig?: ReaderSizeConfig;
	sizeMode?: ReaderSizeMode;
	styleConfig?: ReaderStyle | null;
	responsiveConfig?: Record<string, TaleBlockResponsiveOverride>;
	title?: string | null;
	transitionConfig?: TransitionConfig;
};

type BlockOwnership = {
	entryId: string;
	pageId: string;
	partId: string;
};

/**
 * Formats database block rows into the reader block model.
 *
 * @param rows - Block rows returned from the tale query.
 * @param pages - Already formatted pages used to derive narrative ownership.
 * @returns Reader blocks with page, entry, part, node, and animation metadata.
 *
 * @example
 * const blocks = formatBlocks(record.blocks, pages);
 */
export function formatBlocks(
	rows: unknown[],
	pages: RawTaleRecord["pages"],
): TaleBlock[] {
	const pagesById = new Map(pages.map((page) => [page.id, page]));
	return rows.map((row) => formatBlockRow(row as RawBlockRow, pagesById));
}

/**
 * Formats one database block row into the reader block model.
 *
 * @param block - Block row returned by the tale query.
 * @param pagesById - Formatted pages keyed by id for ownership fallback data.
 * @returns One formatted tale block.
 *
 * @example
 * const block = formatBlockRow(row, pagesById);
 */
function formatBlockRow(
	block: RawBlockRow,
	pagesById: Map<string, RawTaleRecord["pages"][number]>,
): TaleBlock {
	const page = pagesById.get(String(block.pageId ?? ""));
	const ownership = getBlockOwnership(block, page);

	return {
		branchId: String(block.branchId ?? ""),
		description: block.description ?? undefined,
		entryId: ownership.entryId,
		fragmentIds: getBlockFragmentIds(block),
		id: String(block.id),
		isChoiceBlock: block.isChoiceBlock ?? false,
		isPaginated: page?.isPaginated ?? true,
		nodeIds: block.nodes?.map((node) => String(node.id)) ?? [],
		order: block.order ?? 0,
		pageId: ownership.pageId,
		pageNumber: null,
		partId: ownership.partId,
		reading: formatReadingConfig(block),
		responsiveOverrides: block.responsiveConfig ?? undefined,
		size: formatSize(block.sizeMode, block.sizeConfig),
		snap: normalizeBlockSnapConfig(block.transitionConfig?.snap ?? true),
		style: block.styleConfig ?? undefined,
		title: block.title ?? `Block ${block.id}`,
		transition: formatTransitionConfig(block.transitionConfig),
	};
}

/**
 * Resolves the page, entry, and part ids owned by a block.
 *
 * @param block - Block row with optional direct ownership ids.
 * @param page - Formatted page fallback when older rows only provide page id.
 * @returns Direct reader ownership ids for the block.
 *
 * @example
 * const ownership = getBlockOwnership(block, page);
 */
function getBlockOwnership(
	block: RawBlockRow,
	page?: RawTaleRecord["pages"][number],
): BlockOwnership {
	return {
		entryId:
			block.entryId == null ? (page?.entryId ?? "") : String(block.entryId),
		pageId: String(block.pageId ?? ""),
		partId: block.partId == null ? (page?.partId ?? "") : String(block.partId),
	};
}

/**
 * Formats fragment relationship ids for one block.
 *
 * @param block - Block row with either denormalized fragment ids or relation rows.
 * @returns Fragment ids as reader string ids.
 *
 * @example
 * const fragmentIds = getBlockFragmentIds(block);
 */
function getBlockFragmentIds(block: RawBlockRow): string[] {
	return (
		block.fragmentIds?.map(String) ??
		block.fragments?.map((fragment) => String(fragment.id)) ??
		[]
	);
}

/**
 * Formats one block reading configuration.
 *
 * @param block - Block row containing the persisted reading config.
 * @returns Reader reading settings for the block.
 *
 * @example
 * const reading = formatReadingConfig(block);
 */
function formatReadingConfig(block: RawBlockRow): TaleBlock["reading"] {
	return {
		animations: {
			ambient: {
				...formatAnimationSelection(
					block.readingConfig?.animationConfig?.ambient,
				),
				cycleDurationMs:
					block.readingConfig?.animationConfig?.ambient?.cycleDurationMs ??
					2400,
				playback:
					block.readingConfig?.animationConfig?.ambient?.playback ??
					"alternate",
			},
			scrolling: formatAnimationSelection(
				block.readingConfig?.animationConfig?.scrolling,
			),
		},
		cameraPath: normalizeCameraPath(block.readingConfig?.cameraPath),
		pauses: block.readingConfig?.pauses,
		readingLength: block.readingConfig?.readingLength ?? null,
		readingLengthMode:
			block.readingConfig?.readingLengthMode ??
			(block.readingConfig?.readingLength == null ? "content" : "manual"),
	};
}

/**
 * Formats one block transition configuration.
 *
 * @param transition - Persisted transition config from the database row.
 * @returns Reader transition settings for the block.
 *
 * @example
 * const transition = formatTransitionConfig(block.transitionConfig);
 */
function formatTransitionConfig(
	transition?: TransitionConfig,
): TaleBlock["transition"] {
	return {
		animations: {
			entering: formatAnimationSelection(transition?.animationConfig.entering),
			leaving: formatAnimationSelection(transition?.animationConfig.leaving),
			previousVisible: formatAnimationSelection(
				transition?.animationConfig.previousVisible,
			),
		},
		enteringLength: transition?.enteringLength ?? null,
		flow: normalizeFlow(transition?.flow),
		leavingLength: transition?.leavingLength ?? null,
		previousBlocksDuringEnter: transition?.previousBlocksDuringEnter ?? "keep",
		scrollLength: null,
	};
}

/**
 * Normalizes a persisted transition flow.
 *
 * @param flow - Optional persisted block flow.
 * @returns Reader-compatible block flow.
 *
 * @example
 * const flow = normalizeFlow(row.transitionConfig?.flow);
 */
function normalizeFlow(
	flow: TransitionConfig["flow"] | undefined,
): TaleBlock["transition"]["flow"] {
	return flow?.type === "stack"
		? flow
		: {
				groupHorizontalAlignment: flow?.groupHorizontalAlignment,
				alignment: flow?.alignment,
				direction: flow?.direction ?? "down",
				placement: flow?.placement,
				spacing: flow?.spacing,
				type: "linear",
			};
}

/**
 * Normalizes persisted camera path names into the frontend reader naming.
 *
 * @param cameraPath - Camera path config from the block reading config.
 * @returns The frontend camera path config.
 *
 * @example
 * const path = normalizeCameraPath(row.readingConfig.cameraPath);
 */
function normalizeCameraPath(
	cameraPath: unknown,
): TaleBlock["reading"]["cameraPath"] {
	if (
		typeof cameraPath === "object" &&
		cameraPath !== null &&
		"mode" in cameraPath &&
		cameraPath.mode === "reverseFlow"
	) {
		return { mode: "reverse-flow" };
	}
	return cameraPath as TaleBlock["reading"]["cameraPath"];
}
