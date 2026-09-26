import { describe, expect, it } from "vitest";
import type {
	CompiledReader,
	Tale,
	TaleFrame,
	TimelineSegment,
} from "../types";
import {
	compileReaderAnimationPlan,
	createAnimationValues,
	evaluateBlockAnimation,
	evaluateElementAnimation,
	evaluateNodeAnimation,
} from "./readerAnimations";

const transitionIn: TimelineSegment = {
	end: 100,
	fromSceneId: null,
	index: 0,
	length: 100,
	start: 0,
	toSceneId: "scene-1",
	type: "transition",
};
const previousBridgeIn: TimelineSegment = {
	end: 100,
	fromSceneId: "scene-0",
	incomingBridgeEnabled: true,
	index: 0,
	length: 100,
	outgoingBridgeEnabled: true,
	phase: "bridge",
	start: 0,
	toSceneId: "scene-1",
	type: "transition",
};
const frameEnter: TimelineSegment = {
	cameraProgress: 0,
	end: 200,
	index: 2,
	length: 100,
	pauseType: "frame-enter",
	sceneId: "scene-1",
	start: 100,
	keyframeId: "step-1",
	type: "pause",
};

const sceneIntro: TimelineSegment = {
	cameraProgress: 0,
	end: 200,
	index: 2,
	keyframeId: "scene-1:scene-intro",
	length: 100,
	pauseType: "frame-enter",
	phaseOwner: "scene",
	sceneId: "scene-1",
	start: 100,
	type: "pause",
};

const frameIntro: TimelineSegment = {
	cameraProgress: 0,
	end: 100,
	frameId: "frame-1",
	framePhase: "intro",
	index: 1,
	keyframeId: "step-1",
	length: 100,
	pauseType: "frame-enter",
	phaseOwner: "frame",
	sceneId: "scene-1",
	start: 0,
	type: "pause",
};

const previousFrameBridge: TimelineSegment = {
	cameraProgress: 0,
	end: 100,
	framePhase: "bridge",
	fromFrameId: "frame-0",
	index: 1,
	keyframeId: "step-1",
	length: 100,
	pauseType: "frame-enter",
	phaseOwner: "frame",
	sceneId: "scene-1",
	start: 0,
	toFrameId: "frame-1",
	type: "pause",
};

const frameReading: TimelineSegment = {
	cameraProgressEnd: 0.5,
	cameraProgressStart: 0,
	end: 300,
	index: 3,
	length: 100,
	sceneId: "scene-1",
	start: 200,
	keyframeId: "step-1",
	type: "reading",
};
const frameLeave: TimelineSegment = {
	cameraProgress: 0.5,
	end: 400,
	index: 4,
	length: 100,
	pauseType: "frame-leave",
	sceneId: "scene-1",
	start: 300,
	keyframeId: "step-1",
	type: "pause",
};
const nextFrameReading: TimelineSegment = {
	cameraProgressEnd: 1,
	cameraProgressStart: 0.5,
	end: 500,
	index: 5,
	length: 100,
	sceneId: "scene-1",
	start: 400,
	keyframeId: "step-2",
	type: "reading",
};

describe("Frame animation phase states", () => {
	it("finishes legacy show actions before active progression and applies Frame active tracks", () => {
		const { plan } = createFixture();
		const animation = plan.nodeAnimationsById.get("frame-1");
		if (!animation) throw new Error("Missing frame animation plan");
		const tracks = animation.intro;
		plan.nodeKeyframes.set("frame-1", [
			{ id: "step-1", state: "show", tracks },
		]);
		const values = createAnimationValues();
		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			0.25,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBe(1);
		animation.active = tracks;
		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			0.25,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(0.25);
	});
	it("runs a Frame intro only during its explicit Frame phase", () => {
		const { plan } = createFixture();
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameIntro,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(0.5);

		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameEnter,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBe(1);
	});

	it("holds the intro initial state throughout the parent Scene transition", () => {
		const { plan } = createFixture();
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			transitionIn,
			"scene-1",
			0.75,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBe(0);
	});

	it("plays child scene arrival transitions during the parent Scene transition", () => {
		const { plan } = createFixture({ sceneChildTransition: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			transitionIn,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.4);
	});

	it("keeps previous bridge tracks separate from Scene intro tracks", () => {
		const { plan } = createFixture({ bridgeChildTransition: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			previousBridgeIn,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.3);
	});

	it("shows bridge-enabled Frames at their base appearance without tracks", () => {
		const { plan } = createFixture({ bridgeVisible: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			previousBridgeIn,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBe(1);
	});

	it("carries the previous bridge end state into Scene intro", () => {
		const { plan, tale } = createFixture({ sceneBridgeCarry: true });
		const values = createAnimationValues();

		evaluateBlockAnimation(
			plan,
			tale,
			"scene-1",
			sceneIntro,
			0,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.4);
	});

	it("runs Scene active tracks across the complete Scene active span", () => {
		const { plan, tale } = createFixture({ sceneActive: true });
		const values = createAnimationValues();

		evaluateBlockAnimation(
			plan,
			tale,
			"scene-1",
			frameReading,
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.5);
	});

	it("keeps Frame bridge tracks separate from Scene bridge tracks", () => {
		const { plan } = createFixture({
			bridgeChildTransition: true,
			frameBridgeTransition: true,
		});
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			previousFrameBridge,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.45);
	});

	it("keeps the completed outro state after the next Frame becomes active", () => {
		const { plan } = createFixture();
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			nextFrameReading,
			"scene-1",
			0.4,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBe(0);
	});

	it("carries an intro end value into the active phase", () => {
		const { plan } = createFixture({ carryEntering: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			0,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(0.25);

		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			1,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(0.5);
	});

	it("evaluates nested Element animation from keyframe actions", () => {
		const { plan } = createFixture({ elementProgression: true });
		const values = createAnimationValues();

		evaluateElementAnimation(
			plan,
			"element-1",
			frameEnter,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(0.875);

		evaluateElementAnimation(
			plan,
			"element-1",
			frameReading,
			"scene-1",
			0.875,
			new Set(),
			0,
			values,
		);
		expect(values.opacity).toBeCloseTo(1);
	});

	it("runs an Element Frame intro only when both visibility gates are enabled", () => {
		const { plan } = createFixture({ frameChildTransition: true });
		const values = createAnimationValues();

		evaluateElementAnimation(
			plan,
			"element-1",
			frameIntro,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBeCloseTo(0.35);
	});

	it("keeps one Frame active across all of its ordered Keyframes", () => {
		const { plan } = createFixture({ frameSecondKeyframe: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			nextFrameReading,
			"scene-1",
			0.5,
			new Set(),
			0,
			values,
		);

		expect(values.opacity).toBe(1);
	});

	it("plays hover tracks by elapsed duration instead of scroll progress", () => {
		const { plan } = createFixture({ hover: true });
		const values = createAnimationValues();

		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			0.8,
			new Set(),
			100,
			values,
			true,
		);
		evaluateNodeAnimation(
			plan,
			"frame-1",
			frameReading,
			"scene-1",
			0.8,
			new Set(),
			200,
			values,
			true,
		);

		expect(values.scale).toBeCloseTo(1.1);
	});
});

function createFixture(options?: {
	bridgeChildTransition?: boolean;
	bridgeVisible?: boolean;
	carryEntering?: boolean;
	elementProgression?: boolean;
	frameBridgeTransition?: boolean;
	frameChildTransition?: boolean;
	frameSecondKeyframe?: boolean;
	hover?: boolean;
	sceneActive?: boolean;
	sceneBridgeCarry?: boolean;
	sceneChildTransition?: boolean;
}) {
	const frame: TaleFrame = {
		animations: {
			ambient: { animations: [] },
			previousFrameBridge: options?.frameBridgeTransition
				? {
						animations: [
							{
								easing: "linear",
								end: 1,
								from: 0,
								property: "opacity",
								start: 0,
								to: 0.9,
							},
						],
					}
				: undefined,
			previousBridge: options?.bridgeChildTransition
				? {
						animations: [
							{
								easing: "linear",
								end: 1,
								from: 0,
								property: "opacity",
								start: 0,
								to: 0.6,
							},
						],
					}
				: undefined,
			sceneIntro: options?.sceneChildTransition
				? {
						animations: [
							{
								easing: "linear",
								end: 1,
								from: 0,
								property: "opacity",
								start: 0,
								to: 0.8,
							},
						],
					}
				: undefined,
			intro: {
				animations: [
					{
						easing: "linear",
						end: 1,
						from: 0,
						property: "opacity",
						start: 0,
						to: options?.carryEntering ? 0.25 : 1,
					},
				],
				applyInitialStateBeforeStart: true,
				carryEndStateForward: options?.carryEntering ?? false,
			},
			outro: {
				animations: [
					{
						easing: "linear",
						end: 1,
						from: 1,
						property: "opacity",
						start: 0,
						to: 0,
					},
				],
			},
			hover: options?.hover
				? {
						animations: [
							{
								easing: "linear",
								end: 1,
								from: 1,
								property: "scale",
								start: 0,
								to: 1.2,
							},
						],
						durationSeconds: 0.2,
					}
				: undefined,
			active: {
				animations: options?.carryEntering
					? [
							{
								easing: "linear",
								end: 1,
								from: 0,
								property: "opacity",
								start: 0,
								to: 0.5,
							},
						]
					: [],
			},
		},
		children: [],
		id: "frame-1",
		mode: "stack",
		parentFrameId: null,
		transition: {
			introEnabled: true,
			introLength: 100,
			outroEnabled: true,
			outroLength: 100,
		},
		visibleDuringPreviousBridge:
			options?.bridgeChildTransition || options?.bridgeVisible,
		visibleDuringFrameIntro: options?.frameChildTransition,
		visibleDuringSceneIntro: options?.sceneChildTransition,
	};
	const segments = [
		transitionIn,
		frameIntro,
		frameEnter,
		frameReading,
		frameLeave,
		nextFrameReading,
	];
	const compiled = {
		anchors: [{ sceneId: "scene-1" }],
		segments,
	} as unknown as CompiledReader;
	const tale = {
		indexMap: {
			elementsById:
				options?.elementProgression || options?.frameChildTransition
					? {
							"element-1": {
								animations: {
									ambient: { animations: [] },
									frameIntro: options?.frameChildTransition
										? {
												animations: [
													{
														easing: "linear",
														end: 1,
														from: 0,
														property: "opacity",
														start: 0,
														to: 0.7,
													},
												],
											}
										: undefined,
									intro: {
										animations: [
											{
												easing: "linear",
												end: 1,
												from: 0,
												property: "opacity",
												start: 0,
												to: 1,
											},
										],
									},
									outro: {
										animations: [
											{
												easing: "linear",
												end: 1,
												from: 1,
												property: "opacity",
												start: 0,
												to: 0,
											},
										],
									},
									active: { animations: [] },
								},
								frameId: "frame-1",
								id: "element-1",
								order: 0,
								resolvedVisibleRange: { end: 1, start: 0 },
								visibleDuringFrameIntro: options?.frameChildTransition,
							},
						}
					: {},
			framesById: { "frame-1": frame },
			scenesById: {
				"scene-1": {
					elementIds:
						options?.elementProgression || options?.frameChildTransition
							? ["element-1"]
							: [],
					frameIds: ["frame-1"],
					id: "scene-1",
					reading: {
						animations: {
							ambient: { animations: [] },
							sceneActive: options?.sceneActive
								? {
										animations: [
											{
												end: 1,
												from: 0,
												property: "opacity",
												start: 0,
												to: 1,
											},
										],
									}
								: undefined,
							active: { animations: [] },
						},
					},
					resolved: {
						readingAnimations: {
							ambient: [],
							ambientCycleDurationMs: 2400,
							ambientPlayback: "alternate",
							sceneActive: options?.sceneActive
								? [
										{
											easing: "linear",
											end: 1,
											from: 0,
											property: "opacity",
											start: 0,
											to: 1,
										},
									]
								: [],
							active: [],
						},
						transitionAnimations: {
							intro: [],
							outro: [],
							previousVisible: [],
						},
					},
					keyframeIds: ["step-1", "step-2"],
					transition: {
						animations: {
							intro: { animations: [] },
							outro: { animations: [] },
							previousBridge: options?.sceneBridgeCarry
								? {
										animations: [
											{
												easing: "linear",
												end: 1,
												from: 1,
												property: "opacity",
												start: 0,
												to: 0.4,
											},
										],
										carryEndStateForward: true,
									}
								: undefined,
							previousVisible: { animations: [] },
						},
					},
				},
			},
			keyframesById: {
				"step-1": {
					actions: options?.elementProgression
						? [
								{
									animation: {
										animations: [
											{
												end: 1,
												from: 0,
												property: "opacity",
												start: 0,
												to: 1,
											},
										],
									},
									id: "show-element-1",
									targetId: "element-1",
									targetType: "element",
									type: "intro",
								},
							]
						: [],
					frameId: "frame-1",
					id: "step-1",
				},
				"step-2": {
					actions: [],
					frameId: options?.frameSecondKeyframe ? "frame-1" : null,
					id: "step-2",
				},
			},
		},
	} as unknown as Tale;
	return {
		plan: compileReaderAnimationPlan(compiled, tale, {
			height: 800,
			width: 1200,
		}),
		tale,
	};
}
