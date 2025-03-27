import { Menu, MenuItem } from "../../ui/Menu";
import NavItem from "../../ui/Menu/NavItem";
import { SignedIn } from "@clerk/nextjs";

export default function MainNav() {
	return (
		<Menu asNav>
			<NavItem href="/library">Library</NavItem>
			<NavItem href="/codex">Codex</NavItem>
		</Menu>
	);
}
