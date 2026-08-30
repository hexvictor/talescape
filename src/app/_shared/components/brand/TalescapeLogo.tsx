import Image from "next/image";
import Link from "next/link";
import cn from "~/lib/utils/cn";

type TalescapeLogoProps = {
	className?: string;
	href?: string;
	markClassName?: string;
	priority?: boolean;
	tone?: "auto" | "dark-surface" | "light-surface";
	variant?: "brand" | "mark" | "wordmark";
	wordmarkClassName?: string;
};

/** Renders a linked Talescape brand mark, wordmark, or both. */
export function TalescapeLogo({
	className,
	href = "/",
	markClassName,
	priority = false,
	tone = "auto",
	variant = "brand",
	wordmarkClassName,
}: TalescapeLogoProps): React.JSX.Element {
	const showMark = variant !== "wordmark";
	const showWordmark = variant !== "mark";

	return (
		<Link
			href={href}
			aria-label="Talescape home"
			className={cn(
				"inline-flex min-h-11 shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--comic-blue)] focus-visible:ring-offset-2",
				className,
			)}
		>
			{showMark ? (
				<Image
					src="/assets/brand/talescape-logo.svg"
					alt=""
					width={888}
					height={1062}
					priority={priority}
					className={cn(
						" h-12 w-auto shrink-0 transition-transform",
						markClassName,
					)}
				/>
			) : null}
			{showWordmark ? (
				<Image
					src="/assets/brand/talescape-wordmark.svg"
					alt=""
					width={1280}
					height={400}
					priority={priority}
					className={cn(
						"h-auto w-28 shrink-0 transition-[filter,transform] sm:w-32",
						tone === "auto" && "brightness-0 dark:brightness-100",
						tone === "light-surface" && "brightness-0",
						wordmarkClassName,
					)}
				/>
			) : null}
		</Link>
	);
}
