"use client";
import React from "react";
import TaleBlockDebugPanel from "./TaleBlockDebugPanel";
import TaleBlockDebugBadges from "./TaleBlockDebugBadges";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";

type Props = {
	block: BlockMeta;
};

function TaleBlockDebugComponent({ block }: Props) {
	return (
		<>
			<TaleBlockDebugBadges block={block} />
			<TaleBlockDebugPanel block={block} />
		</>
	);
}

const TaleBlockDebug = React.memo(TaleBlockDebugComponent);
export default TaleBlockDebug;
