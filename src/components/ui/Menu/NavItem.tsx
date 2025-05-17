"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type MenuItemProps = {
	href: string;
	children: ReactNode;
	className?: string;
};

export default function MenuItem({
	href,
	children,
	className = "",
}: MenuItemProps) {
	const pathname = usePathname();
	const isActive = href === pathname;
	return (
		<Link
			href={href}
			className={`text-white transition hover:underline ${
				isActive ? "font-semibold underline" : ""
			} ${className}`}
			aria-current={isActive ? "page" : undefined}
		>
			{children}
		</Link>
	);
}
