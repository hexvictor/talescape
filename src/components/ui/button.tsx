import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import cn from "~/lib/utils/cn";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-2 border-foreground font-black text-xs uppercase outline-none transition-[transform,box-shadow,background-color,color,border-color,border-width] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
				navActive: "bg-accent text-accent-foreground",
				ink: "bg-[var(--comic-ink)] text-[var(--comic-cream)] hover:bg-foreground/90",
			},
			size: {
				default: "h-11 px-4 py-2 has-[>svg]:px-3",
				sm: "h-11 gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-13 px-6 has-[>svg]:px-4",
				icon: "size-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
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

const buttonSlantSizes = {
	sm: "6px",
	md: "10px",
	lg: "14px",
	xl: "18px",
} as const;

const buttonShapeClasses = {
	rectangle:
		"[--button-frame-clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] [--button-frame-inner-clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]",
	"slant-left":
		"[--button-frame-clip-path:polygon(var(--comic-frame-slant)_0,100%_0,100%_100%,0_100%)] [--button-frame-inner-clip-path:polygon(calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_0,100%_0,100%_100%,0_100%)]",
	"slant-right":
		"[--button-frame-clip-path:polygon(0_0,100%_0,calc(100%_-_var(--comic-frame-slant))_100%,0_100%)] [--button-frame-inner-clip-path:polygon(0_0,100%_0,calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_100%,0_100%)]",
	"slant-both":
		"[--button-frame-clip-path:polygon(var(--comic-frame-slant)_0,100%_0,calc(100%_-_var(--comic-frame-slant))_100%,0_100%)] [--button-frame-inner-clip-path:polygon(calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_0,100%_0,calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_100%,0_100%)]",
	"corner-left":
		"[--button-frame-clip-path:polygon(var(--comic-frame-slant)_0,100%_0,100%_100%,0_100%,0_var(--comic-frame-slant))] [--button-frame-inner-clip-path:polygon(calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_0,100%_0,100%_100%,0_100%,0_calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease)))]",
	"corner-right":
		"[--button-frame-clip-path:polygon(0_0,calc(100%_-_var(--comic-frame-slant))_0,100%_var(--comic-frame-slant),100%_100%,0_100%)] [--button-frame-inner-clip-path:polygon(0_0,calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_0,100%_calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease)),100%_100%,0_100%)]",
	"corner-bottom-left":
		"[--button-frame-clip-path:polygon(0_0,100%_0,100%_100%,var(--comic-frame-slant)_100%,0_calc(100%_-_var(--comic-frame-slant)))] [--button-frame-inner-clip-path:polygon(0_0,100%_0,100%_100%,calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_100%,0_calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease)))]",
	"corner-bottom-right":
		"[--button-frame-clip-path:polygon(0_0,100%_0,100%_calc(100%_-_var(--comic-frame-slant)),calc(100%_-_var(--comic-frame-slant))_100%,0_100%)] [--button-frame-inner-clip-path:polygon(0_0,100%_0,100%_calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease)),calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_100%,0_100%)]",
	"corners-left":
		"[--button-frame-clip-path:polygon(var(--comic-frame-slant)_0,100%_0,100%_100%,var(--comic-frame-slant)_100%,0_calc(100%_-_var(--comic-frame-slant)),0_var(--comic-frame-slant))] [--button-frame-inner-clip-path:polygon(calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_0,100%_0,100%_100%,calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease))_100%,0_calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease)),0_calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease)))]",
	"corners-right":
		"[--button-frame-clip-path:polygon(0_0,calc(100%_-_var(--comic-frame-slant))_0,100%_var(--comic-frame-slant),100%_calc(100%_-_var(--comic-frame-slant)),calc(100%_-_var(--comic-frame-slant))_100%,0_100%)] [--button-frame-inner-clip-path:polygon(0_0,calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_0,100%_calc(var(--comic-frame-slant)_-_var(--comic-frame-inner-slant-decrease)),100%_calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease)),calc(100%_-_var(--comic-frame-slant)_+_var(--comic-frame-inner-slant-decrease))_100%,0_100%)]",
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

type ButtonMotion = keyof typeof buttonMotionClasses;
type ButtonShape = keyof typeof buttonShapeClasses;
type ButtonSlant = keyof typeof buttonSlantSizes | `${number}px`;
type ComicDecorationElement = "strikes" | "bubbles";
type ComicDecorationPosition = keyof typeof comicDecorationPositions;
type ComicDecorationColor = keyof typeof comicDecorationColors;

type ComicDecoration = {
	className?: string;
	color?: ComicDecorationColor | string;
	element: ComicDecorationElement;
	position: ComicDecorationPosition;
};

type ButtonFrameStyle = React.CSSProperties & {
	"--comic-frame-inner-slant-decrease"?: string;
	"--comic-frame-slant"?: string;
};

function getDefaultMotion(
	variant: VariantProps<typeof buttonVariants>["variant"],
): ButtonMotion {
	if (variant === "link") {
		return "underline";
	}

	if (variant === "ghost") {
		return "color-only";
	}

	if (variant === "lift") {
		return "lift-on-hover";
	}

	return "lifted";
}

function getSlantValue(slant: ButtonSlant | undefined): string | undefined {
	if (!slant) {
		return undefined;
	}

	return slant in buttonSlantSizes
		? buttonSlantSizes[slant as keyof typeof buttonSlantSizes]
		: slant;
}

function Button({
	className,
	comicDecorations,
	innerSlantDecrease,
	motion,
	shape,
	slanted,
	slant,
	variant,
	size,
	asChild = false,
	surfaceClassName,
	style,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		comicDecorations?: ComicDecoration[];
		innerSlantDecrease?: `${number}px`;
		motion?: ButtonMotion;
		shape?: ButtonShape;
		slanted?: boolean;
		slant?: ButtonSlant;
		surfaceClassName?: string;
	}) {
	const Comp = asChild ? Slot : "button";
	const resolvedVariant = variant ?? "default";
	const resolvedMotion = motion ?? getDefaultMotion(resolvedVariant);
	const resolvedShape =
		shape ??
		(slanted || resolvedVariant === "comic" ? "slant-both" : "rectangle");
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
	const hasFrame = resolvedShape !== "rectangle" || decorations.length > 0;
	const frameStyle: ButtonFrameStyle = {
		...style,
	};
	const resolvedSlant = getSlantValue(slant);

	if (resolvedSlant) {
		frameStyle["--comic-frame-slant"] = resolvedSlant;
	}

	if (innerSlantDecrease) {
		frameStyle["--comic-frame-inner-slant-decrease"] = innerSlantDecrease;
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
			"relative z-10 h-full w-full border-0 shadow-none [clip-path:var(--button-frame-inner-clip-path)] hover:shadow-none",
		hasFrame && surfaceClassName,
	);

	if (!hasFrame) {
		return (
			<Comp
				data-slot="button"
				className={buttonClassName}
				style={style}
				{...props}
			/>
		);
	}

	return (
		<span
			data-tale-interaction-group="true"
			style={frameStyle}
			className={cn(
				"group relative inline-flex p-[var(--comic-frame-border-width)] transition-[transform,filter,padding]",
				buttonFrameMotionClasses[resolvedMotion],
				buttonShapeClasses[resolvedShape],
				className,
			)}
		>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-foreground [clip-path:var(--button-frame-clip-path)]"
			/>
			<Comp data-slot="button" className={buttonClassName} {...props} />
			{decorations.length > 0 && (
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
								} as React.CSSProperties
							}
						/>
					))}
				</span>
			)}
		</span>
	);
}

export { Button };
