"use client";

import { MousePointerClick } from "lucide-react";
import type { HoverAnimationSelection } from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "./AnimationSelectionEditor";

export function HoverAnimationEditor({
	onChange,
	selection,
}: {
	onChange: (selection: HoverAnimationSelection) => void;
	selection: HoverAnimationSelection;
}): React.JSX.Element {
	return (
		<AnimationSelectionEditor
			icon={<MousePointerClick size={15} />}
			selection={selection}
			timingMode="hover"
			title="Hover animations"
			onChange={onChange}
		/>
	);
}
