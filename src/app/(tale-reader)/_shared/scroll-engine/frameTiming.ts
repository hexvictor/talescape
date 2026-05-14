"use client";

export function afterFrame(callback: () => void) {
	return window.requestAnimationFrame(callback);
}

export function afterTwoFrames(callback: () => void) {
	return afterFrame(() => {
		afterFrame(callback);
	});
}
