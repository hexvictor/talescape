"use client";

import { type VariantProps, cva } from "class-variance-authority";
import {
	type CSSProperties,
	Children,
	type ReactElement,
	cloneElement,
	isValidElement,
} from "react";
import { mergeProps } from "react-aria";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import {
	type GeometryShape,
	type GeometrySlant,
	resolveGeometrySlant,
} from "./geometry";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-2 border-foreground font-black text-xs uppercase outline-none transition-[transform,box-shadow,background-color,color,border-color,border-width] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

const comicDecorationPositions = {
	"top-left": "comic-button-decoration-top-left",
	"top-center": "comic-button-decoration-top-center",
	"top-right": "comic-button-decoration-top-right",
	"center-left": "comic-button-decoration-center-left",
	center: "comic-button-decoration-center",
	"center-right": "comic-button-decoration-center-right",
	"bottom-left": "comic-button-decoration-bottom-left",
	"bottom-center": "comic-button-decoration-bottom-center",
	"bottom-right": "comic-button-decoration-bottom-right",
} as const;

const comicDecorationColors = {
	muted: "rgb(var(--muted-foreground-rgb) / 0.45)",
	foreground: "rgb(var(--foreground-rgb) / 0.82)",
	primary: "rgb(var(--primary-rgb) / 0.78)",
	secondary: "rgb(var(--secondary-rgb) / 0.78)",
	accent: "rgb(var(--accent-rgb) / 0.88)",
} as const;

export type ButtonMotion = keyof typeof buttonMotionClasses;
export type ButtonShape = GeometryShape;
export type ButtonSlant = GeometrySlant;
export type ComicDecorationElement = "strikes" | "bubbles";
export type ComicDecorationPosition = keyof typeof comicDecorationPositions;
export type ComicDecorationColor = keyof typeof comicDecorationColors;

export type ComicDecoration = {
	className?: string;
	color?: ComicDecorationColor | string;
	element: ComicDecorationElement;
	position: ComicDecorationPosition;
};

type ButtonFrameStyle = CSSProperties & {
	"--comic-frame-inner-slant-decrease"?: string;
	"--comic-frame-slant"?: string;
	"--ts-geometry-inner-decrease"?: string;
	"--ts-geometry-slant"?: string;
};

export type ButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		comicDecorations?: ComicDecoration[];
		hoverShape?: ButtonShape | "match";
		hoverSurfaceClassName?: string;
		innerSlantDecrease?: `${number}px`;
		motion?: ButtonMotion;
		onPress?: AriaButtonProps["onPress"];
		shape?: ButtonShape;
		slanted?: boolean;
		slant?: ButtonSlant;
		surfaceClassName?: string;
	};

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
	| "comicDecorations"
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
	comicDecorations,
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
	...props
}: ButtonProps): React.JSX.Element {
	const resolvedVariant = variant ?? "default";
	const resolvedMotion = motion ?? getDefaultMotion(resolvedVariant);
	const resolvedShape =
		shape ??
		(slanted || resolvedVariant === "comic" ? "slant-both" : "rectangle");
	const resolvedHoverShape =
		hoverShape === "match" ? resolvedShape : hoverShape;
	const decorations =
		comicDecorations ??
		(resolvedVariant === "comic"
			? [
					{
						element: "strikes",
						position: "top-right",
					} satisfies ComicDecoration,
				]
			: []);
	const hasVisibleFrame =
		resolvedShape !== "rectangle" || decorations.length > 0;
	const hasFrame = hasVisibleFrame || Boolean(hoverShape);
	const resolvedSlant = resolveGeometrySlant(slant);
	const frameStyle: ButtonFrameStyle = { ...style };

	if (resolvedSlant) {
		frameStyle["--comic-frame-slant"] = resolvedSlant;
		frameStyle["--ts-geometry-slant"] = resolvedSlant;
	}
	if (innerSlantDecrease) {
		frameStyle["--comic-frame-inner-slant-decrease"] = innerSlantDecrease;
		frameStyle["--ts-geometry-inner-decrease"] = innerSlantDecrease;
	}

	const buttonClassName = cn(
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
				style={style}
			/>
		);
	}

	return (
		<span
			data-tale-interaction-group="true"
			data-ts-shape={resolvedShape}
			style={frameStyle}
			className={cn(
				"group ts-geometry relative inline-flex p-[var(--comic-frame-border-width)] transition-[transform,filter,padding]",
				buttonFrameMotionClasses[resolvedMotion],
				className,
			)}
		>
			{hasVisibleFrame ? (
				<span
					aria-hidden="true"
					className="ts-geometry-clip pointer-events-none absolute inset-0 bg-foreground"
				/>
			) : null}
			<span
				aria-hidden="true"
				className={cn(
					"ts-geometry-inner-clip pointer-events-none absolute inset-[var(--comic-frame-border-width)] z-[1]",
					buttonSurfaceClasses[resolvedVariant],
					surfaceClassName,
				)}
			/>
			{resolvedHoverShape ? (
				<span
					aria-hidden="true"
					data-ts-shape={resolvedHoverShape}
					className={cn(
						"ts-geometry ts-geometry-clip pointer-events-none absolute inset-[var(--comic-frame-border-width)] z-[3] bg-accent opacity-0 transition-opacity group-hover:opacity-100",
						hoverSurfaceClassName,
					)}
				/>
			) : null}
			<InteractiveButton
				{...props}
				asChild={asChild}
				className={buttonClassName}
			/>
			{decorations.length > 0 ? (
				<span aria-hidden="true" className="comic-button-decoration-layer">
					{decorations.map((decoration, index) => (
						<span
							className={cn(
								"comic-button-decoration",
								decoration.element === "strikes"
									? "comic-button-decoration-strikes"
									: "comic-button-decoration-bubbles",
								comicDecorationPositions[decoration.position],
								decoration.className,
							)}
							key={`${decoration.element}-${decoration.position}-${index}`}
							style={
								{
									"--comic-decoration-color":
										decoration.color &&
										decoration.color in comicDecorationColors
											? comicDecorationColors[
													decoration.color as ComicDecorationColor
												]
											: decoration.color,
								} as CSSProperties
							}
						/>
					))}
				</span>
			) : null}
		</span>
	);
}
