"use client";

import { type ComponentType, createContext, useContext } from "react";
import type { Anchor, ResolvedTaleElement } from "../types";

export type TaleRenderSlots = {
	Scene: ComponentType<{ anchor: Anchor }> | null;
	DebugHeaderActions: ComponentType<{ sceneId: string | null }> | null;
	Element: ComponentType<{
		contentSized?: boolean;
		element: ResolvedTaleElement;
		index: number;
	}> | null;
	FrameOverlay: ComponentType<{ sceneId: string; frameId: string }> | null;
	TextElementContent: ComponentType<{
		element: ResolvedTaleElement;
		index: number;
	}> | null;
};

const readerRenderSlots: TaleRenderSlots = {
	Scene: null,
	DebugHeaderActions: null,
	Element: null,
	FrameOverlay: null,
	TextElementContent: null,
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
