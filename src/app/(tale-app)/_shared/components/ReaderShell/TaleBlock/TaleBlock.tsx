"use client";

import { EditorBlock } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor/EditorBlock";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import type { Anchor } from "../../../types";
import { ReaderBlock } from "../ReaderBlock/ReaderBlock";

/**
 * Chooses the reader or editor block shape for the mounted tale application.
 *
 * @param props - Tale block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Reader block, or editor block wrapper when the editor application is active.
 *
 * @example
 * <TaleBlock anchor={anchor} />
 */
export function TaleBlock({ anchor }: { anchor: Anchor }): React.JSX.Element {
	const isEditor = useTaleAppStore((state) => state.derived.isEditor);

	if (isEditor) return <EditorBlock anchor={anchor} />;

	return <ReaderBlock anchor={anchor} />;
}
