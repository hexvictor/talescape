"use client";
import React from "react";
import type { Block } from "~/server/db/data/tale-reader/types/tales";
import TaleBlockDebugBadges from "./TaleBlockDebugBadges";
import TaleBlockDebugPanel from "./TaleBlockDebugPanel";

type Props = {
	block: Block;
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
