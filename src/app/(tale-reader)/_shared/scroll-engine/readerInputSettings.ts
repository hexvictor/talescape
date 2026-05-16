"use client";

export type ReaderInputBindingSettings = {
	keyboardAccelerationPx: number;
	keyboardBaseStepPx: number;
	keyboardDuration: number;
	keyboardEase: gsap.EaseString;
	keyboardHoldIntervalMs: number;
	keyboardMaxStepPx: number;
	keyboardSustainedAccelerationDelayMs: number;
	keyboardSustainedAccelerationMultiplier: number;
	releaseThreshold: number;
	snapDuration: number;
	snapEase: gsap.EaseString;
	touchDragGentleDistancePx: number;
	touchDragGentleVelocityPxPerMs: number;
	touchDragScrollMultiplier: number;
	touchDragStopSnapDelayMs: number;
	wheelAccelerationPx: number;
	wheelBaseStepPx: number;
	wheelDuration: number;
	wheelEase: gsap.EaseString;
	wheelMaxStepPx: number;
	wheelSnapBypassBurstCount: number;
	wheelStopSnapDelayMs: number;
	wheelSustainedAccelerationDelayMs: number;
	wheelSustainedAccelerationMultiplier: number;
};

export const READER_INPUT_BINDING_SETTINGS: ReaderInputBindingSettings = {
	snapDuration: 0.38,
	snapEase: "power2.out",
	releaseThreshold: 24,
	touchDragGentleDistancePx: 180,
	touchDragGentleVelocityPxPerMs: 0.75,
	touchDragScrollMultiplier: 1,
	touchDragStopSnapDelayMs: 800,
	keyboardBaseStepPx: 7,
	wheelStopSnapDelayMs: 800,
	wheelSnapBypassBurstCount: 5,
	keyboardAccelerationPx: 35,
	keyboardSustainedAccelerationDelayMs: 2000,
	keyboardSustainedAccelerationMultiplier: 2.5,
	keyboardMaxStepPx: 1400,
	keyboardHoldIntervalMs: 60,
	keyboardDuration: 0.38,
	keyboardEase: "power2.out",
	wheelBaseStepPx: 12,
	wheelAccelerationPx: 85,
	wheelSustainedAccelerationDelayMs: 2000,
	wheelSustainedAccelerationMultiplier: 2.5,
	wheelMaxStepPx: 1400,
	wheelDuration: 0.38,
	wheelEase: "power2.out",
};
