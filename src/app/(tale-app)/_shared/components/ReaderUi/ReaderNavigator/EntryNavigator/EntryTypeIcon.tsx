import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { TaleEntry } from "../../../../types";
import { ReaderTypeIcon } from "./ReaderTypeIcon";

export function getEntryTypeLabel(type: TaleEntry["type"]): string {
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function EntryTypeIcon({
	type,
	...props
}: {
	type: TaleEntry["type"];
} & ComponentProps<LucideIcon>): React.JSX.Element | null {
	return <ReaderTypeIcon type={type} {...props} />;
}
