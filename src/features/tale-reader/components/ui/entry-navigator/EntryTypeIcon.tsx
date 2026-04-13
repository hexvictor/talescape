import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import {
	QuoteIcon,
	MailIcon,
	DramaIcon,
	MapIcon,
	TableOfContentsIcon,
	BookAIcon,
	ScrollTextIcon,
	PaperclipIcon,
	BrainIcon,
	BookMarkedIcon,
	HourglassIcon,
	ListEndIcon,
	ListStartIcon,
	MoonStarIcon,
	NotepadTextIcon,
	CircleHelpIcon,
	BookOpenIcon,
} from "lucide-react";

type IconProps = ComponentProps<LucideIcon>;

const ICON_MAP: Record<EntryType, LucideIcon | null> = {
	cover: BookOpenIcon,
	chapter: null,
	prologue: ListStartIcon,
	epilogue: ListEndIcon,
	timeline: HourglassIcon,
	codex: BookMarkedIcon,
	flashback: BrainIcon,
	quote: QuoteIcon,
	dream: MoonStarIcon,
	letter: MailIcon,
	interlude: DramaIcon,
	map: MapIcon,
	table_of_contents: TableOfContentsIcon,
	vocabulary: BookAIcon,
	appendix: PaperclipIcon,
	poem: ScrollTextIcon,
	note: NotepadTextIcon,
	unknown: CircleHelpIcon,
};

type EntryTypeIconProps = {
	type: EntryType;
} & IconProps;

export function getEntryTypeLabel(type: EntryType): string {
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function EntryTypeIconComponent({ type, ...props }: EntryTypeIconProps) {
	const Icon = ICON_MAP[type];
	if (!Icon) return null;
	return <Icon {...props} />;
}
const EntryTypeIcon = memo(EntryTypeIconComponent);
export default EntryTypeIcon;
