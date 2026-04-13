import Link from "next/link";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

export default function MainNav() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<Link href="/library" passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Library
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<Link href="/codex" passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Codex
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
