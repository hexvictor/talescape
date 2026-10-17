import type { Decoration } from "../decorations/types";
import type { ShapeTreatment } from "../ui/shape-geometry";

export const surfaceKinds = [
	"button",
	"panel",
	"card",
	"image",
	"page",
	"shape",
] as const;
export type SurfaceKind = (typeof surfaceKinds)[number];
export type SurfaceConfiguration = {
	kind: SurfaceKind;
	properties: Record<string, string | number | boolean>;
	shapes: ShapeTreatment[];
	hoverShapes: ShapeTreatment[];
	pressedShapes?: ShapeTreatment[];
	hoverDecorations?: string;
	pressedDecorations?: string;
	decorations: string;
	layers: { id: number; visible: boolean; item: Decoration }[];
};
export type CompositionElement = {
	id: number;
	parentId: number | null;
	configuration: SurfaceConfiguration;
};
export function createSurface(kind: SurfaceKind): SurfaceConfiguration {
	const properties: SurfaceConfiguration["properties"] = {
		width: kind === "button" ? 240 : kind === "image" ? 560 : 640,
		height: kind === "button" ? 44 : kind === "image" ? 280 : 0,
		background: "",
		color: "",
		borderColor: "",
		borderWidth: kind === "page" ? 0 : 2,
		shadowColor: "",
		shadowOffset: 4,
		shadow: kind !== "page",
		className: "",
		surfaceClassName: "",
		padding: kind === "button" ? 0 : 24,
		label: "Explore tales",
		title: "Ember City",
		text: "At dawn, the streets began to glow again.",
	};
	if (kind === "button")
		Object.assign(properties, {
			variant: "default",
			size: "default",
			motion: "lifted",
			disabled: false,
			type: "button",
			ariaLabel: "",
			invalid: false,
			leftIcon: "none",
			rightIcon: "chevron",
			leftSegment: false,
			rightSegment: false,
			hoverSurfaceClassName: "",
			innerSlantDecrease: "1px",
			shapeTransitionDuration: 240,
			asChild: false,
			href: "#chapter",
			target: "_self",
			name: "",
			value: "",
			autoFocus: false,
		});
	if (kind === "panel" || kind === "card")
		Object.assign(properties, {
			appearance: "raised",
			density: "default",
			as: kind === "card" ? "article" : "section",
			description: "",
			heading: true,
		});
	if (kind === "image")
		Object.assign(properties, {
			src: "/assets/site/ember-city-light.png",
			alt: "A luminous fantasy city",
			imageWidth: 960,
			imageHeight: 480,
			fill: false,
			priority: false,
			quality: 75,
			loading: "lazy",
			sizes: "(min-width: 1024px) 560px, 100vw",
			unoptimized: true,
			objectFit: "cover",
			objectPosition: "center",
			imageClassName: "",
			imageStyle: "",
		});
	if (kind === "page" || kind === "shape")
		Object.assign(properties, { as: "div" });
	return {
		kind,
		properties,
		shapes:
			kind === "button"
				? [
						{ type: "corner", position: "top-left", size: 8 },
						{ type: "corner", position: "bottom-right", size: 8 },
					]
				: [],
		hoverShapes: [],
		pressedShapes: [],
		hoverDecorations: "",
		pressedDecorations: "",
		decorations: "",
		layers: [],
	};
}

const names = {
	button: "Button",
	panel: "Panel",
	card: "Card",
	image: "TaleImage",
	page: "PageShell",
	shape: "Shape",
};
const decorationNames = {
	halftone: "HalftoneDots",
	"speed-lines": "SpeedLines",
	"accent-streak": "AccentStreak",
	"background-texture": "BackgroundTexture",
	geometric: "GeometricShape",
	"circular-linework": "CircularLinework",
};
const prop = (name: string, value: unknown) =>
	` ${name}={${JSON.stringify(value)}}`;
export function exportSurface(
	configuration: SurfaceConfiguration,
	children = "",
): string {
	const {
		kind,
		properties: p,
		shapes,
		hoverShapes,
		decorations,
		layers,
	} = configuration;
	const attrs: Record<string, unknown> = {
		shapes,
		borderWidth: p.borderWidth,
		borderColor: p.borderColor || undefined,
		shadow: p.shadow,
		shadowColor: p.shadowColor || undefined,
		shadowOffset: p.shadowOffset,
		decorations: decorations || undefined,
	};
	const style = {
		width: p.width ? `min(100%, ${p.width}px)` : undefined,
		minHeight: p.height || undefined,
		background: p.background || undefined,
		color: p.color || undefined,
	};
	if (kind === "button")
		Object.assign(attrs, {
			asChild: p.asChild || undefined,
			name: p.name || undefined,
			value: p.value || undefined,
			autoFocus: p.autoFocus || undefined,
			variant: p.variant,
			size: p.size,
			motion: p.motion,
			disabled: p.disabled,
			type: p.type,
			"aria-label": p.ariaLabel || undefined,
			"aria-invalid": p.invalid || undefined,
			hoverShapes: hoverShapes.length ? hoverShapes : undefined,
			pressedShapes: configuration.pressedShapes?.length
				? configuration.pressedShapes
				: undefined,
			hoverDecorations: configuration.hoverDecorations || undefined,
			pressedDecorations: configuration.pressedDecorations || undefined,
			shapeTransitionDuration: p.shapeTransitionDuration ?? 240,
			hoverSurfaceClassName: p.hoverSurfaceClassName || undefined,
			innerSlantDecrease: p.innerSlantDecrease,
			surfaceClassName: p.surfaceClassName || undefined,
			style,
		});
	else if (kind === "panel" || kind === "card")
		Object.assign(attrs, {
			appearance: p.appearance,
			as: kind === "panel" ? p.as : undefined,
			surfaceClassName: p.surfaceClassName || undefined,
			style,
		});
	else if (kind === "image")
		Object.assign(attrs, {
			src: p.src,
			alt: p.alt,
			fill: p.fill,
			width: p.fill ? undefined : p.imageWidth,
			height: p.fill ? undefined : p.imageHeight,
			priority: p.priority,
			quality: p.quality,
			loading: p.priority ? undefined : p.loading,
			sizes: p.sizes,
			unoptimized: p.unoptimized,
			frameStyle: { ...style, height: p.height || undefined },
			className: p.imageClassName || undefined,
			style: { objectFit: p.objectFit, objectPosition: p.objectPosition },
		});
	else
		Object.assign(attrs, {
			as: p.as,
			style,
			surfaceClassName: p.surfaceClassName || undefined,
		});
	if (kind === "shape") attrs.decorations = undefined;
	const decorationJsx = layers
		.filter((layer) => layer.visible)
		.map(
			({ item: { type, ...settings } }) =>
				`    <${decorationNames[type]}${Object.entries(settings)
					.map(([key, value]) => prop(key, value))
					.join("")} />`,
		)
		.join("\n");
	const custom =
		(kind === "shape" && decorations
			? `  <Decorations preset={${JSON.stringify(decorations)}} />\n`
			: "") +
		(decorationJsx
			? `  <Decorations${kind === "image" ? ' layer="overlay"' : ""}>\n${decorationJsx}\n  </Decorations>\n`
			: "");
	let content = children;
	if (kind === "button") {
		const icon = (side: "left" | "right") => {
			const choice = p[`${side}Icon`];
			if (choice === "none") return "";
			const name = {
				chevron: "ChevronRight",
				book: "BookOpen",
				plus: "Plus",
				download: "Download",
				heart: "Heart",
				search: "Search",
				loader: "LoaderCircle",
			}[String(choice)];
			return p[`${side}Segment`]
				? `  <ButtonPart side="${side}"><${name} /></ButtonPart>\n`
				: `  <${name} />\n`;
		};
		content = `${icon("left")}  {${JSON.stringify(p.label)}}\n${icon("right")}`;
		if (p.asChild)
			content = `  <a href={${JSON.stringify(p.href)}} target={${JSON.stringify(p.target)}}>\n${custom}${content}  </a>\n`;
	} else if (kind === "panel" || kind === "card")
		content = `${p.heading ? `  <PanelHeading title={${JSON.stringify(p.title)}} description={${JSON.stringify(p.description)}} />\n` : ""}  <PanelContent density="${p.density}" style={{padding: ${Number(p.padding)}}}>\n    {${JSON.stringify(p.text)}}\n${children}  </PanelContent>\n`;
	else if (kind === "page" || kind === "shape")
		content = `  <div style={{padding: ${Number(p.padding)}}}>\n  {${JSON.stringify(p.text)}}\n${children}  </div>\n`;
	const output = `<${names[kind]}${Object.entries(attrs)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => prop(key, value))
		.join(
			"",
		)}${p.className ? prop(kind === "image" ? "frameClassName" : "className", p.className) : ""}>\n${kind === "button" && p.asChild ? "" : custom}${content}</${names[kind]}>`;
	return kind === "image" && p.fill
		? `<div style={{position: "relative", width: ${JSON.stringify(style.width ?? "100%")}, height: ${Number(p.height) || 280}}}>\n${output}\n</div>`
		: output;
}
export function exportComposition(
	elements: CompositionElement[],
	parentId: number | null = null,
): string {
	return elements
		.filter((element) => element.parentId === parentId)
		.map((element) =>
			exportSurface(
				element.configuration,
				exportComposition(elements, element.id)
					.split("\n")
					.map((line) => `    ${line}`)
					.join("\n"),
			),
		)
		.join("\n");
}
