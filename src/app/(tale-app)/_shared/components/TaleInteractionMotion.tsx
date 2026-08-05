"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import type { FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const interactiveSelector = [
	"button",
	"a[href]",
	'input:not([type="hidden"])',
	"select",
	"textarea",
	'[role="button"]',
	'[role="tab"]',
	'[role="switch"]',
	'[role="slider"]',
	'[role="menuitem"]',
	'[role="option"]',
	'[role="checkbox"]',
	'[role="radio"]',
	"label[for]",
	"summary",
].join(",");

const buttonLikeSelector = [
	"button",
	"a[href]",
	'[role="button"]',
	'[role="tab"]',
	'[role="menuitem"]',
	'[role="option"]',
	'[role="switch"]',
	'[role="checkbox"]',
	'[role="radio"]',
	"label[for]",
	"summary",
].join(",");

type TaleInteractionMotionProps = {
	children: ReactNode;
};

type InteractionTooltip = {
	label: string;
	left: number;
	placement: "above" | "below";
	top: number;
};

function getInteractiveElement(target: EventTarget | null): HTMLElement | null {
	if (!(target instanceof Element)) return null;
	const interactive = target.closest<HTMLElement>(interactiveSelector);
	if (
		!interactive ||
		interactive.matches(":disabled") ||
		interactive.getAttribute("aria-disabled") === "true" ||
		interactive.dataset.motionFeedback === "off"
	) {
		return null;
	}
	return interactive;
}

function movedWithinElement(
	element: HTMLElement,
	relatedTarget: EventTarget | null,
): boolean {
	return relatedTarget instanceof Node && element.contains(relatedTarget);
}

function getTooltipLabel(element: HTMLElement): string | null {
	const explicitLabel = element.dataset.tooltip?.trim();
	if (explicitLabel) return explicitLabel;
	if (element.hasAttribute("title")) return null;
	return element.getAttribute("aria-label")?.trim() || null;
}

/**
 * Adds consistent, transform-safe interaction feedback across tale tools.
 *
 * @param props - Tale application content.
 * @returns A transparent event boundary for reader and editor controls.
 */
export function TaleInteractionMotion({
	children,
}: TaleInteractionMotionProps): React.JSX.Element {
	const reduceMotion = useReducedMotion();
	const rootRef = useRef<HTMLDivElement | null>(null);
	const lastPointerDownAtRef = useRef(0);
	const tooltipTimerRef = useRef<number | null>(null);
	const tooltipTargetRef = useRef<HTMLElement | null>(null);
	const [tooltip, setTooltip] = useState<InteractionTooltip | null>(null);

	const setFeedback = (
		element: HTMLElement,
		scale: number,
		duration = 0.08,
	): void => {
		if (reduceMotion) {
			element.style.setProperty("--tale-interaction-scale", "1");
			return;
		}
		animate(
			element,
			{ "--tale-interaction-scale": scale },
			{ duration, ease: "easeOut" },
		);
	};
	const settle = (element: HTMLElement, hovered: boolean): void => {
		const hoverScale = element.matches(buttonLikeSelector) ? 1.025 : 1.01;
		setFeedback(element, hovered ? hoverScale : 1, 0.09);
	};
	const clearTooltipTimer = (): void => {
		window.clearTimeout(tooltipTimerRef.current ?? undefined);
		tooltipTimerRef.current = null;
	};
	const hideTooltip = (): void => {
		clearTooltipTimer();
		tooltipTargetRef.current = null;
		setTooltip(null);
	};
	const queueTooltip = (element: HTMLElement, delay = 220): void => {
		const label = getTooltipLabel(element);
		if (!label) return;
		clearTooltipTimer();
		tooltipTargetRef.current = element;
		tooltipTimerRef.current = window.setTimeout(() => {
			if (tooltipTargetRef.current !== element || !element.isConnected) return;
			const bounds = element.getBoundingClientRect();
			const halfTooltipWidth = Math.min(144, (window.innerWidth - 24) / 2);
			const left = Math.max(
				12 + halfTooltipWidth,
				Math.min(
					window.innerWidth - 12 - halfTooltipWidth,
					bounds.left + bounds.width / 2,
				),
			);
			const placement = bounds.top >= 52 ? "above" : "below";
			setTooltip({
				label,
				left,
				placement,
				top: placement === "above" ? bounds.top - 7 : bounds.bottom + 7,
			});
		}, delay);
	};

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const initializeInteractiveElement = (element: HTMLElement): void => {
			if (element.dataset.taleMotionTarget === "true") return;
			element.dataset.taleMotionTarget = "true";
			element.style.setProperty("--tale-interaction-scale", "1");
		};
		for (const interactive of root.querySelectorAll<HTMLElement>(
			interactiveSelector,
		)) {
			initializeInteractiveElement(interactive);
		}
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (!(node instanceof HTMLElement)) continue;
					if (node.matches(interactiveSelector)) {
						initializeInteractiveElement(node);
					}
					for (const interactive of node.querySelectorAll<HTMLElement>(
						interactiveSelector,
					)) {
						initializeInteractiveElement(interactive);
					}
				}
			}
		});
		observer.observe(root, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			window.clearTimeout(tooltipTimerRef.current ?? undefined);
		};
	}, []);

	return (
		<div
			ref={rootRef}
			data-reader-component="TaleInteractionMotion"
			data-reader-role="interaction-feedback-boundary"
			data-tale-interaction-surface="true"
			className="contents"
			onPointerOverCapture={(event: PointerEvent<HTMLDivElement>) => {
				const element = getInteractiveElement(event.target);
				if (!element || movedWithinElement(element, event.relatedTarget))
					return;
				settle(element, true);
				if (event.pointerType !== "touch") queueTooltip(element);
			}}
			onPointerOutCapture={(event: PointerEvent<HTMLDivElement>) => {
				const element = getInteractiveElement(event.target);
				if (!element || movedWithinElement(element, event.relatedTarget))
					return;
				settle(element, false);
				hideTooltip();
			}}
			onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
				lastPointerDownAtRef.current = performance.now();
				const element = getInteractiveElement(event.target);
				if (element) {
					hideTooltip();
					setFeedback(element, 0.98, 0.05);
				}
			}}
			onPointerUpCapture={(event: PointerEvent<HTMLDivElement>) => {
				const element = getInteractiveElement(event.target);
				if (element) settle(element, element.matches(":hover"));
			}}
			onFocusCapture={(event: FocusEvent<HTMLDivElement>) => {
				const element = getInteractiveElement(event.target);
				if (element) {
					settle(element, true);
					if (performance.now() - lastPointerDownAtRef.current > 100) {
						queueTooltip(element, 120);
					}
				}
			}}
			onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
				const element = getInteractiveElement(event.target);
				if (element) {
					settle(element, false);
					hideTooltip();
				}
			}}
			onKeyDownCapture={(event: KeyboardEvent<HTMLDivElement>) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				const element = getInteractiveElement(event.target);
				if (element) {
					setFeedback(element, 0.98, 0.05);
				}
			}}
			onKeyUpCapture={(event: KeyboardEvent<HTMLDivElement>) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				const element = getInteractiveElement(event.target);
				if (element) settle(element, true);
			}}
		>
			{children}
			{tooltip ? (
				<div
					data-reader-component="TaleInteractionMotion"
					data-reader-role="interaction-tooltip-positioner"
					className="pointer-events-none fixed z-2000"
					style={{
						left: tooltip.left,
						top: tooltip.top,
						transform: `translate(-50%, ${tooltip.placement === "above" ? "-100%" : "0"})`,
					}}
				>
					<motion.div
						role="tooltip"
						data-reader-component="TaleInteractionTooltip"
						data-reader-role="interaction-tooltip"
						className="max-w-[min(18rem,calc(100vw-1.5rem))] whitespace-normal rounded-md border border-foreground/14 bg-popover/96 px-2.5 py-1.5 text-center font-medium text-popover-foreground text-xs shadow-xl backdrop-blur-md"
						initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.08, ease: "easeOut" }}
					>
						{tooltip.label}
					</motion.div>
				</div>
			) : null}
		</div>
	);
}
