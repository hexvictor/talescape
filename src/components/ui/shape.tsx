"use client";

import {
	type CSSProperties,
	type ComponentProps,
	type ElementType,
	type Ref,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import cn from "~/lib/utils/cn";
import { type GeometryShape, geometryShapeTreatments } from "./geometry";
import {
	type ShapeConfiguration,
	type ShapeGeometry,
	compileShape,
} from "./shape-geometry";
import { createShapeMorph } from "./shape-morph";

export type ShapeOptions = {
	shapes?: ShapeConfiguration | GeometryShape;
	borderWidth?: number;
	borderColor?: string;
	shadow?: boolean;
	shadowColor?: string;
	shadowOffset?: number;
};
export type ShapeStyle = CSSProperties & {
	"--ts-geometry-clip-path"?: string;
	"--ts-geometry-inner-clip-path"?: string;
	"--ts-shape-shadow-color"?: string;
	"--ts-shape-shadow-offset"?: string;
};

export function useShapeGeometry(
	shapes?: ShapeConfiguration | GeometryShape,
	forwardedRef?: Ref<HTMLElement>,
	transitionDuration = 0,
) {
	const [element, setElement] = useState<HTMLElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const ref = useCallback(
		(node: HTMLElement | null) => {
			setElement(node);
			if (typeof forwardedRef === "function") return forwardedRef(node);
			if (forwardedRef) forwardedRef.current = node;
		},
		[forwardedRef],
	);
	const enabled = shapes !== undefined;
	useEffect(() => {
		if (!element || !enabled) return;
		const measure = () => {
			const width = element.offsetWidth;
			const height = element.offsetHeight;
			setSize((previous) =>
				previous.width === width && previous.height === height
					? previous
					: { width, height },
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [element, enabled]);
	const target = useMemo(
		() =>
			shapes && size.width && size.height
				? compileShape(
						typeof shapes === "string"
							? geometryShapeTreatments(shapes)
							: shapes,
						size.width,
						size.height,
					)
				: null,
		[shapes, size],
	);
	const [animated, setAnimated] = useState<ShapeGeometry | null>(null);
	const current = useRef<ShapeGeometry | null>(null);
	const previousSize = useRef(size);
	useEffect(() => {
		const previous = current.current;
		const resized =
			previousSize.current.width !== size.width ||
			previousSize.current.height !== size.height;
		previousSize.current = size;
		if (
			!target ||
			!previous ||
			!transitionDuration ||
			resized ||
			previous.path === target.path ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			current.current = target;
			setAnimated(target);
			return;
		}
		// Multiple islands cannot be represented by a single morph; preserve their exact outline.
		if (previous.rings.length !== 1 || target.rings.length !== 1) {
			current.current = target;
			setAnimated(target);
			return;
		}
		const morph = createShapeMorph(previous.path, target.path);
		let frame = 0;
		const start = performance.now();
		const draw = (now: number) => {
			const progress = Math.min(
				1,
				(now - start) / Math.max(1, transitionDuration),
			);
			const eased =
				progress < 0.5
					? 2 * progress * progress
					: 1 - (-2 * progress + 2) ** 2 / 2;
			const path = progress === 1 ? target.path : morph(eased);
			const next = { ...target, path, clipPath: `path(evenodd, "${path}")` };
			current.current = next;
			setAnimated(next);
			if (progress < 1) frame = requestAnimationFrame(draw);
		};
		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	}, [target, transitionDuration, size]);
	const geometry = transitionDuration ? (animated ?? target) : target;
	const style: ShapeStyle = geometry
		? {
				"--ts-geometry-clip-path": geometry.clipPath,
				"--ts-geometry-inner-clip-path": geometry.clipPath,
			}
		: {};
	return { ref, geometry, size, style };
}

export function ShapeOutline({
	geometry,
	width,
	height,
	borderWidth = 2,
	borderColor = "var(--foreground)",
}: {
	geometry: ShapeGeometry | null;
	width: number;
	height: number;
	borderWidth?: number;
	borderColor?: string;
}) {
	const id = useId().replaceAll(":", "");
	if (!geometry || !borderWidth) return null;
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			data-reader-component="ShapeOutline"
			data-reader-role="shape-border"
			className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="none"
		>
			<defs>
				<clipPath id={`shape-outline-${id}`}>
					<path d={geometry.path} fillRule="evenodd" />
				</clipPath>
			</defs>
			<path
				d={geometry.path}
				fill="none"
				stroke={borderColor}
				strokeWidth={borderWidth * 2}
				strokeLinejoin="miter"
				clipPath={`url(#shape-outline-${id})`}
			/>
		</svg>
	);
}

export type ShapeProps = ComponentProps<"div"> &
	ShapeOptions & {
		as?: ElementType;
		surfaceClassName?: string;
	};

/** A frame owns the outline/shadow; its clipped surface owns content and decorations. */
export function Shape({
	as: Component = "div",
	shapes = [],
	borderWidth = 2,
	borderColor,
	shadow = false,
	shadowColor = "var(--foreground)",
	shadowOffset = 4,
	className,
	surfaceClassName,
	children,
	style,
	ref,
	...props
}: ShapeProps) {
	const outline = useShapeGeometry(shapes, ref);
	return (
		<Component
			data-reader-component="Shape"
			data-reader-role="shape-frame"
			{...props}
			ref={outline.ref}
			className={cn(
				"ts-geometry ts-shape-frame relative isolate",
				shadow && "ts-shape-shadow",
				className,
			)}
			style={
				{
					...style,
					background: undefined,
					...outline.style,
					"--ts-shape-shadow-color": shadowColor,
					"--ts-shape-shadow-offset": `${shadowOffset}px`,
				} as ShapeStyle
			}
		>
			<div
				data-reader-component="Shape"
				data-reader-role="shape-surface"
				style={{ background: style?.background }}
				className={cn(
					"ts-geometry-clip ts-shape-content relative isolate min-h-full overflow-hidden",
					surfaceClassName,
				)}
			>
				{children}
			</div>
			<ShapeOutline
				geometry={outline.geometry}
				{...outline.size}
				borderWidth={borderWidth}
				borderColor={borderColor}
			/>
		</Component>
	);
}
