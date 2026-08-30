"use client";

import { useEffect } from "react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

const edgeCapturePx = 24;
const openDistancePx = 56;

/** Opens mobile reader panels from deliberate inward edge swipes. */
export function ReaderMobileEdgeGestures(): null {
	const { contentsOpen, hubOpen, layout, toggleContents, toggleHub } =
		useTaleReaderStoreShallow((state) => ({
			contentsOpen: state.derived.readerContentsOpen,
			hubOpen: state.derived.isHubOpen,
			layout: state.derived.viewportLayout,
			toggleContents: state.contents.toggleOpen,
			toggleHub: state.hub.toggleOpen,
		}));

	useEffect(() => {
		if (layout === "desktop") return;
		let start: { edge: "left" | "right"; x: number; y: number } | null = null;
		const onTouchStart = (event: TouchEvent): void => {
			const touch = event.touches[0];
			if (!touch) return;
			if (touch.clientX <= edgeCapturePx) {
				start = { edge: "left", x: touch.clientX, y: touch.clientY };
			} else if (touch.clientX >= window.innerWidth - edgeCapturePx) {
				start = { edge: "right", x: touch.clientX, y: touch.clientY };
			}
		};
		const onTouchEnd = (event: TouchEvent): void => {
			const gesture = start;
			start = null;
			const touch = event.changedTouches[0];
			if (!gesture || !touch) return;
			const deltaX = touch.clientX - gesture.x;
			const deltaY = touch.clientY - gesture.y;
			if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
			if (gesture.edge === "left" && deltaX >= openDistancePx) {
				if (!contentsOpen) toggleContents();
				return;
			}
			if (gesture.edge === "right" && deltaX <= -openDistancePx && !hubOpen) {
				toggleHub();
			}
		};
		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchend", onTouchEnd);
		};
	}, [contentsOpen, hubOpen, layout, toggleContents, toggleHub]);

	return null;
}
