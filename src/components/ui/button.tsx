"use client";

import { type VariantProps, cva } from "class-variance-authority";
import {
	type CSSProperties,
	Children,
	type ReactElement,
	type ReactNode,
	cloneElement,
	isValidElement,
	useMemo,
	useState,
} from "react";
import { mergeProps } from "react-aria";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import { Decorations } from "../decorations/decorations";
import type { ButtonDecorationPreset, Decoration } from "../decorations/types";
import {
	type GeometryShape,
	type GeometrySlant,
	type SurfaceShapeProps,
	geometryShapeTreatments,
	resolveGeometrySlant,
} from "./geometry";
import { ShapeOutline, useShapeGeometry } from "./shape";
import type { ShapeConfiguration } from "./shape-geometry";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-2 border-foreground font-black text-xs uppercase outline-none transition-[transform,box-shadow,background-color,color,border-color,border-width] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg:not(.ts-decoration):not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive: "bg-destructive text-white hover:bg-destructive/90",
				outline:
					"bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/90",
				comic: "bg-primary text-primary-foreground hover:bg-primary/90",
				lift: "bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
				ghost:
					"border-transparent bg-transparent shadow-none hover:border-foreground hover:bg-accent hover:text-accent-foreground",
				link: "border-transparent bg-transparent text-primary underline-offset-4 shadow-none hover:text-primary/80",
				nav: "border-transparent bg-transparent text-current shadow-none hover:bg-accent hover:text-accent-foreground",
				navActive: "bg-primary text-primary-foreground",
				ink: "bg-[var(--comic-ink)] text-[var(--comic-cream)] hover:bg-foreground/90",
			},
			size: {
				default: "h-[var(--ts-control-height)] px-4 py-2 has-[>svg]:px-3",
				sm: "h-[var(--ts-control-height-compact)] gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-[var(--ts-control-height-large)] px-6 has-[>svg]:px-4",
				icon: "size-[var(--ts-control-height)]",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

const buttonMotionClasses = {
	flat: "shadow-none",
	lifted:
		"shadow-[2px_2px_0_rgb(var(--foreground-rgb))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgb(var(--foreground-rgb))]",
	"lift-on-hover":
		"shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgb(var(--foreground-rgb))]",
	"reveal-on-hover":
		"border-0 shadow-none hover:border-2 hover:border-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-[3px_3px_0_rgb(var(--foreground-rgb))]",
	"color-only": "shadow-none",
	underline: "shadow-none hover:underline",
} as const;

const buttonFrameMotionClasses = {
	flat: "",
	lifted:
		"hover:-translate-x-0.5 hover:-translate-y-0.5 [filter:drop-shadow(var(--comic-frame-shadow-offset)_var(--comic-frame-shadow-offset)_0_var(--comic-frame-shadow-color))] hover:[filter:drop-shadow(var(--comic-frame-hover-shadow-offset)_var(--comic-frame-hover-shadow-offset)_0_var(--comic-frame-shadow-color))]",
	"lift-on-hover":
		"hover:-translate-x-0.5 hover:-translate-y-0.5 hover:[filter:drop-shadow(var(--comic-frame-hover-shadow-offset)_var(--comic-frame-hover-shadow-offset)_0_var(--comic-frame-shadow-color))]",
	"reveal-on-hover":
		"[--comic-frame-border-width:0px] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:[--comic-frame-border-width:2px] hover:[filter:drop-shadow(var(--comic-frame-hover-shadow-offset)_var(--comic-frame-hover-shadow-offset)_0_var(--comic-frame-shadow-color))]",
	"color-only": "",
	underline: "hover:underline",
} as const;

const buttonSurfaceClasses = {
	default: "bg-primary",
	destructive: "bg-destructive",
	outline: "bg-card",
	secondary: "bg-secondary",
	comic: "bg-primary",
	lift: "bg-card",
	ghost: "bg-transparent",
	link: "bg-transparent",
	nav: "bg-transparent",
	navActive: "bg-primary",
	ink: "bg-[var(--comic-ink)]",
} as const;

export type ButtonMotion = keyof typeof buttonMotionClasses;
export type ButtonShape = GeometryShape;
export type ButtonSlant = GeometrySlant;

type ButtonFrameStyle = CSSProperties & {
	"--comic-frame-inner-slant-decrease"?: string;
	"--comic-frame-slant"?: string;
	"--ts-geometry-inner-decrease"?: string;
	"--ts-geometry-slant"?: string;
	"--ts-geometry-step-position"?: string;
	"--ts-geometry-step-depth"?: string;
};

export type ButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		stepPosition?: `${number}%`;
		stepDepth?: `${number}px`;
		hoverShape?: ButtonShape | "match";
		hoverSurfaceClassName?: string;
		innerSlantDecrease?: `${number}px`;
		motion?: ButtonMotion;
		onPress?: AriaButtonProps["onPress"];
		shape?: ButtonShape;
		slanted?: boolean;
		slant?: ButtonSlant;
		surfaceClassName?: string;
		decorations?: ButtonDecorationPreset | Decoration[];
		hoverShapes?: ShapeConfiguration | GeometryShape;
		pressedShapes?: ShapeConfiguration | GeometryShape;
		hoverDecorations?: ButtonDecorationPreset | Decoration[];
		pressedDecorations?: ButtonDecorationPreset | Decoration[];
		/** Milliseconds for composed hover/focus outline morphing. Zero disables it. */
		shapeTransitionDuration?: number;
	} & SurfaceShapeProps;

function getDefaultMotion(
	variant: VariantProps<typeof buttonVariants>["variant"],
): ButtonMotion {
	if (variant === "link") return "underline";
	if (variant === "ghost") return "color-only";
	if (variant === "lift") return "lift-on-hover";
	return "lifted";
}

type InteractiveProps = Omit<
	ButtonProps,
	| "asChild"
	| "className"
	| "stepPosition"
	| "stepDepth"
	| "hoverShape"
	| "hoverSurfaceClassName"
	| "innerSlantDecrease"
	| "motion"
	| "shape"
	| "size"
	| "slant"
	| "slanted"
	| "surfaceClassName"
	| "variant"
	| "decorations"
	| "shapes"
	| "hoverShapes"
	| "shapeTransitionDuration"
	| "borderWidth"
	| "borderColor"
	| "shadow"
	| "shadowColor"
	| "shadowOffset"
	| "edgeSlant"
> & {
	className: string;
};

function InteractiveButton({
	asChild,
	children,
	className,
	disabled,
	onClick,
	onPress,
	ref,
	style,
	...props
}: InteractiveProps & { asChild: boolean }): React.JSX.Element {
	if (asChild) {
		const child = Children.only(children);
		if (!isValidElement(child)) {
			throw new Error("Button with asChild requires one valid React element.");
		}

		const typedChild = child as ReactElement<
			React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: unknown }
		>;
		const childProps = typedChild.props;
		const href = typeof childProps.href === "string" ? childProps.href : "#";
		const linkProps = props as unknown as Omit<AriaLinkProps, "children">;

		return (
			<AriaLink
				data-reader-component="Button"
				data-reader-role="link-action"
				{...linkProps}
				className={className}
				href={href}
				isDisabled={disabled}
				onPress={onPress}
				ref={ref as React.Ref<HTMLAnchorElement>}
				style={style}
				render={(ariaProps) =>
					cloneElement(
						typedChild,
						mergeProps(childProps, ariaProps, { onClick }),
					)
				}
			>
				{childProps.children}
			</AriaLink>
		);
	}

	const ariaProps = props as unknown as Omit<AriaButtonProps, "children">;
	return (
		<AriaButton
			data-reader-component="Button"
			data-reader-role="button-action"
			{...ariaProps}
			className={className}
			isDisabled={disabled}
			onPress={onPress}
			ref={ref}
			style={style}
			render={(buttonProps) => (
				<button {...mergeProps(buttonProps, { onClick })} />
			)}
		>
			{children}
		</AriaButton>
	);
}

export function Button({
	asChild = false,
	className,
	stepPosition,
	stepDepth,
	hoverShape,
	hoverSurfaceClassName,
	innerSlantDecrease,
	motion,
	shape,
	size,
	slant,
	slanted,
	style,
	surfaceClassName,
	variant,
	children,
	decorations,
	shapes,
	hoverShapes,
	pressedShapes,
	hoverDecorations,
	pressedDecorations,
	shapeTransitionDuration = 240,
	borderWidth,
	borderColor,
	shadow,
	shadowColor,
	shadowOffset,
	edgeSlant,
	...props
}: ButtonProps): React.JSX.Element {
	const resolvedVariant = variant ?? "default";
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [pressed, setPressed] = useState(false);
	const resolvedMotion = motion ?? getDefaultMotion(resolvedVariant);
	const resolvedShape =
		shape ??
		(slanted || resolvedVariant === "comic" ? "slant-both" : "rectangle");
	const resolvedHoverShape =
		hoverShape === "match" ? resolvedShape : hoverShape;
	const composed =
		resolvedShape !== "rectangle" ||
		shapes !== undefined ||
		pressedShapes !== undefined ||
		hoverDecorations !== undefined ||
		pressedDecorations !== undefined ||
		hoverShapes !== undefined ||
		hoverShape !== undefined;
	const baseShapes = useMemo(
		() =>
			typeof shapes === "string"
				? geometryShapeTreatments(
						shapes,
						slant,
						stepPosition,
						stepDepth,
						edgeSlant,
					)
				: (shapes ??
					(composed
						? geometryShapeTreatments(
								resolvedShape,
								slant,
								stepPosition,
								stepDepth,
								edgeSlant,
							)
						: undefined)),
		[
			shapes,
			composed,
			resolvedShape,
			slant,
			stepPosition,
			stepDepth,
			edgeSlant,
		],
	);
	const hoverOutline = useMemo(
		() =>
			typeof hoverShapes === "string"
				? geometryShapeTreatments(
						hoverShapes,
						slant,
						stepPosition,
						stepDepth,
						edgeSlant,
					)
				: (hoverShapes ??
					(resolvedHoverShape
						? geometryShapeTreatments(
								resolvedHoverShape,
								slant,
								stepPosition,
								stepDepth,
								edgeSlant,
							)
						: undefined)),
		[
			hoverShapes,
			resolvedHoverShape,
			slant,
			stepPosition,
			stepDepth,
			edgeSlant,
		],
	);
	const pressedOutline = useMemo(
		() =>
			typeof pressedShapes === "string"
				? geometryShapeTreatments(
						pressedShapes,
						slant,
						stepPosition,
						stepDepth,
						edgeSlant,
					)
				: pressedShapes,
		[pressedShapes, slant, stepPosition, stepDepth, edgeSlant],
	);
	const outline = useShapeGeometry(
		pressed && !props.disabled && pressedOutline
			? pressedOutline
			: (hovered || focused) && !props.disabled && hoverOutline
				? hoverOutline
				: baseShapes,
		undefined,
		hoverOutline || pressedOutline ? Math.max(0, shapeTransitionDuration) : 0,
	);
	const hasVisibleFrame = composed || resolvedShape !== "rectangle";
	const hasFrame = hasVisibleFrame || Boolean(hoverShape);
	const resolvedSlant = resolveGeometrySlant(slant);
	const frameStyle: ButtonFrameStyle = {
		...style,
		...outline.style,
		background: hasFrame ? undefined : style?.background,
	};
	if (edgeSlant)
		(frameStyle as CSSProperties & Record<string, string | number | undefined>)[
			"--ts-geometry-edge-slant"
		] = resolveGeometrySlant(edgeSlant);
	if (borderWidth !== undefined)
		(frameStyle as CSSProperties & Record<string, string | number | undefined>)[
			"--comic-frame-border-width"
		] = `${borderWidth}px`;
	if (shadow === false) {
		frameStyle.filter = "none";
		frameStyle.boxShadow = "none";
	}
	if (shadowColor)
		(frameStyle as CSSProperties & Record<string, string | number | undefined>)[
			"--comic-frame-shadow-color"
		] = shadowColor;
	if (shadowOffset !== undefined) {
		(frameStyle as CSSProperties & Record<string, string | number | undefined>)[
			"--comic-frame-shadow-offset"
		] = `${shadowOffset}px`;
		(frameStyle as CSSProperties & Record<string, string | number | undefined>)[
			"--comic-frame-hover-shadow-offset"
		] = `${shadowOffset + 2}px`;
	}
	const activeDecorations =
		!props.disabled && pressed
			? (pressedDecorations ?? hoverDecorations ?? decorations)
			: !props.disabled && (hovered || focused)
				? (hoverDecorations ?? decorations)
				: decorations;
	const presetContent = activeDecorations ? (
		<Decorations
			preset={
				typeof activeDecorations === "string" ? activeDecorations : undefined
			}
			items={Array.isArray(activeDecorations) ? activeDecorations : undefined}
		/>
	) : null;
	const content =
		asChild &&
		presetContent &&
		isValidElement<{ children?: ReactNode }>(children) ? (
			cloneElement(
				children,
				undefined,
				<>
					{presetContent}
					{children.props.children}
				</>,
			)
		) : (
			<>
				{presetContent}
				{children}
			</>
		);
	const interactiveContent = asChild && !presetContent ? children : content;
	if (stepPosition) frameStyle["--ts-geometry-step-position"] = stepPosition;
	frameStyle["--ts-geometry-step-depth"] = stepDepth ?? "6px";

	if (resolvedSlant) {
		frameStyle["--comic-frame-slant"] = resolvedSlant;
		frameStyle["--ts-geometry-slant"] = resolvedSlant;
	}
	if (innerSlantDecrease) {
		frameStyle["--comic-frame-inner-slant-decrease"] = innerSlantDecrease;
		frameStyle["--ts-geometry-inner-decrease"] = innerSlantDecrease;
	}

	const buttonClassName = cn(
		"ts-decoration-host relative isolate overflow-hidden",
		buttonVariants({
			variant,
			size,
			className: cn(
				!hasFrame && buttonMotionClasses[resolvedMotion],
				!hasFrame && className,
			),
		}),
		hasFrame &&
			"!bg-transparent hover:!bg-transparent ts-geometry-inner-clip relative z-10 w-full border-0 shadow-none hover:shadow-none",
	);

	if (!hasFrame) {
		return (
			<InteractiveButton
				{...props}
				asChild={asChild}
				className={buttonClassName}
				style={frameStyle}
			>
				{interactiveContent}
			</InteractiveButton>
		);
	}

	return (
		<span
			ref={outline.ref}
			data-reader-component="Button"
			data-reader-role="button-frame"
			data-tale-interaction-group="true"
			data-ts-shape={resolvedShape}
			style={frameStyle}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => {
				setHovered(false);
				setPressed(false);
			}}
			onPointerDownCapture={() => setPressed(true)}
			onPointerUpCapture={() => setPressed(false)}
			onPointerCancelCapture={() => setPressed(false)}
			onKeyDownCapture={(event) => {
				if (event.key === " " || event.key === "Enter") setPressed(true);
			}}
			onKeyUpCapture={() => setPressed(false)}
			onFocusCapture={() => setFocused(true)}
			onBlurCapture={(event) => {
				setPressed(false);
				if (!event.currentTarget.contains(event.relatedTarget as Node | null))
					setFocused(false);
			}}
			className={cn(
				"group ts-geometry relative inline-flex p-[var(--comic-frame-border-width)] transition-[transform,filter,padding] active:translate-x-0 active:translate-y-0",
				buttonFrameMotionClasses[resolvedMotion],
				composed && "p-0",
				className,
			)}
		>
			{hasVisibleFrame && !composed ? (
				<span
					aria-hidden="true"
					className="ts-geometry-clip pointer-events-none absolute inset-0 bg-foreground"
				/>
			) : null}
			<span
				aria-hidden="true"
				style={{
					background: style?.background,
					...(composed ? { inset: 0 } : {}),
				}}
				className={cn(
					"ts-geometry-inner-clip pointer-events-none absolute inset-[var(--comic-frame-border-width)] z-[1]",
					buttonSurfaceClasses[resolvedVariant],
					surfaceClassName,
				)}
			/>
			{resolvedHoverShape ? (
				<span
					aria-hidden="true"
					data-ts-shape={composed ? undefined : resolvedHoverShape}
					className={cn(
						"ts-geometry-clip pointer-events-none absolute inset-[var(--comic-frame-border-width)] z-[3] bg-accent opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
						!composed && "ts-geometry",
						hoverSurfaceClassName,
					)}
				/>
			) : null}
			<InteractiveButton
				{...props}
				asChild={asChild}
				className={buttonClassName}
			>
				{interactiveContent}
			</InteractiveButton>
			{composed && (
				<ShapeOutline
					geometry={outline.geometry}
					{...outline.size}
					borderWidth={
						borderWidth ??
						(resolvedMotion === "reveal-on-hover" && !hovered && !focused
							? 0
							: shapes === undefined &&
									resolvedShape === "rectangle" &&
									(resolvedVariant === "nav" ||
										resolvedVariant === "ghost" ||
										resolvedVariant === "link")
								? 0
								: 2)
					}
					borderColor={borderColor}
				/>
			)}
		</span>
	);
}

/** A visual segment of one action, never a nested interactive button. */
export function ButtonPart({
	side = "right",
	children,
	className,
	...props
}: React.ComponentProps<"span"> & {
	side?: "left" | "right";
	children?: ReactNode;
}): React.JSX.Element {
	return (
		<span
			{...props}
			data-slot="button-part"
			data-side={side}
			className={cn("ts-button-part", className)}
		>
			{children}
		</span>
	);
}
