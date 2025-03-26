import Link from "next/link";
import type { ReactNode } from "react";

type MenuItemProps = {
	href: string;
	children: ReactNode;
	isActive?: boolean;
	className?: string;
};

export default function MenuItem({
	href,
	children,
	isActive = false,
	className = "",
}: MenuItemProps) {
	return (
		<li>
			<Link
				href={href}
				className={`text-white transition hover:underline ${
					isActive ? "font-semibold underline" : ""
				} ${className}`}
				aria-current={isActive ? "page" : undefined}
			>
				{children}
			</Link>
		</li>
	);
}
