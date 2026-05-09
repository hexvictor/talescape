import cn from "~/lib/utils/cn";

type SeparatorProps = {
	className?: string;
	direction?: "vertical" | "horizontal";
};

export default function Separator({
	className,
	direction = "vertical",
}: SeparatorProps) {
	const isVertical = direction === "vertical";

	return (
		<div
			className={cn(
				isVertical ? "h-6 w-px" : "h-px w-full",
				"bg-border",
				className,
			)}
		/>
	);
}
