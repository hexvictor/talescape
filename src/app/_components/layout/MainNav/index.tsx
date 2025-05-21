import Menu, { NavItem } from "~/components/ui/Menu";
import { SignedIn } from "@clerk/nextjs";

export default function MainNav() {
	return (
		<Menu asNav>
			<NavItem href="/library">Library</NavItem>
			<NavItem href="/codex">Codex</NavItem>
		</Menu>
	);
}
