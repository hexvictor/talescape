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
			placement?: "blockEdge" | "blockEdgeWithViewportAlignment" | "cameraEdge";
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

export type PreviousBlocksDuringEnter =
	| "fadeActivePrevious"
	| "fadeAllVisiblePrevious"
	| "customAllVisiblePrevious"
	| "keep";

export type CameraPathPoint = { x: number; y: number };

export type BlockCameraPath =
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
};

export type AmbientAnimationSelection = AnimationSelection & {
	cycleDurationMs?: number;
	playback?: "alternate" | "restart";
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
		scrolling: AnimationSelection;
	};
	cameraPath?: BlockCameraPath;
	pauses?: {
		atEnd?: number;
		atStart?: number;
	};
	readingLength: number | null;
	readingLengthMode: "content" | "manual";
};

export type TransitionConfig = {
	animationConfig: {
		entering: AnimationSelection;
		leaving: AnimationSelection;
		previousVisible?: AnimationSelection;
	};
	enteringLength: number | null;
	flow: BlockFlow;
	leavingLength: number | null;
	previousBlocksDuringEnter?: PreviousBlocksDuringEnter;
};

export type NodeChild =
	| { fragmentId: string; type: "fragment" }
	| { nodeId: string; type: "node" };

export type ReaderNodeConfig =
	| {
			align?: "center" | "end" | "start" | "stretch";
			children: NodeChild[];
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "stack";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyleConfig;
	  }
	| {
			align?: "center" | "end" | "start" | "stretch";
			children: NodeChild[];
			direction?: "column" | "column-reverse" | "row" | "row-reverse";
			gap?: number;
			id: string;
			justify?: "center" | "end" | "space-between" | "start";
			mode: "flex";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyleConfig;
			wrap?: boolean;
	  }
	| {
			children: NodeChild[];
			columns?: number;
			gap?: number;
			id: string;
			mode: "grid";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			rows?: number;
			style?: ReaderStyleConfig;
	  }
	| {
			children: NodeChild[];
			id: string;
			mode: "free";
			overflow?: "clip" | "visible";
			parentNodeId: string | null;
			style?: ReaderStyleConfig;
	  };

export type NodeAnimationConfig = FragmentAnimationConfig;

export type NodeConfig = ReaderNodeConfig;

export type FragmentPlacementConfig =
	| {
			mode: "normal";
			nodeId?: string;
			overflow?: "clip" | "visible";
	  }
	| {
			horizontal: "center" | "left" | "right";
			mode: "absolute" | "fixed";
			nodeId?: string;
			overflow?: "clip" | "visible";
			unit: ReaderSizeUnit;
			vertical: "bottom" | "center" | "top";
			width?: number;
			x: number;
			y: number;
			zIndex?: number;
	  };

export type FragmentAnimationConfig = {
	ambient: AmbientAnimationSelection;
	entering: AnimationSelection;
	leaving: AnimationSelection;
	scrolling: AnimationSelection;
};

export type PresetTarget = "block" | "both" | "fragment";
