export type Direction =
	| "down"
	| "down-left"
	| "down-right"
	| "left"
	| "right"
	| "up"
	| "up-left"
	| "up-right";

export type BlockFlow =
	| {
			direction: Direction;
			spacing?: ReaderSpacing;
			type: "linear";
	  }
	| { type: "stack" };

export type ReaderSpacing = {
	unit: ReaderSizeUnit;
	value: number;
};

export type CameraPathPoint = { x: number; y: number };

export type BlockCameraPath =
	| { mode: "auto" }
	| { mode: "reverseFlow" }
	| { direction: Direction; mode: "straight" }
	| { mode: "custom"; points: CameraPathPoint[] };

export type AnimationTrack =
	| {
			end: number;
			from: number;
			property: "opacity";
			start: number;
			to: number;
	  }
	| {
			end: number;
			from: number;
			property: "rotate" | "scale";
			start: number;
			to: number;
	  }
	| {
			axis: "x" | "y";
			end: number;
			from: number;
			property: "translate";
			start: number;
			to: number;
	  }
	| {
			end: number;
			property: "blur" | "glitch";
			start: number;
			strength: number;
	  };

export type AnimationSelection = {
	tracks: AnimationTrack[];
};

export type TimelineRange = { end: number; start: number };

export type ReaderStyleConfig = {
	backgroundCss?: string;
	backgroundImage?: string;
	border?: string;
	borderRadius?: number;
	boxShadow?: string;
	color?: string;
	cssText?: string;
	display?: "block" | "flex" | "grid" | "inline-block";
	flexDirection?: "column" | "row";
	flexWrap?: "nowrap" | "wrap";
	fontSize?: string | number;
	fontWeight?: string | number;
	gap?: number;
	gridArea?: string;
	gridColumn?: string;
	gridRow?: string;
	gridTemplateAreas?: string;
	gridTemplateColumns?: string;
	gridTemplateRows?: string;
	height?: string | number;
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
	overflow?: "clip" | "hidden" | "visible";
	padding?: string | number;
	textAlign?: "center" | "end" | "justify" | "left" | "right" | "start";
	width?: string | number;
	zIndex?: number;
};

export type ReaderSizeMode = "contentResponsive" | "fixed";

export type ReaderSizeUnit = "px" | "viewport";

export type ReaderSizeConfig = {
	height?: { unit: ReaderSizeUnit; value: number };
	horizontalAlignment?: "center" | "left" | "right";
	maxHeight?: { unit: ReaderSizeUnit; value: number };
	maxWidth?: { unit: ReaderSizeUnit; value: number };
	minHeight?: { unit: ReaderSizeUnit; value: number };
	minWidth?: { unit: ReaderSizeUnit; value: number };
	verticalAlignment?: "bottom" | "center" | "top";
	width?: { unit: ReaderSizeUnit; value: number };
};

export type ReadingConfig = {
	animationConfig: {
		entering: AnimationSelection;
		leaving: AnimationSelection;
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
	};
	enteringLength: number;
	flow: BlockFlow;
	leavingLength: number;
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
			direction?: "column" | "row";
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

export type NodeConfig = ReaderNodeConfig;

export type FragmentPlacementConfig =
	| {
			mode: "normal";
			nodeId?: string;
			overflow?: "clip" | "visible";
	  }
	| {
			horizontal: "left" | "right";
			mode: "absolute" | "fixed";
			nodeId?: string;
			overflow?: "clip" | "visible";
			unit: ReaderSizeUnit;
			vertical: "top" | "bottom";
			width?: number;
			x: number;
			y: number;
			zIndex?: number;
	  };

export type FragmentAnimationConfig = {
	entering: AnimationSelection;
	leaving: AnimationSelection;
	scrolling: AnimationSelection;
};

export type ScrollAnimationPlayback = "commitOnComplete" | "scrub";

export type PresetTarget = "block" | "both" | "fragment";
