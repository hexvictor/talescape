"use client";
import { motion } from "motion/react";

type Props = {
	color?: string;
	animationProps?: Parameters<typeof motion.div>[0];
};

export default function LoopAnimatedFragment({
	color = "#3498db",
	animationProps = {},
}: Props) {
	return (
		<motion.div
			{...animationProps}
			className="absolute top-0 mb-4 min-h-[200px] rounded-md p-6 text-white shadow-md"
			style={{ backgroundColor: color }}
		>
			<p className="font-semibold text-lg">Loop Animated Fragment</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
		</motion.div>
	);
}
