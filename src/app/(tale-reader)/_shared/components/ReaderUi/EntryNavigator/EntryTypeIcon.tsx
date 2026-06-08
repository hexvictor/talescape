import {
	BookA,
	BookMarked,
	BookOpen,
	Brain,
	CircleHelp,
	Drama,
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
import type { TaleEntry } from "../../../types";

const entryTypeIcons: Record<TaleEntry["type"], LucideIcon | null> = {
	appendix: Paperclip,
	chapter: null,
	codex: BookMarked,
	cover: BookOpen,
	dream: MoonStar,
	ending: ListEnd,
	epilogue: ListEnd,
	flashback: Brain,
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

export function getEntryTypeLabel(type: TaleEntry["type"]): string {
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function EntryTypeIcon({
	type,
	...props
}: { type: TaleEntry["type"] } & ComponentProps<LucideIcon>) {
	const Icon = entryTypeIcons[type];
	return Icon ? <Icon {...props} /> : null;
}
