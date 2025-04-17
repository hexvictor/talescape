import { Menu, MenuItem } from "../../../../components/ui/Menu";
import NavItem from "../../../../components/ui/Menu/NavItem";
import { SignedIn } from "@clerk/nextjs";

export default function MainNav() {
	return (
		<Menu asNav>
			<NavItem href="/library">Library</NavItem>
			<NavItem href="/codex">Codex</NavItem>
		</Menu>
	);
}
