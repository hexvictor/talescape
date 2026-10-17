"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { resolveReaderScenePaintBounds } from "../../../services/readerScenePaintBounds";
import type { Anchor } from "../../../types";
import { FixedElements } from "./FixedElements";
import { KeyframeActionRuntime } from "./KeyframeActionRuntime";
import { ReaderSceneContent } from "./ReaderSceneContent";
import { getSharedReaderStyle } from "./readerStyleProperties";
import { useScenePointerParallax } from "./useScenePointerParallax";

/**
 * Renders one measured reader scene at its compiled world position.
 *
 * @param props - Compiled anchor and path selection callback.
 * @returns The positioned reader scene.
 *
 * @example
 * <ReaderScene anchor={anchor} />
 */
export function ReaderScene({
	anchor,
	children,
}: {
	anchor: Anchor;
	children?: ReactNode;
}): React.JSX.Element | null {
	const scene = useTaleAppStore(
		(state) => state.document.tale.indexMap.scenesById[anchor.sceneId],
	);
	const [root, setRoot] = useState<HTMLElement | null>(null);
	const pointerEnabled = useTaleAppStore(
		(state) =>
			!!scene?.elementIds.some((id) => {
				const config =
					state.document.tale.indexMap.elementsById[id]?.placement.parallax;
				return config?.enabled && config.source !== "scroll";
			}),
	);
	useScenePointerParallax(root, pointerEnabled);
	if (!scene) return null;
	const paintBounds = resolveReaderScenePaintBounds(anchor);

	return (
		<article
			ref={setRoot}
			data-reader-scene-id={anchor.sceneId}
			data-reader-component="ReaderScene"
			data-reader-role="scene-article"
			className="absolute flex items-center justify-center overflow-visible"
			style={
				{
					...getSharedReaderStyle(scene.articleStyle),
					height: paintBounds.height,
					left: paintBounds.left,
					position: "absolute",
					top: paintBounds.top,
					visibility: "hidden",
					width: paintBounds.width,
					willChange: "transform, opacity, filter",
				} satisfies CSSProperties
			}
		>
			{children}
			<KeyframeActionRuntime root={root} sceneId={anchor.sceneId} />
			<ReaderSceneContent anchor={anchor} />
			<FixedElements anchor={anchor} />
		</article>
	);
}
