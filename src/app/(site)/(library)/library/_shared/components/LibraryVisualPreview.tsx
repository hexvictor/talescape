"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { TaleImage } from "~/components/media/tale-image";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import type { LibraryVisualSnapshot as Snapshot } from "~/server/db/data/library/queries/visualPreviews";
import type { ReaderStyleConfig } from "~/server/db/types/tale-reader/readerConfig";

function visualStyle(
	style: ReaderStyleConfig | null | undefined,
): CSSProperties {
	const { backgroundCss, cssText: _cssText, ...rest } = style ?? {};
	return { ...rest, background: backgroundCss } as CSSProperties;
}

export function LibraryVisualPreview({
	title,
	snapshot,
	frameId,
	elementId,
	sceneStyle,
	studioHref,
	taleHref,
}: {
	title: string;
	snapshot: Snapshot;
	frameId?: number;
	elementId?: number;
	sceneStyle?: ReaderStyleConfig | null;
	studioHref?: string;
	taleHref: string;
}) {
	const elements = new Map(
		snapshot.elements.map((element) => [String(element.id), element]),
	);
	const frames = new Map(
		snapshot.frames.map((frame) => [String(frame.id), frame]),
	);
	const renderElement = (id: string) => {
		const element = elements.get(id);
		if (!element) return null;
		const data = element.data as Record<string, unknown>;
		const text = String(data.content ?? data.text ?? data.label ?? "");
		const url = String(data.url ?? data.src ?? "");
		return (
			<div
				key={id}
				data-reader-component="LibraryVisualPreview"
				data-reader-role="preview-element"
				style={visualStyle(element.styleConfig)}
			>
				{element.type === "image" && url ? (
					<TaleImage
						src={url}
						alt={String(data.alt ?? "")}
						width={640}
						height={360}
						unoptimized
						className="max-h-96 object-contain"
					/>
				) : element.type === "video" && url ? (
					<video src={url} controls className="max-h-96 max-w-full">
						<track kind="captions" />
					</video>
				) : element.type === "audio" && url ? (
					<audio src={url} controls>
						<track kind="captions" />
					</audio>
				) : element.type === "quote" ? (
					<blockquote>{text}</blockquote>
				) : (
					<p className="whitespace-pre-wrap">{text}</p>
				)}
			</div>
		);
	};
	const renderFrame = (
		id: string,
		visited = new Set<string>(),
	): React.ReactNode => {
		const frame = frames.get(id);
		if (!frame || visited.has(id)) return null;
		const next = new Set(visited).add(id);
		return (
			<div
				key={id}
				data-reader-component="LibraryVisualPreview"
				data-reader-role="preview-frame"
				style={{
					display: frame.config.mode === "grid" ? "grid" : "flex",
					flexDirection:
						frame.config.mode === "flex"
							? (frame.config.direction ?? "column")
							: "column",
					flexWrap:
						frame.config.mode === "flex" && frame.config.wrap
							? "wrap"
							: "nowrap",
					gridTemplateColumns:
						frame.config.mode === "grid"
							? `repeat(${frame.config.columns ?? 1}, minmax(0, 1fr))`
							: undefined,
					alignItems: "align" in frame.config ? frame.config.align : undefined,
					justifyContent:
						"justify" in frame.config ? frame.config.justify : undefined,
					gap: "gap" in frame.config ? frame.config.gap : 0,
					position: "relative",
					...visualStyle(frame.config.style),
					...visualStyle(frame.styleConfig),
				}}
			>
				{frame.config.children.map((child) =>
					child.type === "frame"
						? renderFrame(child.frameId, next)
						: renderElement(child.elementId),
				)}
			</div>
		);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" variant="secondary">
					<Eye /> Preview
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-5xl sm:max-w-5xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div
					data-reader-component="LibraryVisualPreview"
					data-reader-role="preview-canvas"
					className="relative min-h-80 overflow-auto bg-background p-6"
					style={visualStyle(sceneStyle)}
				>
					{elementId ? (
						renderElement(String(elementId))
					) : frameId ? (
						renderFrame(String(frameId))
					) : (
						<>
							{snapshot.frames
								.filter((frame) => frame.parentFrameId === null)
								.map((frame) => renderFrame(String(frame.id)))}
							{snapshot.elements
								.filter((element) => element.frameId === null)
								.map((element) => renderElement(String(element.id)))}
						</>
					)}
					{!snapshot.frames.length && !snapshot.elements.length && (
						<p>No accessible content to preview.</p>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild>
						<Link href={taleHref}>View inside tale</Link>
					</Button>
					{studioHref && (
						<Button asChild variant="outline">
							<Link href={studioHref}>Edit in Studio</Link>
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
