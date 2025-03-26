import React from "react";

type DividerProps = {
	direction?: "vertical" | "horizontal";
};

export default function Divider({ direction = "vertical" }: DividerProps) {
	const isVertical = direction === "vertical";

	return (
		<div className={`${isVertical ? "h-6 w-px" : "h-px w-full"} bg-white/30`} />
	);
}
