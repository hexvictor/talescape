import type { ReactNode } from "react";
import MenuItem from "./MenuItem";
import NavItem from "./NavItem";

type MenuProps = {
	children: ReactNode;
	asNav?: boolean;
	className?: string;
};

export default function Menu({
	children,
	asNav = false,
	className = "",
}: MenuProps) {
	const ul = (
		<ul className={`flex items-center gap-4 ${className}`}>{children}</ul>
	);

	return asNav ? <nav aria-label="Main menu">{ul}</nav> : ul;
}
export { MenuItem, NavItem };
