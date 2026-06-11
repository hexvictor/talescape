"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Anchor, TalePath } from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";
import { positionedStyle } from "./positionedStyle";

export function FixedFragments({
	anchor,
	onChoosePath,
}: {
	anchor: Anchor;
	onChoosePath: (path: TalePath) => void;
}) {
	const [target, setTarget] = useState<Element | null>(null);
	useEffect(() => {
		setTarget(document.querySelector("[data-reader-fixed-layer='true']"));
	}, []);
	if (!target || anchor.block.fixedFragments.length === 0) return null;
	return createPortal(
		anchor.block.fixedFragments.map((fragment, index) => (
			<div
				key={fragment.id}
				data-reader-component="FixedFragments"
				data-reader-fixed-block-id={anchor.block.id}
				data-reader-fragment-id={fragment.id}
				data-reader-role="fixed-fragment-frame"
				className="pointer-events-auto invisible absolute"
				style={positionedStyle(fragment.placement)}
			>
				<ReaderFragment
					fragment={fragment}
					index={index}
					onChoosePath={onChoosePath}
				/>
			</div>
		)),
		target,
	);
}
