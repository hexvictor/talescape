import Link from "next/link";
import type { ReactNode } from "react";

type MenuItemProps = {
	href: string;
	children: ReactNode;
	isActive?: boolean;
	className?: string;
	onClick?: (() => void) | undefined;
};

export default function MenuItem({
	href,
	children,
	className = "",
	onClick,
}: MenuItemProps) {
	return (
		<li className={`${className}`} onClick={onClick} onKeyDown={onClick}>
			{children}
		</li>
	);
}
