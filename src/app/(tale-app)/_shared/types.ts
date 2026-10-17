import type { PublicUserInfo } from "~/server/db/data/users/queries";
import type { TaleSchema } from "~/server/db/schema";
import type { Book } from "~/server/db/schema/library/books";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { ElementParallaxConfig } from "~/server/db/types/tale-reader/readerConfig";

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

export type SceneFlow =
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

export type FirstSceneTransitionMode = "fromPlacement" | "inPlace";

export type PreviousScenesDuringEnter =
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

export type SceneCameraPath =
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
	durationSeconds?: number;
	/** Paints the authored starting values before this animation becomes active. */
	applyInitialStateBeforeStart?: boolean;
	/** Uses this animation's completed values as the base for the next phase. */
	carryEndStateForward?: boolean;
};

export type HoverAnimationSelection = {
	animations: AnimationTrack[];
	durationSeconds?: number;
};

export type AmbientAnimationSelection = AnimationSelection & {
	cycleDurationMs?: number;
	endFrameId?: string | null;
	playback?: "alternate" | "restart";
	startFrameId?: string | null;
};

export type ScrollAnimationPlayback = "commitOnComplete" | "scrub";

export type TimelineRange = { end: number; start: number };

export type ElementAnimationConfig = {
	ambient: AmbientAnimationSelection;
	previousFrameBridge?: AnimationSelection;
	previousFrameBridgeLoop?: AmbientAnimationSelection;
	frameIntro?: AnimationSelection;
	frameOutro?: AnimationSelection;
	nextFrameBridge?: AnimationSelection;
	nextFrameBridgeLoop?: AmbientAnimationSelection;
	previousBridge?: AnimationSelection;
	previousBridgeLoop?: AmbientAnimationSelection;
	sceneIntro?: AnimationSelection;
	sceneOutro?: AnimationSelection;
	nextBridge?: AnimationSelection;
	nextBridgeLoop?: AmbientAnimationSelection;
	intro: AnimationSelection;
	introLoop?: AmbientAnimationSelection;
	hover?: HoverAnimationSelection;
	outro: AnimationSelection;
	outroLoop?: AmbientAnimationSelection;
	active: AnimationSelection;
	activeLoop?: AmbientAnimationSelection;
};

export type EntityBounds = {
	firstSceneId: string | null;
	lastSceneId: string | null;
};

export type StructurePosition = {
	index: number;
	isFirst: boolean;
	isLast: boolean;
};

export type SceneSize =
	| {
			horizontalAlignment: HorizontalCameraFraming;
			height: number;
			heightUnit: "px" | "viewport";
			mode: "manual";
			maxHeight?: number;
			maxHeightUnit?: "px" | "viewport";
			maxWidth?: number;
			maxWidthUnit?: "px" | "viewport";
			minHeight?: number;
			minHeightUnit?: "px" | "viewport";
			minWidth?: number;
			minWidthUnit?: "px" | "viewport";
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

export type FrameChild =
	| { elementId: string; type: "element" }
	| { frameId: string; type: "frame" };

/** Controls how a Frame's measured reading span is divided among Keyframes. */
export type FrameActiveLengthConfig = {
	allocations?: Record<string, number>;
	mode: "content" | "manual";
	unit?: "length" | "percentage";
};

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
	backgroundPosition?: string;
	backgroundRepeat?:
		| "no-repeat"
		| "repeat"
		| "repeat-x"
		| "repeat-y"
		| "round"
		| "space";
	backgroundSize?: string;
	bottom?: number | string;
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
	position?: "absolute" | "relative" | "static" | "sticky";
	left?: number | string;
	rowGap?: number | string;
	textAlign?: "center" | "end" | "justify" | "left" | "right" | "start";
	right?: number | string;
	top?: number | string;
	width?: number | string;
	zIndex?: number;
};

export type TaleFrame = {
	defaultElementStates?: Record<string, "active" | "inactive">;
	/** Groups are layout/animation wrappers and never own Keyframes. */
	kind?: "frame" | "group";
	/** Author-facing label persisted in the frame row's `name` column. */
	name?: string | null;
	progression?: FrameActiveLengthConfig;
	transition?: {
		introEnabled?: boolean;
		introLength?: number | null;
		outroEnabled?: boolean;
		outroLength?: number | null;
		previousBridgeEnabled?: boolean;
		previousBridgeLength?: number | null;
		nextBridgeEnabled?: boolean;
		nextBridgeLength?: number | null;
	};
	visibleDuringFrameIntro?: boolean;
	visibleDuringFrameOutro?: boolean;
	visibleDuringPreviousFrameBridge?: boolean;
	visibleDuringNextFrameBridge?: boolean;
	/** Shows this Frame and its default-active Elements while its Scene arrives. */
	visibleDuringSceneIntro?: boolean;
	/** Shows this Frame while its owning Scene outro transition runs. */
	visibleDuringSceneOutro?: boolean;
	visibleDuringPreviousBridge?: boolean;
	visibleDuringNextBridge?: boolean;
	/** Keeps this Frame visible before its own first Keyframe begins. */
	visibleBeforeFrameIntro?: boolean;
	/** @deprecated Split into the two explicit early-visibility gates above. */
	visibleBeforeIntro?: boolean;
} & (
	| {
			animations: ElementAnimationConfig;
			align?: "center" | "end" | "start" | "stretch";
			children: FrameChild[];
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "stack";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyle;
	  }
	| {
			animations: ElementAnimationConfig;
			align?: "center" | "end" | "start" | "stretch";
			children: FrameChild[];
			direction?: "column" | "column-reverse" | "row" | "row-reverse";
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "flex";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyle;
			wrap?: boolean;
	  }
	| {
			animations: ElementAnimationConfig;
			children: FrameChild[];
			columns?: number;
			gap?: number;
			id: string;
			mode: "grid";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			rows?: number;
			style?: ReaderStyle;
	  }
	| {
			animations: ElementAnimationConfig;
			children: FrameChild[];
			id: string;
			mode: "free";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyle;
	  }
);

export type ElementParallax = ElementParallaxConfig;

export type ElementPlacement = { parallax?: ElementParallax } & (
	| { mode: "normal"; frameId?: string; overflow?: "clip" | "visible" }
	| {
			horizontal: "center" | "left" | "right";
			mode: "absolute" | "fixed";
			frameId?: string;
			overflow?: "clip" | "visible";
			unit: "px" | "viewport";
			vertical: "bottom" | "center" | "top";
			width?: number;
			x: number;
			y: number;
			zIndex?: number;
	  }
);

export type AnimationPreset = {
	id: string;
	name: string;
	source: "creator" | "official";
	target: "both" | "element" | "scene";
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
	flow: SceneFlow;
	id: string;
	leavingAnimationPresetIds: string[];
	name: string;
	source: "creator" | "official";
};

export type SceneStylePreset = {
	id: string;
	name: string;
	source: "creator" | "official";
	style: ReaderStyle;
	target: "both" | "element" | "scene";
};

export type TaleElement = {
	alt?: string;
	animations: ElementAnimationConfig;
	attribution?: string;
	caption?: string;
	fallbackSrc?: string | null;
	id: string;
	imageStyle?: ReaderStyle;
	label?: string;
	mood?: string;
	mediaPlayback?: {
		loop: boolean;
		maxVolume: number;
		mode: "click" | "controls" | "onEnter" | "scrollVolume";
		scope: "element" | "frame" | "scene";
	};
	frameId: string | null;
	order: number;
	pathIds?: string[];
	pathId?: string;
	placement: ElementPlacement;
	prompt?: string;
	progression?: {
		enabled: boolean;
		introLength: number;
		outroLength: number;
		pauses: { atEnd: number; atStart: number };
		activeLength: number;
		snap: TaleSceneSnapConfig;
	};
	src?: string | null;
	style?: ReaderStyle;
	text?: string;
	visibleDuringFrameIntro?: boolean;
	visibleDuringFrameOutro?: boolean;
	visibleDuringPreviousFrameBridge?: boolean;
	visibleDuringNextFrameBridge?: boolean;
	visibleDuringSceneIntro?: boolean;
	visibleDuringSceneOutro?: boolean;
	visibleDuringPreviousBridge?: boolean;
	visibleDuringNextBridge?: boolean;
	type:
		| "audio"
		| "choiceButton"
		| "codexEntry"
		| "image"
		| "quote"
		| "soundCue"
		| "text"
		| "video";
	responsiveOverrides?: Record<string, TaleElementResponsiveOverride>;
	visibleRange?: TimelineRange;
};

export type ResolvedTaleElement = TaleElement & {
	sceneId: string;
	branchId: string;
	entryId: string;
	links: {
		nextElementId: string | null;
		nextElementIdInScene: string | null;
		previousElementId: string | null;
		previousElementIdInScene: string | null;
	};
	pageId: string;
	partId: string;
	position: StructurePosition & {
		isFirstInScene: boolean;
		isLastInScene: boolean;
	};
	resolvedAnimations: {
		ambient: AnimationTrack[];
		ambientCycleDurationMs: number;
		ambientPlayback: "alternate" | "restart";
		intro: AnimationTrack[];
		outro: AnimationTrack[];
		active: AnimationTrack[];
	};
	resolvedVisibleRange: TimelineRange;
};

export type TaleScene = {
	articleStyle?: ReaderStyle;
	container?: SceneContainer;
	autoplay?: TaleSceneAutoplayConfig;
	branchId: string;
	description?: string;
	entryId: string;
	elementIds: string[];
	id: string;
	isChoiceScene: boolean;
	isPaginated: boolean;
	frameIds: string[];
	keyframeIds: string[];
	rootFrameId?: string;
	order: number;
	pageId: string;
	pageNumber: number | null;
	partId: string;
	reading: {
		animations: {
			ambient: AmbientAnimationSelection;
			hover?: HoverAnimationSelection;
			/** Runs once across the complete Scene active span. */
			sceneActive?: AnimationSelection;
			/** Loops across the complete Scene active span. */
			sceneActiveLoop?: AmbientAnimationSelection;
			/** Runs once for each Keyframe active segment. */
			active: AnimationSelection;
			/** Loops independently inside each Keyframe active segment. */
			activeLoop?: AmbientAnimationSelection;
		};
		cameraPath?: SceneCameraPath;
		activeLength: number | null;
		activeLengthMode: "content" | "manual";
		pauses?: {
			atEnd?: number;
			atStart?: number;
		};
	};
	size: SceneSize;
	snap: TaleSceneSnapConfig;
	style?: ReaderStyle;
	title: string;
	responsiveOverrides?: Record<string, TaleSceneResponsiveOverride>;
	transition: {
		animations: {
			intro: AnimationSelection;
			introLoop?: AmbientAnimationSelection;
			outro: AnimationSelection;
			outroLoop?: AmbientAnimationSelection;
			previousBridge?: AnimationSelection;
			previousBridgeLoop?: AmbientAnimationSelection;
			nextBridge?: AnimationSelection;
			nextBridgeLoop?: AmbientAnimationSelection;
			previousVisible: AnimationSelection;
		};
		introLength: number | null;
		introEnabled?: boolean;
		flow: SceneFlow;
		outroLength: number | null;
		outroEnabled?: boolean;
		previousBridgeEnabled?: boolean;
		previousBridgeLength?: number | null;
		nextBridgeEnabled?: boolean;
		nextBridgeLength?: number | null;
		pauseAfterIntroEnabled?: boolean;
		pauseBeforeOutroEnabled?: boolean;
		previousScenesDuringEnter: PreviousScenesDuringEnter;
		scrollLength: number | null;
	};
};

export type SceneContainer = {
	mode: "stack" | "flex" | "grid" | "free";
	articleStyle?: ReaderStyle;
	direction?: "row" | "column" | "row-reverse" | "column-reverse";
	gap?: number;
	columns?: number;
	rows?: number;
	overflow?: "clip" | "visible";
	style?: ReaderStyle;
};

export type TaleSceneSnapMode = "scroll-snap" | "snap" | "snap-off";

export type TaleSceneSnapDirection = "both" | "fromNext" | "fromPrevious";

export type TaleSceneSnapStrategy = "separate" | "shared";

export type TaleSceneSnapApproach = "backward" | "forward";

export type TaleSceneSnapSettings = {
	captureDistancePx?: number | null;
	durationSeconds?: number | null;
	delayMs?: number | null;
	minViewportFraction?: number | null;
};

export type TaleSceneSnapBehavior = {
	mode: TaleSceneSnapMode;
	settings?: TaleSceneSnapSettings | null;
};

export type TaleSceneSnapConfig = TaleSceneSnapBehavior & {
	backward?: TaleSceneSnapBehavior;
	/** Legacy direction field normalized when older tales are loaded. */
	direction?: TaleSceneSnapDirection;
	forward?: TaleSceneSnapBehavior;
	strategy?: TaleSceneSnapStrategy;
};

export type TaleSnapConfig = {
	scrollSnap: TaleSceneSnapSettings;
	snap: TaleSceneSnapSettings;
};

export type TalePlaybackConfig = {
	autoplay: {
		enabled: boolean;
		speed: number;
		stopOn: {
			dragging: boolean;
			keyboard: boolean;
			scrolling: boolean;
		};
	};
	interactions: {
		dragging: boolean;
		keyboard: boolean;
		scrolling: boolean;
	};
};

export type TaleSceneAutoplayConfig = {
	enabled: boolean;
	introSpeed: number | null;
	outroSpeed: number | null;
	pauseAfterIntroSeconds: number | null;
	pauseBeforeOutroSeconds: number | null;
	activeSpeed: number | null;
};

export type KeyframeAction = {
	animation?: AnimationSelection;
	animationTarget?: "children" | "self";
	id: string;
	targetId: string;
	targetType: "element" | "frame";
	type:
		| "inactive"
		| "active"
		| "intro"
		| "outro"
		| "continue"
		| "stop"
		| "disable"
		| "enable"
		| "hide"
		| "pause"
		| "play"
		| "show";
};

export type TaleKeyframe = {
	responsiveOverrides?: Record<
		string,
		Partial<
			Pick<
				TaleKeyframe,
				| "actions"
				| "autoplay"
				| "reading"
				| "transition"
				| "snap"
				| "order"
				| "pageId"
			>
		>
	>;
	actions: KeyframeAction[];
	autoplay?: TaleSceneAutoplayConfig;
	branchId: string;
	description?: string;
	frameId: string | null;
	id: string;
	order: number;
	pageId: string | null;
	reading: TaleScene["reading"];
	sceneId: string;
	snap: TaleSceneSnapConfig;
	title: string;
	transition: {
		introLength: number | null;
		outroLength: number | null;
	};
};

export type ResolvedTaleKeyframe = TaleKeyframe & {
	links: {
		nextKeyframeId: string | null;
		previousKeyframeId: string | null;
	};
	position: StructurePosition;
};

export type TaleBackgroundTheme = {
	color: string;
	imageUrl: string | null;
};

export type TaleBackgroundConfig = {
	dark: TaleBackgroundTheme;
	light: TaleBackgroundTheme;
};

export type ResolvedTaleScene = TaleScene & {
	clippedElementIds: string[];
	fixedElementIds: string[];
	flowElementIds: string[];
	links: {
		nextSceneId: string | null;
		nextSceneIdInBranch: string | null;
		nextSceneIdInEntry: string | null;
		nextSceneIdInPage: string | null;
		nextSceneIdInPart: string | null;
		previousSceneId: string | null;
		previousSceneIdInBranch: string | null;
		previousSceneIdInEntry: string | null;
		previousSceneIdInPage: string | null;
		previousSceneIdInPart: string | null;
	};
	rootFrameId: string;
	overflowingElementIds: string[];
	placedElementIds: string[];
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
		isPageScene: boolean;
		pageIndex: number;
		partIndex: number;
	};
	resolved: {
		background: string;
		flow: SceneFlow;
		hasImage: boolean;
		readingAnimations: {
			ambient: AnimationTrack[];
			ambientCycleDurationMs: number;
			ambientPlayback: "alternate" | "restart";
			sceneActive: AnimationTrack[];
			active: AnimationTrack[];
		};
		style: ReaderStyle;
		transitionAnimations: {
			intro: AnimationTrack[];
			outro: AnimationTrack[];
			previousVisible: AnimationTrack[];
		};
	};
};

export type TaleBranch = {
	sceneIds: string[];
	description?: string;
	id: string;
	order: number;
	parentBranchId: string | null;
	path: string;
	title: string;
};

export type ResolvedTaleBranch = TaleBranch & {
	bounds: EntityBounds;
	counts: {
		scenes: number;
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
	sceneIds: string[];
	bounds: EntityBounds & {
		firstPageId: string | null;
		lastPageId: string | null;
	};
	chapter: {
		isChapter: boolean;
		localNumber: number | null;
		number: number | null;
	};
	pageIds: string[];
	counts: {
		scenes: number;
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
	sceneIds: string[];
	description?: string;
	entryId: string;
	id: string;
	isPaginated: boolean;
	order: number;
	partId: string;
	title?: string;
	type: string;
};

export type ResolvedTalePage = TalePage & {
	bounds: {
		firstSceneId: string | null;
		lastSceneId: string | null;
	};
	counts: {
		scenes: number;
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
	sceneIds: string[];
	bounds: EntityBounds & {
		firstEntryId: string | null;
		firstPageId: string | null;
		lastEntryId: string | null;
		lastPageId: string | null;
	};
	entryIds: string[];
	pageIds: string[];
	counts: {
		scenes: number;
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
	fromSceneId: string;
	fromKeyframeId: string | null;
	fromBranchId: string;
	id: string;
	label: string;
	order: number;
	toSceneId: string;
	toKeyframeId: string | null;
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
	sceneId: string;
	branchId: string;
	cameraFramingOffset: Point;
	cameraPoint: Point;
	entryId: string;
	height: number;
	id: string;
	pageId: string;
	partId: string;
	point: Point;
	readingPathPoints: Point[];
	scroll: number;
	width: number;
};

export type TaleIndexMap = {
	animationPresetsById: Record<string, AnimationPreset>;
	scenesById: Record<string, ResolvedTaleScene>;
	sceneStylePresetsById: Record<string, SceneStylePreset>;
	branchesById: Record<string, ResolvedTaleBranch>;
	entriesById: Record<string, ResolvedTaleEntry>;
	elementsById: Record<string, ResolvedTaleElement>;
	framesById: Record<string, TaleFrame>;
	pagesById: Record<string, ResolvedTalePage>;
	partsById: Record<string, ResolvedTalePart>;
	pathsById: Record<string, ResolvedTalePath>;
	keyframesById: Record<string, ResolvedTaleKeyframe>;
	transitionPresetsById: Record<string, TransitionPreset>;
	visibilityPresetsById: Record<string, VisibilityPreset>;
};

export type TaleContent = {
	bounds: TaleBounds;
	counts: TaleCounts;
	indexMap: TaleIndexMap;
	order: TaleOrder;
};

export type TaleOrder = {
	animationPresetIds: string[];
	sceneIds: string[];
	sceneStylePresetIds: string[];
	branchIds: string[];
	entryIds: string[];
	elementIds: string[];
	frameIds: string[];
	numberedPageIds: string[];
	pageIds: string[];
	partIds: string[];
	pathIds: string[];
	keyframeIds: string[];
	transitionPresetIds: string[];
	visibilityPresetIds: string[];
};

export type TaleCounts = {
	scenes: number;
	branches: number;
	entries: number;
	elements: number;
	frames: number;
	pages: number;
	parts: number;
	paths: number;
	keyframes: number;
};

export type TaleBounds = {
	firstSceneId: string | null;
	firstBranchId: string | null;
	firstEntryId: string | null;
	firstElementId: string | null;
	firstPageId: string | null;
	firstPartId: string | null;
	lastSceneId: string | null;
	lastBranchId: string | null;
	lastEntryId: string | null;
	lastElementId: string | null;
	lastPageId: string | null;
	lastPartId: string | null;
	rootBranchId: string | null;
};

export type Tale = Partial<Omit<TaleSchema, "id">> &
	TaleContent & {
		breakpoints: TaleBreakpoint[];
		book: Book | null;
		backgroundConfig: TaleBackgroundConfig;
		creator: PublicUserInfo | null;
		canEdit?: boolean;
		id: number;
		playbackConfig: TalePlaybackConfig;
		snapConfig: TaleSnapConfig;
		synopsis?: string;
	};

export type RawTaleRecord = {
	animationPresets: AnimationPreset[];
	scenes: TaleScene[];
	sceneStylePresets: SceneStylePreset[];
	breakpoints: TaleBreakpoint[];
	branches: TaleBranch[];
	entries: TaleEntry[];
	elements: TaleElement[];
	id: number;
	frames: TaleFrame[];
	pages: TalePage[];
	parts: TalePart[];
	paths: TalePath[];
	keyframes: TaleKeyframe[];
	playbackConfig: TalePlaybackConfig;
	backgroundConfig: TaleBackgroundConfig;
	slug: string;
	snapConfig: TaleSnapConfig;
	synopsis: string;
	title: string;
	firstSceneTransitionMode: FirstSceneTransitionMode;
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

export type ResolvedSceneSize = {
	height: number;
	width: number;
};

export type TimelineSegment =
	| {
			sceneId: string;
			keyframeId: string;
			cameraProgress: number;
			end: number;
			index: number;
			length: number;
			pauseType: "end" | "frame-enter" | "frame-leave" | "start";
			phaseOwner?: "frame" | "scene";
			frameId?: string;
			fromFrameId?: string | null;
			toFrameId?: string | null;
			framePhase?: "intro" | "outro" | "bridge";
			start: number;
			type: "pause";
	  }
	| {
			sceneId: string;
			keyframeId: string;
			cameraProgressEnd: number;
			cameraProgressStart: number;
			end: number;
			index: number;
			length: number;
			start: number;
			type: "reading";
	  }
	| {
			end: number;
			fromSceneId: string | null;
			index: number;
			length: number;
			start: number;
			toSceneId: string;
			/** The outgoing and incoming sides may enable their bridge tracks independently. */
			incomingBridgeEnabled?: boolean;
			outgoingBridgeEnabled?: boolean;
			phase?: "bridge" | "opening";
			type: "transition";
	  };

export type SnapPoint = {
	sceneId: string;
	keyframeId: string;
	direction?: TaleSceneSnapDirection;
	id: string;
	mode: TaleSceneSnapMode;
	scroll: number;
	settings?: TaleSceneSnapSettings | null;
	transitionEnd?: number;
	transitionStart?: number;
	type:
		| "scene-end"
		| "scene-start"
		| "step-end"
		| "step-start"
		| "element-end"
		| "element-start"
		| "choice-end";
};

export type ReaderScrollTargetOptions = {
	atChoiceEnd?: boolean;
	duration?: number;
	motion?: "instant" | "reading" | "travel";
	onComplete?: () => void;
};

export type CompiledReader = {
	anchorIndexBySceneId: Record<string, number>;
	anchors: Anchor[];
	contents: ReaderContentsPart[];
	entries: ReaderContentsEntry[];
	entryIndexById: Record<string, number>;
	heldPreviousTakeoverSceneIdByAnchorIndex: Array<string | null>;
	openingTransitionAnchor: Anchor | null;
	pageIndexById: Record<string, number>;
	pages: ReaderContentsPage[];
	previousVisibleSceneIdsByEnteringSceneId: Record<string, string[]>;
	segmentIndexBySceneId: Record<string, number>;
	segmentIndexByKeyframeId: Record<string, number>;
	segments: TimelineSegment[];
	segmentStarts: number[];
	snapConfig: TaleSnapConfig;
	snapPoints: SnapPoint[];
	totalScroll: number;
	transitionIntoBySceneId: Record<string, number>;
	transitionOutOfBySceneId: Record<string, number>;
};

export type ReaderContentsEntry = {
	sceneIds: string[];
	keyframeIds: string[];
	chapterNumber: number | null;
	hasChoiceScene: boolean;
	id: string;
	partSpans: ReaderContentsEntryPartSpan[];
	pageIds: string[];
};

export type ReaderContentsEntryPartSpan = {
	endPageId: string;
	partId: string;
	pageCount: number;
	startPageId: string;
};

export type ReaderContentsPage = {
	sceneIds: string[];
	keyframeIds: string[];
	hasChoiceScene: boolean;
	id: string;
	number: number | null;
};

export type ReaderContentsPart = {
	entryIds: string[];
	id: string;
};

export type TaleAccessAction = "edit" | "read";

export type ReaderLocation = {
	sceneId: string;
	keyframeId: string;
	branchId: string;
	entryId: string;
	pageId: string;
	partId: string;
	segmentIndex: number;
};

export type TaleInspectorTarget =
	| {
			id: string;
			initialTab?:
				| "layout"
				| "elements"
				| "motion"
				| "size"
				| "style"
				| "summary"
				| "narrative";
			returnTarget?: TaleInspectorTarget;
			type: "scene";
	  }
	| {
			sceneId: string;
			id: string;
			initialTab?: "content" | "motion" | "placement" | "style" | "summary";
			returnTarget?: TaleInspectorTarget;
			type: "element";
	  }
	| {
			sceneId: string;
			id: string;
			initialTab?:
				| "elements"
				| "keyframes"
				| "motion"
				| "style"
				| "summary"
				| "narrative";
			returnTarget?: TaleInspectorTarget;
			type: "frame";
	  }
	| {
			sceneId: string;
			id: string;
			initialTab?: "actions" | "details" | "page" | "progression";
			returnTarget?: TaleInspectorTarget;
			type: "keyframe";
	  };

export type SavedReaderProgress = {
	sceneId: string | null;
	keyframeId: string | null;
	committedAnimationIds: string[];
	id?: number;
	innerProgress: number;
	selectedBranchIds: string[];
	seenSceneIds: string[];
	seenKeyframeIds: string[];
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

export type TaleSceneResponsiveOverride = Partial<
	Pick<
		TaleScene,
		| "articleStyle"
		| "description"
		| "container"
		| "frameIds"
		| "reading"
		| "rootFrameId"
		| "size"
		| "style"
		| "title"
		| "transition"
	>
>;

export type TaleElementResponsiveOverride = Partial<
	Pick<
		TaleElement,
		| "alt"
		| "animations"
		| "attribution"
		| "caption"
		| "fallbackSrc"
		| "imageStyle"
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
