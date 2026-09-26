import type { FrameActiveLengthConfig } from "~/app/(tale-app)/_shared/types";

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

export type ReaderSpacing = {
	unit: ReaderSizeUnit;
	value: number;
};

export type PreviousScenesDuringEnter =
	| "fadeActivePrevious"
	| "fadeAllVisiblePrevious"
	| "customAllVisiblePrevious"
	| "keep";

export type CameraPathPoint = { x: number; y: number };

export type SceneCameraPath =
	| { mode: "auto" }
	| { mode: "reverseFlow" }
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
	tracks: AnimationTrack[];
	durationSeconds?: number;
	applyInitialStateBeforeStart?: boolean;
	carryEndStateForward?: boolean;
};

export type AmbientAnimationSelection = AnimationSelection & {
	cycleDurationMs?: number;
	endFrameId?: string | null;
	playback?: "alternate" | "restart";
	startFrameId?: string | null;
};

export type TimelineRange = { end: number; start: number };

export type ScrollAnimationPlayback = "commitOnComplete" | "scrub";

export type ReaderStyleConfig = {
	alignContent?:
		| "center"
		| "end"
		| "space-around"
		| "space-between"
		| "space-evenly"
		| "start"
		| "stretch";
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
	fontSize?: string | number;
	fontWeight?: string | number;
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
	height?: string | number;
	justifyItems?: "center" | "end" | "start" | "stretch";
	justifySelf?: "auto" | "center" | "end" | "start" | "stretch";
	justifyContent?:
		| "center"
		| "end"
		| "space-around"
		| "space-between"
		| "space-evenly"
		| "start";
	alignItems?: "center" | "end" | "start" | "stretch";
	margin?: string | number;
	lineHeight?: string | number;
	maxHeight?: string | number;
	maxWidth?: string | number;
	minHeight?: string | number;
	minWidth?: string | number;
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	objectPosition?: string;
	opacity?: number;
	order?: number;
	overflow?: "clip" | "hidden" | "visible";
	padding?: string | number;
	paddingBlock?: string | number;
	paddingInline?: string | number;
	rowGap?: number | string;
	alignSelf?: "auto" | "center" | "end" | "start" | "stretch";
	textAlign?: "center" | "end" | "justify" | "left" | "right" | "start";
	width?: string | number;
	zIndex?: number;
};

export type ReaderSizeMode = "contentResponsive" | "fixed";

export type ReaderSizeUnit = "px" | "viewport";

export type ReaderSizeConfig = {
	height?: { unit: ReaderSizeUnit; value: number };
	horizontalAlignment?: "auto" | "center" | "left" | "right";
	maxHeight?: { unit: ReaderSizeUnit; value: number };
	maxWidth?: { unit: ReaderSizeUnit; value: number };
	minHeight?: { unit: ReaderSizeUnit; value: number };
	minWidth?: { unit: ReaderSizeUnit; value: number };
	verticalAlignment?: "auto" | "bottom" | "center" | "top";
	width?: { unit: ReaderSizeUnit; value: number };
};

export type ReadingConfig = {
	animationConfig: {
		ambient: AmbientAnimationSelection;
		hover?: HoverAnimationSelection;
		sceneActive?: AnimationSelection;
		sceneActiveLoop?: AmbientAnimationSelection;
		active: AnimationSelection;
		activeLoop?: AmbientAnimationSelection;
	};
	autoplay?: import("~/app/(tale-app)/_shared/types").TaleSceneAutoplayConfig;
	cameraPath?: SceneCameraPath;
	pauses?: {
		atEnd?: number;
		atStart?: number;
	};
	activeLength: number | null;
	activeLengthMode: "content" | "manual";
	transition?: {
		introLength: number | null;
		outroLength: number | null;
	};
};

export type BlockSnapMode = "scroll-snap" | "snap" | "snap-off";
export type BlockSnapDirection = "both" | "fromNext" | "fromPrevious";
export type BlockSnapStrategy = "separate" | "shared";

export type BlockSnapSettings = {
	captureDistancePx?: number | null;
	durationSeconds?: number | null;
	delayMs?: number | null;
	minViewportFraction?: number | null;
};

export type BlockSnapBehavior = {
	mode: BlockSnapMode;
	settings?: BlockSnapSettings | null;
};

export type BlockSnapConfig = BlockSnapBehavior & {
	backward?: BlockSnapBehavior;
	direction?: BlockSnapDirection;
	forward?: BlockSnapBehavior;
	strategy?: BlockSnapStrategy;
};

export type TransitionConfig = {
	animationConfig: {
		intro: AnimationSelection;
		introLoop?: AmbientAnimationSelection;
		outro: AnimationSelection;
		outroLoop?: AmbientAnimationSelection;
		previousBridge?: AnimationSelection;
		previousBridgeLoop?: AmbientAnimationSelection;
		nextBridge?: AnimationSelection;
		nextBridgeLoop?: AmbientAnimationSelection;
		previousVisible?: AnimationSelection;
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
	previousScenesDuringEnter?: PreviousScenesDuringEnter;
	snap?: BlockSnapConfig;
};

export type FrameChild =
	| { elementId: string; type: "element" }
	| { frameId: string; type: "frame" };

export type ReaderFrameConfig = {
	defaultElementStates?: Record<string, "active" | "inactive">;
	kind?: "frame" | "group";
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
	visibleBeforeIntro?: boolean;
	visibleBeforeFrameIntro?: boolean;
	visibleDuringSceneIntro?: boolean;
	visibleDuringSceneOutro?: boolean;
	visibleDuringPreviousBridge?: boolean;
	visibleDuringNextBridge?: boolean;
} & (
	| {
			align?: "center" | "end" | "start" | "stretch";
			children: FrameChild[];
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "stack";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyleConfig;
	  }
	| {
			align?: "center" | "end" | "start" | "stretch";
			children: FrameChild[];
			direction?: "column" | "column-reverse" | "row" | "row-reverse";
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "flex";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyleConfig;
			wrap?: boolean;
	  }
	| {
			children: FrameChild[];
			columns?: number;
			gap?: number;
			id: string;
			mode: "grid";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			rows?: number;
			style?: ReaderStyleConfig;
	  }
	| {
			children: FrameChild[];
			id: string;
			mode: "free";
			overflow?: "clip" | "visible";
			parentFrameId: string | null;
			style?: ReaderStyleConfig;
	  }
);

export type FrameAnimationConfig = ElementAnimationConfig;

export type KeyframeActionConfig = {
	id: string;
	animationTarget?: "children" | "self";
	type: import("~/app/(tale-app)/_shared/types").KeyframeAction["type"];
	targetId: string;
	targetType: "element" | "frame";
	animation?: AnimationSelection;
};

export type FrameConfig = ReaderFrameConfig;

export type ElementPlacementConfig =
	| {
			mode: "normal";
			frameId?: string;
			overflow?: "clip" | "visible";
	  }
	| {
			horizontal: "center" | "left" | "right";
			mode: "absolute" | "fixed";
			frameId?: string;
			overflow?: "clip" | "visible";
			unit: ReaderSizeUnit;
			vertical: "bottom" | "center" | "top";
			width?: number;
			x: number;
			y: number;
			zIndex?: number;
	  };

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

export type HoverAnimationSelection = {
	tracks: AnimationTrack[];
	durationSeconds?: number;
};

export type PresetTarget = "block" | "both" | "fragment";
