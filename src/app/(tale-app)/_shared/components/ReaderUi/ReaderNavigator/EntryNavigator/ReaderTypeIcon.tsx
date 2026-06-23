import {
	BookA,
	BookImage,
	BookMarked,
	BookOpen,
	Brain,
	CircleHelp,
	Drama,
	FileText,
	Hourglass,
	ListEnd,
	ListStart,
	type LucideIcon,
	Mail,
	Map as MapIcon,
	MoonStar,
	NotepadText,
	Paperclip,
	Quote,
	ScrollText,
	TableOfContents,
} from "lucide-react";
import type { ComponentProps } from "react";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { PageType } from "~/server/db/types/tale-reader/page";

type ReaderNarrativeType = EntryType | PageType;

const readerTypeIcons: Record<ReaderNarrativeType, LucideIcon | null> = {
	appendix: Paperclip,
	book: BookOpen,
	chapter: null,
	codex: BookMarked,
	cover: BookImage,
	custom: FileText,
	dream: MoonStar,
	ending: ListEnd,
	epilogue: ListEnd,
	flashback: Brain,
	illustration: BookImage,
	interlude: Drama,
	letter: Mail,
	map: MapIcon,
	note: NotepadText,
	poem: ScrollText,
	prologue: ListStart,
	quote: Quote,
	table_of_contents: TableOfContents,
	timeline: Hourglass,
	unknown: CircleHelp,
	vocabulary: BookA,
};

/**
 * Renders the shared semantic icon used for entry and page types.
 *
 * @param props - Narrative type and Lucide icon properties.
 * @returns Matching type icon or null for numbered chapters.
 *
 * @example
 * <ReaderTypeIcon type="prologue" size={14} />
 */
export function ReaderTypeIcon({
	type,
	...props
}: {
	type: ReaderNarrativeType | string;
} & ComponentProps<LucideIcon>): React.JSX.Element | null {
	const Icon = readerTypeIcons[type as ReaderNarrativeType] ?? CircleHelp;
	return Icon ? (
		<Icon
			data-reader-component="ReaderTypeIcon"
			data-reader-role="narrative-type-icon"
			{...props}
		/>
	) : null;
}
