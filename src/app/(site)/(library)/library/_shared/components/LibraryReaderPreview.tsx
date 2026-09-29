"use client";

import { Eye } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import type {
	ElementData,
	ElementType,
} from "~/server/db/types/tale-reader/element";

type PreviewFragment = {
	id: number;
	type: ElementType;
	data: ElementData;
	orientation: "vertical" | "horizontal";
};

type LibraryReaderPreviewProps = {
	title: string;
	description: string;
	element: PreviewFragment | null;
};

export function LibraryReaderPreview({
	title,
	description,
	element,
}: LibraryReaderPreviewProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" size="sm" variant="secondary">
					<Eye aria-hidden="true" />
					View preview
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[min(96vw,64rem)] rounded-none border-[3px] border-foreground p-0 shadow-[7px_7px_0_var(--comic-ink)]">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="px-6 pb-6">
					<div className="relative flex min-h-[28rem] items-center justify-center overflow-hidden bg-black text-white">
						{element ? (
							<PreviewFragment element={element} />
						) : (
							<p className="max-w-sm text-center text-sm text-white/70">
								This node does not have a readable element to preview yet.
							</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Renders a lightweight element preview for the library modal.
 *
 * @param props - The preview element props.
 * @param props.element - The element data selected from the library item.
 * @returns A static preview that does not depend on the production reader store.
 *
 * @example
 * <PreviewFragment element={element} />
 */
function PreviewFragment({ element }: { element: PreviewFragment }) {
	const data = element.data as Record<string, unknown>;
	const text =
		typeof data.content === "string"
			? data.content
			: typeof data.text === "string"
				? data.text
				: "";
	const src =
		typeof data.src === "string"
			? data.src
			: typeof data.url === "string"
				? data.url
				: "";

	if (element.type === "image" && src) {
		return (
			<img
				src={src}
				alt={typeof data.alt === "string" ? data.alt : ""}
				className="max-h-[26rem] max-w-full rounded object-contain"
			/>
		);
	}

	if (element.type === "quote") {
		return (
			<blockquote className="max-w-xl text-center font-serif text-2xl leading-relaxed">
				{text}
			</blockquote>
		);
	}

	return (
		<p className="max-w-xl whitespace-pre-wrap text-center text-lg leading-relaxed">
			{text || "No preview text available."}
		</p>
	);
}
