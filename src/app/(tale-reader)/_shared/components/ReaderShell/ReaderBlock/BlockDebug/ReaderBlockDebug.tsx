"use client";
import React from "react";
import type { Block } from "~/server/db/data/tale-reader/types/tales";
import ReaderBlockDebugBadges from "./ReaderBlockDebugBadges";
import ReaderBlockDebugPanel from "./ReaderBlockDebugPanel";

type Props = {
	block: Block;
};

function ReaderBlockDebugComponent({ block }: Props) {
	return (
		<>
			<ReaderBlockDebugBadges block={block} />
			<ReaderBlockDebugPanel block={block} />
		</>
	);
}

const ReaderBlockDebug = React.memo(ReaderBlockDebugComponent);
export default ReaderBlockDebug;
