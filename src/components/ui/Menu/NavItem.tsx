"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItemProps = {
	href: string;
	children: ReactNode;
	className?: string;
};

export default function NavItem({
	href,
	children,
	className = "",
}: NavItemProps) {
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
