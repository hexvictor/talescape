"use client";

import { Eye } from "lucide-react";
import { ReaderFragment } from "~/app/(tale-reader)/_shared/components/ReaderShell/ReaderFragment";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import type { Fragment } from "~/server/db/data/tale-reader/types/fragments";
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
							<ReaderFragment
								fragment={toReaderFragment(fragment)}
								orientation={fragment.orientation}
							/>
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

function toReaderFragment(fragment: PreviewFragment): Fragment {
	return {
		id: fragment.id,
		taleId: 0,
		blockId: 0,
		creatorId: "",
		type: fragment.type,
		isOfficial: false,
		isVerified: false,
		editable: false,
		index: 0,
		visibility: "public",
		cloneable: "private",
		data: fragment.data,
		createdAt: new Date(),
		updatedAt: null,
		sectionId: 0,
		links: {
			previousFragmentId: null,
			nextFragmentId: null,
			previousFragmentIdInBlock: null,
			nextFragmentIdInBlock: null,
		},
		position: {
			index: 0,
			isFirst: true,
			isLast: true,
			isFirstInBlock: true,
			isLastInBlock: true,
		},
	};
}
