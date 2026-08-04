import type { PublicUserInfo } from "~/server/db/data/users/queries";
import type { TaleSchema } from "~/server/db/schema";
import type { Book } from "~/server/db/schema/library/books";
import type { EntryType } from "~/server/db/types/tale-reader/entry";

export type Direction =
	| "down"
	| "down-left"
	| "down-right"
	| "left"
	| "right"
	| "up"
	| "up-left"
	| "up-right";

export type StackPlacementPosition = "center" | "end" | "start";

export type BlockFlow =
	| {
			alignment?: "center" | "end" | "start";
			direction: Direction;
			groupHorizontalAlignment?: "center" | "end" | "start";
			placement?:
				| "blockEdge"
				| "blockEdgeWithViewportAlignment"
				| "cameraEdge"
				| "groupEdge";
			spacing?: ReaderSpacing;
			type: "linear";
	  }
	| {
			alignment?: "center" | "end" | "start";
			horizontalPosition?: number;
			horizontalPlacement?: StackPlacementPosition;
			placement?: "blockEdge" | "blockEdgeWithViewportAlignment" | "cameraEdge";
			type: "stack";
			verticalPosition?: number;
			verticalPlacement?: StackPlacementPosition;
	  };

export type FirstBlockTransitionMode = "fromPlacement" | "inPlace";

export type PreviousBlocksDuringEnter =
	| "fadeActivePrevious"
	| "fadeAllVisiblePrevious"
	| "customAllVisiblePrevious"
	| "keep";

export type HorizontalCameraFraming = "auto" | "center" | "left" | "right";

export type VerticalCameraFraming = "auto" | "bottom" | "center" | "top";

export type ReaderSpacing = {
	unit: "px" | "viewport";
	value: number;
};

export type CameraPathPoint = { x: number; y: number };

export type BlockCameraPath =
	| { mode: "auto" }
	| { mode: "reverse-flow" }
	| { direction: Direction; mode: "straight" }
	| { mode: "custom"; points: CameraPathPoint[] };

export type AnimationEasing =
	| "back.out"
	| "bounce.out"
	| "elastic.out"
	| "linear"
	| "power1.in"
	| "power1.inOut"
	| "power1.out"
	| "power2.in"
	| "power2.inOut"
	| "power2.out"
	| "power3.in"
	| "power3.inOut"
	| "power3.out";

type AnimationTrackTiming = {
	easing?: AnimationEasing;
	end: number;
	id?: string;
	loopDurationSeconds?: number;
	loopPlayback?: "alternate" | "restart";
	playback?: ScrollAnimationPlayback;
	start: number;
	visibleRange?: TimelineRange;
};

export type AnimationTrack = AnimationTrackTiming &
	(
		| {
				from: number;
				property: "opacity";
				to: number;
		  }
		| {
				from: number;
				property: "rotate" | "scale";
				to: number;
		  }
		| {
				axis: "x" | "xy" | "xyz" | "y";
				from: number;
				fromY?: number;
				fromZ?: number;
				property: "translate";
				to: number;
				toY?: number;
				toZ?: number;
				unit?: "px" | "viewport";
		  }
		| {
				property: "blur";
				strength: number;
		  }
		| {
				from: number;
				path: string;
				property: "motionPath";
				to: number;
		  }
	);

export type AnimationSelection = {
	animations: AnimationTrack[];
};

export type AmbientAnimationSelection = AnimationSelection & {
	cycleDurationMs?: number;
	playback?: "alternate" | "restart";
};

export type ScrollAnimationPlayback = "commitOnComplete" | "scrub";

export type TimelineRange = { end: number; start: number };

export type FragmentAnimationConfig = {
	ambient: AmbientAnimationSelection;
	entering: AnimationSelection;
	leaving: AnimationSelection;
	scrolling: AnimationSelection;
};

export type EntityBounds = {
	firstBlockId: string | null;
	lastBlockId: string | null;
};

export type StructurePosition = {
	index: number;
	isFirst: boolean;
	isLast: boolean;
};

export type BlockSize =
	| {
			horizontalAlignment: HorizontalCameraFraming;
			height: number;
			heightUnit: "px" | "viewport";
			mode: "manual";
			width: number;
			widthUnit: "px" | "viewport";
			verticalAlignment: VerticalCameraFraming;
	  }
	| {
			horizontalAlignment: HorizontalCameraFraming;
			maxHeight?: number;
			maxHeightUnit?: "px" | "viewport";
			maxWidth?: number;
			maxWidthUnit?: "px" | "viewport";
			minHeight?: number;
			minHeightUnit?: "px" | "viewport";
			minWidth?: number;
			minWidthUnit?: "px" | "viewport";
			mode: "content";
			verticalAlignment: VerticalCameraFraming;
	  };

export type NodeChild =
	| { fragmentId: string; type: "fragment" }
	| { nodeId: string; type: "node" };

export type ReaderStyle = {
	alignContent?:
		| "center"
		| "end"
		| "space-around"
		| "space-between"
		| "space-evenly"
		| "start"
		| "stretch";
	alignItems?: "center" | "end" | "start" | "stretch";
	alignSelf?: "auto" | "center" | "end" | "start" | "stretch";
	background?: string;
	backgroundCss?: string;
	backgroundImage?: string;
	border?: string;
	borderRadius?: number;
	boxShadow?: string;
	clipPath?: string;
	color?: string;
	columnGap?: number | string;
	cssText?: string;
	display?: "block" | "flex" | "grid" | "inline-block";
	flexBasis?: number | string;
	flexDirection?: "column" | "column-reverse" | "row" | "row-reverse";
	flexGrow?: number;
	flexShrink?: number;
	flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
	fontSize?: number | string;
	fontWeight?: number | string;
	gap?: number;
	gridAutoColumns?: string;
	gridAutoFlow?: "column" | "column dense" | "dense" | "row" | "row dense";
	gridAutoRows?: string;
	gridArea?: string;
	gridColumn?: string;
	gridRow?: string;
	gridTemplateAreas?: string;
	gridTemplateColumns?: string;
	gridTemplateRows?: string;
	height?: number | string;
	justifyItems?: "center" | "end" | "start" | "stretch";
	justifySelf?: "auto" | "center" | "end" | "start" | "stretch";
	justifyContent?:
		| "center"
		| "end"
		| "space-around"
		| "space-between"
		| "space-evenly"
		| "start";
	margin?: number | string;
	lineHeight?: number | string;
	maxHeight?: number | string;
	maxWidth?: number | string;
	minHeight?: number | string;
	minWidth?: number | string;
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	objectPosition?: string;
	opacity?: number;
	order?: number;
	overflow?: "clip" | "hidden" | "visible";
	padding?: number | string;
	paddingBlock?: number | string;
	paddingInline?: number | string;
	rowGap?: number | string;
	textAlign?: "center" | "end" | "justify" | "left" | "right" | "start";
	width?: number | string;
	zIndex?: number;
};

export type TaleNode =
	| {
			animations: FragmentAnimationConfig;
			align?: "center" | "end" | "start" | "stretch";
			children: NodeChild[];
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "stack";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyle;
	  }
	| {
			animations: FragmentAnimationConfig;
			align?: "center" | "end" | "start" | "stretch";
			children: NodeChild[];
			direction?: "column" | "column-reverse" | "row" | "row-reverse";
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "flex";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyle;
			wrap?: boolean;
	  }
	| {
			animations: FragmentAnimationConfig;
			children: NodeChild[];
			columns?: number;
			gap?: number;
			id: string;
			mode: "grid";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			rows?: number;
			style?: ReaderStyle;
	  }
	| {
			animations: FragmentAnimationConfig;
			children: NodeChild[];
			id: string;
			mode: "free";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyle;
	  };

export type FragmentPlacement =
	| { mode: "normal"; nodeId?: string; overflow?: "clip" | "visible" }
	| {
			horizontal: "center" | "left" | "right";
			mode: "absolute" | "fixed";
			nodeId?: string;
			overflow?: "clip" | "visible";
			unit: "px" | "viewport";
			vertical: "bottom" | "center" | "top";
			width?: number;
			x: number;
			y: number;
			zIndex?: number;
	  };

export type AnimationPreset = {
	id: string;
	name: string;
	source: "creator" | "official";
	target: "block" | "fragment" | "both";
	tracks: AnimationTrack[];
};

export type VisibilityPreset = {
	id: string;
	name: string;
	range: TimelineRange;
	source: "creator" | "official";
};

export type TransitionPreset = {
	enteringAnimationPresetIds: string[];
	flow: BlockFlow;
	id: string;
	leavingAnimationPresetIds: string[];
	name: string;
	source: "creator" | "official";
};

export type BlockStylePreset = {
	id: string;
	name: string;
	source: "creator" | "official";
	style: ReaderStyle;
	target: "block" | "fragment" | "both";
};

export type TaleFragment = {
	alt?: string;
	animations: {
		ambient: AmbientAnimationSelection;
		entering: AnimationSelection;
		leaving: AnimationSelection;
		scrolling: AnimationSelection;
	};
	attribution?: string;
	caption?: string;
	fallbackSrc?: string | null;
	id: string;
	label?: string;
	mood?: string;
	nodeId: string | null;
	order: number;
	pathIds?: string[];
	pathId?: string;
	placement: FragmentPlacement;
	prompt?: string;
	src?: string | null;
	style?: ReaderStyle;
	text?: string;
	type: "choiceButton" | "codexEntry" | "image" | "quote" | "soundCue" | "text";
	responsiveOverrides?: Record<string, TaleFragmentResponsiveOverride>;
	visibleRange?: TimelineRange;
};

export type ResolvedTaleFragment = TaleFragment & {
	blockId: string;
	branchId: string;
	entryId: string;
	links: {
		nextFragmentId: string | null;
		nextFragmentIdInBlock: string | null;
		previousFragmentId: string | null;
		previousFragmentIdInBlock: string | null;
	};
	pageId: string;
	partId: string;
	position: StructurePosition & {
		isFirstInBlock: boolean;
		isLastInBlock: boolean;
	};
	resolvedAnimations: {
		ambient: AnimationTrack[];
		ambientCycleDurationMs: number;
		ambientPlayback: "alternate" | "restart";
		entering: AnimationTrack[];
		leaving: AnimationTrack[];
		scrolling: AnimationTrack[];
	};
	resolvedVisibleRange: TimelineRange;
};

export type TaleBlock = {
	branchId: string;
	description?: string;
	entryId: string;
	fragmentIds: string[];
	id: string;
	isChoiceBlock: boolean;
	isPaginated: boolean;
	nodeIds: string[];
	nodes?: TaleNode[];
	rootNodeId?: string;
	order: number;
	pageId: string;
	pageNumber: number | null;
	partId: string;
	reading: {
		animations: {
			ambient: AmbientAnimationSelection;
			scrolling: AnimationSelection;
		};
		cameraPath?: BlockCameraPath;
		readingLength: number | null;
		readingLengthMode: "content" | "manual";
		pauses?: {
			atEnd?: number;
			atStart?: number;
		};
	};
	size: BlockSize;
	snap: TaleBlockSnapConfig;
	style?: ReaderStyle;
	title: string;
	responsiveOverrides?: Record<string, TaleBlockResponsiveOverride>;
	transition: {
		animations: {
			entering: AnimationSelection;
			leaving: AnimationSelection;
			previousVisible: AnimationSelection;
		};
		enteringLength: number | null;
		flow: BlockFlow;
		leavingLength: number | null;
		previousBlocksDuringEnter: PreviousBlocksDuringEnter;
		scrollLength: number | null;
	};
};

export type TaleBlockSnapMode = "scroll-snap" | "snap" | "snap-off";

export type TaleBlockSnapDirection = "both" | "fromNext" | "fromPrevious";

export type TaleBlockSnapSettings = {
	captureDistancePx?: number | null;
	durationSeconds?: number | null;
	delayMs?: number | null;
	minViewportFraction?: number | null;
};

export type TaleBlockSnapConfig = {
	direction?: TaleBlockSnapDirection;
	mode: TaleBlockSnapMode;
	settings?: TaleBlockSnapSettings | null;
};

export type TaleSnapConfig = {
	scrollSnap: TaleBlockSnapSettings;
	snap: TaleBlockSnapSettings;
};

export type ResolvedTaleBlock = TaleBlock & {
	children: {
		fragmentIds: string[];
	};
	clippedFragments: ResolvedTaleFragment[];
	fixedFragments: ResolvedTaleFragment[];
	flowFragments: ResolvedTaleFragment[];
	fragments: ResolvedTaleFragment[];
	fragmentsById: Record<string, ResolvedTaleFragment>;
	links: {
		nextBlockId: string | null;
		nextBlockIdInBranch: string | null;
		nextBlockIdInEntry: string | null;
		nextBlockIdInPage: string | null;
		nextBlockIdInPart: string | null;
		previousBlockId: string | null;
		previousBlockIdInBranch: string | null;
		previousBlockIdInEntry: string | null;
		previousBlockIdInPage: string | null;
		previousBlockIdInPart: string | null;
	};
	nodes: TaleNode[];
	nodesById: Record<string, TaleNode>;
	rootNodeId: string;
	overflowingFragments: ResolvedTaleFragment[];
	placedFragments: ResolvedTaleFragment[];
	position: StructurePosition & {
		branchIndex: number;
		entryIndex: number;
		isFirstInBranch: boolean;
		isFirstInEntry: boolean;
		isFirstInPage: boolean;
		isFirstInPart: boolean;
		isLastInBranch: boolean;
		isLastInEntry: boolean;
		isLastInPage: boolean;
		isLastInPart: boolean;
		isPageBlock: boolean;
		pageIndex: number;
		partIndex: number;
	};
	resolved: {
		background: string;
		flow: BlockFlow;
		hasImage: boolean;
		readingAnimations: {
			ambient: AnimationTrack[];
			ambientCycleDurationMs: number;
			ambientPlayback: "alternate" | "restart";
			scrolling: AnimationTrack[];
		};
		style: ReaderStyle;
		transitionAnimations: {
			entering: AnimationTrack[];
			leaving: AnimationTrack[];
			previousVisible: AnimationTrack[];
		};
	};
};

export type TaleBranch = {
	blockIds: string[];
	description?: string;
	id: string;
	order: number;
	parentBranchId: string | null;
	path: string;
	title: string;
};

export type ResolvedTaleBranch = TaleBranch & {
	children: {
		blockIds: string[];
	};
	bounds: EntityBounds;
	counts: {
		blocks: number;
	};
	links: {
		incomingPathIds: string[];
		nextBranchId: string | null;
		outgoingPathIds: string[];
		previousBranchId: string | null;
	};
	position: StructurePosition & {
		hasIncomingPaths: boolean;
		hasOutgoingPaths: boolean;
		isChoiceBranch: boolean;
		isRootBranch: boolean;
		isTerminalBranch: boolean;
	};
};

export type TaleEntry = {
	description?: string;
	id: string;
	isNumbered: boolean;
	order: number;
	partId: string;
	title: string;
	type: EntryType | "ending";
};

export type ResolvedTaleEntry = TaleEntry & {
	bounds: EntityBounds & {
		firstPageId: string | null;
		lastPageId: string | null;
	};
	chapter: {
		isChapter: boolean;
		localNumber: number | null;
		number: number | null;
	};
	children: {
		blockIds: string[];
		pageIds: string[];
	};
	counts: {
		blocks: number;
		pages: number;
	};
	links: {
		nextEntryId: string | null;
		nextEntryIdInPart: string | null;
		previousEntryId: string | null;
		previousEntryIdInPart: string | null;
	};
	position: StructurePosition & {
		entryNumber: number;
		isFirstInPart: boolean;
		isLastInPart: boolean;
	};
};

export type TalePage = {
	blockIds: string[];
	description?: string;
	entryId: string;
	id: string;
	isPaginated: boolean;
	partId: string;
	title?: string;
	type: string;
};

export type ResolvedTalePage = TalePage & {
	bounds: {
		firstBlockId: string | null;
		lastBlockId: string | null;
	};
	children: {
		blockIds: string[];
	};
	counts: {
		blocks: number;
	};
	links: {
		nextPageId: string | null;
		nextPageIdInEntry: string | null;
		nextPageIdInPart: string | null;
		previousPageId: string | null;
		previousPageIdInEntry: string | null;
		previousPageIdInPart: string | null;
	};
	position: StructurePosition & {
		globalPageNumber: number;
		isFirstInEntry: boolean;
		isFirstInPart: boolean;
		isLastInEntry: boolean;
		isLastInPart: boolean;
		pageNumber: number | null;
	};
};

export type TalePart = {
	description?: string;
	id: string;
	order: number;
	title: string;
};

export type ResolvedTalePart = TalePart & {
	bounds: EntityBounds & {
		firstEntryId: string | null;
		firstPageId: string | null;
		lastEntryId: string | null;
		lastPageId: string | null;
	};
	children: {
		blockIds: string[];
		entryIds: string[];
		pageIds: string[];
	};
	counts: {
		blocks: number;
		entries: number;
		pages: number;
	};
	links: {
		nextPartId: string | null;
		previousPartId: string | null;
	};
	position: StructurePosition;
};

export type TalePath = {
	description: string;
	fromBlockId: string;
	fromBranchId: string;
	id: string;
	label: string;
	order: number;
	toBlockId: string;
	toBranchId: string;
	type: "choice" | "linear" | "return" | "teleport";
};

export type ResolvedTalePath = TalePath & {
	links: {
		nextPathId: string | null;
		previousPathId: string | null;
	};
};

export type Point = { x: number; y: number };

export type Anchor = {
	block: ResolvedTaleBlock;
	branch: ResolvedTaleBranch;
	cameraFramingOffset: Point;
	cameraPoint: Point;
	entry: ResolvedTaleEntry;
	height: number;
	id: string;
	page: ResolvedTalePage;
	part: ResolvedTalePart;
	point: Point;
	readingPathPoints: Point[];
	scroll: number;
	width: number;
};

export type TaleCollections = {
	anchors: Anchor[] | null;
	animationPresets: AnimationPreset[];
	blocks: ResolvedTaleBlock[];
	blockStylePresets: BlockStylePreset[];
	branches: ResolvedTaleBranch[];
	entries: ResolvedTaleEntry[];
	fragments: ResolvedTaleFragment[];
	nodes: TaleNode[];
	pages: ResolvedTalePage[];
	parts: ResolvedTalePart[];
	paths: ResolvedTalePath[];
	transitionPresets: TransitionPreset[];
	visibilityPresets: VisibilityPreset[];
};

export type TaleIndexMap = {
	anchorsByBlockId: Record<string, Anchor> | null;
	animationPresetsById: Record<string, AnimationPreset>;
	blocksById: Record<string, ResolvedTaleBlock>;
	blockStylePresetsById: Record<string, BlockStylePreset>;
	branchesById: Record<string, ResolvedTaleBranch>;
	entriesById: Record<string, ResolvedTaleEntry>;
	fragmentsById: Record<string, ResolvedTaleFragment>;
	nodesById: Record<string, TaleNode>;
	pagesById: Record<string, ResolvedTalePage>;
	partsById: Record<string, ResolvedTalePart>;
	pathsById: Record<string, ResolvedTalePath>;
	transitionPresetsById: Record<string, TransitionPreset>;
	visibilityPresetsById: Record<string, VisibilityPreset>;
};

export type TaleContent = {
	bounds: TaleBounds;
	counts: TaleCounts;
	indexMap: TaleIndexMap;
	order: TaleOrder;
	structure: TaleCollections;
};

export type TaleOrder = {
	blockIds: string[];
	branchIds: string[];
	entryIds: string[];
	fragmentIds: string[];
	nodeIds: string[];
	numberedPageIds: string[];
	pageIds: string[];
	partIds: string[];
	pathIds: string[];
};

export type TaleCounts = {
	blocks: number;
	branches: number;
	entries: number;
	fragments: number;
	nodes: number;
	pages: number;
	parts: number;
	paths: number;
};

export type TaleBounds = {
	firstBlockId: string | null;
	firstBranchId: string | null;
	firstEntryId: string | null;
	firstFragmentId: string | null;
	firstPageId: string | null;
	firstPartId: string | null;
	lastBlockId: string | null;
	lastBranchId: string | null;
	lastEntryId: string | null;
	lastFragmentId: string | null;
	lastPageId: string | null;
	lastPartId: string | null;
	rootBranchId: string | null;
};

export type Tale = Partial<Omit<TaleSchema, "id">> &
	TaleContent & {
		breakpoints: TaleBreakpoint[];
		book: Book | null;
		creator: PublicUserInfo | null;
		id: number;
		snapConfig: TaleSnapConfig;
		synopsis?: string;
	};

export type RawTaleRecord = {
	animationPresets: AnimationPreset[];
	blocks: TaleBlock[];
	blockStylePresets: BlockStylePreset[];
	breakpoints: TaleBreakpoint[];
	branches: TaleBranch[];
	entries: TaleEntry[];
	fragments: TaleFragment[];
	id: number;
	nodes: TaleNode[];
	pages: TalePage[];
	parts: TalePart[];
	paths: TalePath[];
	slug: string;
	snapConfig: TaleSnapConfig;
	synopsis: string;
	title: string;
	firstBlockTransitionMode: FirstBlockTransitionMode;
	transitionFirstBlock: boolean;
	transitionPresets: TransitionPreset[];
	visibilityPresets: VisibilityPreset[];
};

export type LayoutPhase =
	| "loading-tale"
	| "preparing-structure"
	| "waiting-for-assets"
	| "measuring-layout"
	| "compiling-reader"
	| "restoring-progress"
	| "preparing-motion"
	| "ready";

export type ResolvedBlockSize = {
	height: number;
	width: number;
};

export type TimelineSegment =
	| {
			anchor: Anchor;
			end: number;
			index: number;
			length: number;
			pauseType: "end" | "start";
			start: number;
			type: "pause";
	  }
	| {
			anchor: Anchor;
			end: number;
			index: number;
			length: number;
			start: number;
			type: "reading";
	  }
	| {
			end: number;
			from: Anchor;
			index: number;
			length: number;
			start: number;
			to: Anchor;
			type: "transition";
	  };

export type SnapPoint = {
	blockId: string;
	direction?: TaleBlockSnapDirection;
	id: string;
	mode: TaleBlockSnapMode;
	scroll: number;
	settings?: TaleBlockSnapSettings | null;
	transitionEnd?: number;
	transitionStart?: number;
	type: "block-end" | "block-start" | "choice-end";
};

export type ReaderScrollTargetOptions = {
	atChoiceEnd?: boolean;
	duration?: number;
	motion?: "instant" | "reading" | "travel";
	onComplete?: () => void;
};

export type CompiledReader = {
	anchorIndexByBlockId: Record<string, number>;
	anchors: Anchor[];
	anchorsByBlockId: Record<string, Anchor>;
	contents: ReaderContentsPart[];
	entries: ReaderContentsEntry[];
	entryIndexById: Record<string, number>;
	heldPreviousTakeoverBlockIdByAnchorIndex: Array<string | null>;
	pageIndexById: Record<string, number>;
	pages: ReaderContentsPage[];
	previousVisibleBlockIdsByEnteringBlockId: Record<string, string[]>;
	segmentIndexByBlockId: Record<string, number>;
	segments: TimelineSegment[];
	segmentStarts: number[];
	snapConfig: TaleSnapConfig;
	snapPoints: SnapPoint[];
	startsWithTransition: boolean;
	totalScroll: number;
	transitionIntoByBlockId: Record<string, number>;
	transitionOutOfByBlockId: Record<string, number>;
};

export type ReaderContentsBlock = {
	blockId: string;
	entryBlockIndex: number;
	globalBlockIndex: number;
	isPaginated: boolean;
	pageId: string;
	pageLabel: string;
	pageNumber: number | null;
	pageType: TalePage["type"];
	title: string;
};

export type ReaderContentsEntry = {
	blocks: ReaderContentsBlock[];
	chapterNumber: number | null;
	firstBlockId: string;
	hasChoiceBlock: boolean;
	id: string;
	pages: ReaderContentsPage[];
	title: string;
	type: TaleEntry["type"];
};

export type ReaderContentsPage = {
	blockIds: string[];
	entryId: string;
	firstBlockId: string;
	globalIndex: number;
	hasChoiceBlock: boolean;
	id: string;
	isPaginated: boolean;
	label: string;
	number: number | null;
	title: string;
	type: TalePage["type"];
};

export type ReaderContentsPart = {
	blockCount: number;
	entries: ReaderContentsEntry[];
	firstBlockId: string;
	id: string;
	pageCount: number;
	title: string;
};

export type TaleStoreMode = "edit" | "read";

export type ReaderLocation = {
	blockId: string;
	branchId: string;
	entryId: string;
	pageId: string;
	partId: string;
	segmentIndex: number;
};

export type TaleInspectorTarget =
	| { id: string; type: "block" }
	| {
			blockId: string;
			id: string;
			initialTab?: "content" | "motion" | "placement" | "style" | "summary";
			type: "fragment";
	  }
	| { blockId: string; id: string; type: "node" };

export type SavedReaderProgress = {
	blockId: string | null;
	committedAnimationIds: string[];
	id?: number;
	innerProgress: number;
	selectedBranchIds: string[];
	seenBlockIds: string[];
	seenEntryIds: string[];
	seenPageIds: string[];
	seenPartIds: string[];
	taleId?: number;
	updatedAt: string;
};

export type ReaderViewportLayout =
	| "desktop"
	| "mobile-landscape"
	| "mobile-portrait";

export type ViewportSize = { height: number; width: number };

export type TaleBreakpointOrientation = "landscape" | "portrait";

export type TaleBreakpoint = {
	id: string;
	label: string;
	maxHeight?: number;
	maxWidth?: number;
	minHeight?: number;
	minWidth?: number;
	orientation?: TaleBreakpointOrientation;
	order: number;
};

export type TaleBlockResponsiveOverride = Partial<
	Pick<
		TaleBlock,
		| "description"
		| "nodes"
		| "reading"
		| "rootNodeId"
		| "size"
		| "style"
		| "title"
		| "transition"
	>
>;

export type TaleFragmentResponsiveOverride = Partial<
	Pick<
		TaleFragment,
		| "alt"
		| "animations"
		| "attribution"
		| "caption"
		| "fallbackSrc"
		| "label"
		| "mood"
		| "pathId"
		| "pathIds"
		| "placement"
		| "prompt"
		| "src"
		| "style"
		| "text"
		| "visibleRange"
	>
>;
