"use client";

import {
	BookOpen,
	ChevronRight,
	Download,
	Heart,
	LoaderCircle,
	Plus,
	Search,
} from "lucide-react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { Decorations } from "../decorations/decorations";
import type {
	ButtonDecorationPreset,
	CardDecorationPreset,
	DecorationPreset,
	MediaDecorationPreset,
	PageDecorationPreset,
	PanelDecorationPreset,
} from "../decorations/types";
import { PageShell } from "../layout/page-shell";
import { TaleImage } from "../media/tale-image";
import { Button, ButtonPart, type ButtonProps } from "../ui/button";
import {
	Card,
	Panel,
	PanelContent,
	PanelHeading,
	type PanelProps,
} from "../ui/panel";
import { Shape } from "../ui/shape";
import type { SurfaceConfiguration } from "./editor-model";

const icons = {
	book: BookOpen,
	chevron: ChevronRight,
	download: Download,
	heart: Heart,
	loader: LoaderCircle,
	plus: Plus,
	search: Search,
};
export function SurfacePreview({
	configuration,
	children,
}: { configuration: SurfaceConfiguration; children?: ReactNode }) {
	const {
		kind,
		properties: p,
		shapes,
		hoverShapes,
		decorations,
		layers,
	} = configuration;
	const common = {
		shapes,
		borderWidth: Number(p.borderWidth),
		borderColor: String(p.borderColor) || undefined,
		shadow: Boolean(p.shadow),
		shadowColor: String(p.shadowColor) || undefined,
		shadowOffset: Number(p.shadowOffset),
	};
	const style: CSSProperties = {
		width: p.width ? `min(100%, ${p.width}px)` : undefined,
		minHeight: p.height ? Number(p.height) : undefined,
		background: String(p.background) || undefined,
		color: String(p.color) || undefined,
	};
	const custom = layers.some((layer) => layer.visible) ? (
		<Decorations
			layer={kind === "image" ? "overlay" : "background"}
			items={layers.filter((layer) => layer.visible).map((layer) => layer.item)}
		/>
	) : null;
	const className = String(p.className);
	if (kind === "button") {
		const icon = (side: "left" | "right") => {
			const Icon = icons[p[`${side}Icon`] as keyof typeof icons];
			return Icon ? (
				p[`${side}Segment`] ? (
					<ButtonPart side={side}>
						<Icon />
					</ButtonPart>
				) : (
					<Icon />
				)
			) : null;
		};
		const content = (
			<>
				{custom}
				{icon("left")}
				{p.label}
				{icon("right")}
			</>
		);
		return (
			<Button
				{...common}
				className={className}
				style={style}
				surfaceClassName={String(p.surfaceClassName)}
				hoverSurfaceClassName={String(p.hoverSurfaceClassName)}
				hoverShapes={hoverShapes.length ? hoverShapes : undefined}
				pressedShapes={
					configuration.pressedShapes?.length
						? configuration.pressedShapes
						: undefined
				}
				hoverDecorations={
					(configuration.hoverDecorations as ButtonDecorationPreset) ||
					undefined
				}
				pressedDecorations={
					(configuration.pressedDecorations as ButtonDecorationPreset) ||
					undefined
				}
				shapeTransitionDuration={Number(p.shapeTransitionDuration ?? 240)}
				innerSlantDecrease={
					String(p.innerSlantDecrease) as ButtonProps["innerSlantDecrease"]
				}
				variant={p.variant as ButtonProps["variant"]}
				size={p.size as ButtonProps["size"]}
				motion={p.motion as ButtonProps["motion"]}
				type={p.type as ButtonProps["type"]}
				disabled={Boolean(p.disabled)}
				aria-invalid={Boolean(p.invalid) || undefined}
				aria-label={String(p.ariaLabel) || undefined}
				decorations={(decorations as ButtonDecorationPreset) || undefined}
				asChild={Boolean(p.asChild)}
				name={String(p.name)}
				value={String(p.value)}
				autoFocus={Boolean(p.autoFocus)}
			>
				{p.asChild ? (
					<a href={String(p.href)} target={String(p.target)}>
						{content}
					</a>
				) : (
					content
				)}
			</Button>
		);
	}
	if (kind === "panel" || kind === "card") {
		const content = (
			<>
				{custom}
				{p.heading && (
					<PanelHeading title={p.title} description={p.description} />
				)}
				<PanelContent
					density={p.density as "default" | "compact"}
					style={{ padding: Number(p.padding) }}
				>
					<p>{p.text}</p>
					{children}
				</PanelContent>
			</>
		);
		return kind === "card" ? (
			<Card
				{...common}
				className={className}
				style={style}
				surfaceClassName={String(p.surfaceClassName)}
				appearance={p.appearance as PanelProps["appearance"]}
				decorations={(decorations as CardDecorationPreset) || undefined}
			>
				{content}
			</Card>
		) : (
			<Panel
				{...common}
				as={p.as as ElementType}
				className={className}
				style={style}
				surfaceClassName={String(p.surfaceClassName)}
				appearance={p.appearance as PanelProps["appearance"]}
				decorations={(decorations as PanelDecorationPreset) || undefined}
			>
				{content}
			</Panel>
		);
	}
	if (kind === "image")
		return (
			<div
				className="relative max-w-full"
				style={{ width: style.width, height: Number(p.height) || 280 }}
			>
				<TaleImage
					{...common}
					src={String(p.src)}
					alt={String(p.alt)}
					fill={Boolean(p.fill)}
					width={p.fill ? undefined : Number(p.imageWidth)}
					height={p.fill ? undefined : Number(p.imageHeight)}
					priority={Boolean(p.priority)}
					quality={Number(p.quality)}
					loading={p.priority ? undefined : (p.loading as "lazy" | "eager")}
					unoptimized={Boolean(p.unoptimized)}
					sizes={String(p.sizes)}
					frameClassName={className}
					frameStyle={{ ...style, height: "100%" }}
					className={String(p.imageClassName)}
					style={{
						height: p.fill ? undefined : "100%",
						objectFit: p.objectFit as CSSProperties["objectFit"],
						objectPosition: String(p.objectPosition),
					}}
					decorations={(decorations as MediaDecorationPreset) || undefined}
				>
					{custom}
					{children}
				</TaleImage>
			</div>
		);
	const content = (
		<div style={{ padding: Number(p.padding) }}>
			{kind === "shape" && decorations && (
				<Decorations preset={decorations as DecorationPreset} />
			)}
			{custom}
			<p>{p.text}</p>
			{children}
		</div>
	);
	return kind === "page" ? (
		<PageShell
			{...common}
			as={p.as as ElementType}
			className={className}
			style={style}
			decorations={(decorations as PageDecorationPreset) || undefined}
		>
			{content}
		</PageShell>
	) : (
		<Shape
			{...common}
			as={p.as as ElementType}
			className={className}
			style={style}
			surfaceClassName={String(p.surfaceClassName)}
		>
			{content}
		</Shape>
	);
}
