"use client";

import { type ComponentType, createContext, useContext } from "react";
import type { Anchor, ResolvedTaleFragment } from "../types";

export type TaleRenderSlots = {
	Block: ComponentType<{ anchor: Anchor }> | null;
	DebugHeaderActions: ComponentType<{ blockId: string | null }> | null;
	Fragment: ComponentType<{
		contentSized?: boolean;
		fragment: ResolvedTaleFragment;
		index: number;
	}> | null;
	NodeOverlay: ComponentType<{ blockId: string; nodeId: string }> | null;
	TextFragmentContent: ComponentType<{
		fragment: ResolvedTaleFragment;
		index: number;
	}> | null;
};

const readerRenderSlots: TaleRenderSlots = {
	Block: null,
	DebugHeaderActions: null,
	Fragment: null,
	NodeOverlay: null,
	TextFragmentContent: null,
};

/**
 * Holds optional application renderers used by the shared tale UI.
 *
 * Tale Reader uses the null defaults. Tale Studio replaces the slots with
 * inspection and editing renderers without introducing Studio dependencies
 * into shared components.
 */
export const TaleRenderContext =
	createContext<TaleRenderSlots>(readerRenderSlots);

/**
 * Reads the render slots configured by the active tale application.
 *
 * @returns Active render slots, with null defaults outside a provider.
 */
export function useTaleRenderSlots(): TaleRenderSlots {
	return useContext(TaleRenderContext);
}
