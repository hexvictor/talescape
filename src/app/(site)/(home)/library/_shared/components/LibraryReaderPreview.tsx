"use client";

import { Eye } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import type {
	FragmentData,
	FragmentType,
} from "~/server/db/types/tale-reader/fragment";

type PreviewFragment = {
	id: number;
	type: FragmentType;
	data: FragmentData;
	orientation: "vertical" | "horizontal";
};

type LibraryReaderPreviewProps = {
	title: string;
	description: string;
	fragment: PreviewFragment | null;
};

export function LibraryReaderPreview({
	title,
	description,
	fragment,
}: LibraryReaderPreviewProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" size="sm" variant="secondary">
					<Eye aria-hidden="true" />
					View preview
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[min(96vw,64rem)] p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="px-6 pb-6">
					<div className="relative flex min-h-[28rem] items-center justify-center overflow-hidden rounded-md bg-black text-white">
						{fragment ? (
							<PreviewFragment fragment={fragment} />
						) : (
							<p className="max-w-sm text-center text-sm text-white/70">
								This node does not have a readable fragment to preview yet.
							</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Renders a lightweight fragment preview for the library modal.
 *
 * @param props - The preview fragment props.
 * @param props.fragment - The fragment data selected from the library item.
 * @returns A static preview that does not depend on the production reader store.
 *
 * @example
 * <PreviewFragment fragment={fragment} />
 */
function PreviewFragment({ fragment }: { fragment: PreviewFragment }) {
	const data = fragment.data as Record<string, unknown>;
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

	if (fragment.type === "image" && src) {
		return (
			<img
				src={src}
				alt={typeof data.alt === "string" ? data.alt : ""}
				className="max-h-[26rem] max-w-full rounded object-contain"
			/>
		);
	}

	if (fragment.type === "quote") {
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
