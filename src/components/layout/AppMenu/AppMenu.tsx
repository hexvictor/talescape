"use client";

import clsx from "clsx";
import { type LucideIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef } from "react";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { AuthStatus } from "~/features/auth/components";
import cn from "~/lib/utils/cn";

export type AppMenuLinkItem = {
	href: string;
	icon: LucideIcon;
	label: string;
};

type AppMenuPlacement =
	| "bottom"
	| "bottom-left"
	| "bottom-right"
	| "left"
	| "right"
	| "top"
	| "top-left"
	| "top-right";

type AppMenuProps = {
	buttonClassName?: string;
	children?: ReactNode;
	childrenPlacement?: "after" | "before";
	className?: string;
	"data-reader-role"?: string;
	expandedIcon?: ReactNode;
	collapsedIcon?: ReactNode;
	menuItems?: AppMenuLinkItem[];
	menuOpen: boolean;
	onMenuOpenChange: (open: boolean) => void;
	showFooterActions?: boolean;
	showLogo?: boolean;
	menuPlacement?: AppMenuPlacement;
};

/**
 * Renders a controlled site menu with navigation links and optional account
 * controls.
 *
 * @param props - Menu state, trigger icon, links, and visual options.
 * @param props.buttonClassName - Optional class names for the trigger button.
 * @param props.children - Optional custom content rendered inside the menu panel.
 * @param props.childrenPlacement - Whether custom content renders before or after nav links.
 * @param props.className - Optional class names for the root wrapper.
 * @param props.expandedIcon - Icon shown while the menu is open.
 * @param props.collapsedIcon - Icon shown while the menu is closed.
 * @param props.menuItems - Navigation links shown inside the menu.
 * @param props.menuOpen - Whether the menu panel is visible.
 * @param props.onMenuOpenChange - Receives menu open state changes.
 * @param props.showFooterActions - Whether theme and auth controls are shown.
 * @param props.showLogo - Whether the menu shows the Talescape logo.
 * @returns App menu trigger and panel.
 *
 * @example
 * <AppMenu collapsedIcon={<Menu />} menuItems={items} menuOpen={open} onMenuOpenChange={setOpen} />
 */
export default function AppMenu({
	buttonClassName,
	children,
	childrenPlacement = "after",
	className,
	"data-reader-role": dataReaderRole = "app-menu",
	expandedIcon = <X size={18} />,
	collapsedIcon = <Menu size={18} />,
	menuItems,
	menuOpen,
	onMenuOpenChange,
	showFooterActions = true,
	showLogo = true,
	menuPlacement = "bottom-right",
}: AppMenuProps): React.JSX.Element {
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!menuOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (!rootRef.current?.contains(event.target as Node)) {
				onMenuOpenChange(false);
			}
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [menuOpen, onMenuOpenChange]);

	return (
		<div
			ref={rootRef}
			data-reader-component="AppMenu"
			data-reader-role={dataReaderRole}
			className={cn("relative", className)}
		>
			<button
				type="button"
				aria-label={menuOpen ? "Close site menu" : "Open site menu"}
				aria-expanded={menuOpen}
				className={clsx(buttonClassName)}
				onClick={() => onMenuOpenChange(!menuOpen)}
			>
				{menuOpen ? expandedIcon : collapsedIcon}
			</button>
			{menuOpen ? (
				<AppMenuPanel
					childrenPlacement={childrenPlacement}
					menuItems={menuItems}
					showFooterActions={showFooterActions}
					showLogo={showLogo}
					menuPlacement={menuPlacement}
				>
					{children}
				</AppMenuPanel>
			) : null}
		</div>
	);
}

/**
 * Renders the app menu panel contents.
 *
 * @param props - Panel content options.
 * @param props.children - Optional custom panel content.
 * @param props.childrenPlacement - Whether custom content renders before or after nav links.
 * @param props.menuItems - Navigation links shown in the menu.
 * @param props.showFooterActions - Whether theme and auth controls are shown.
 * @param props.showLogo - Whether the menu shows the Talescape logo.
 * @returns App menu panel.
 *
 * @example
 * <AppMenuPanel menuItems={items} showFooterActions showLogo />
 */
function AppMenuPanel({
	children,
	childrenPlacement,
	menuItems,
	showFooterActions,
	showLogo,
	menuPlacement = "bottom-right",
}: {
	children?: ReactNode;
	childrenPlacement: "after" | "before";
	menuItems?: AppMenuLinkItem[];
	showFooterActions: boolean;
	showLogo: boolean;
	menuPlacement?: AppMenuPlacement;
}): React.JSX.Element {
	const hasMenuItems = (menuItems?.length ?? 0) > 0;
	return (
		<div
			className={clsx(
				"absolute rounded-lg border border-foreground/12 bg-background/96 p-3 text-foreground shadow-2xl backdrop-blur-xl",
				getMenuPlacementClassName(menuPlacement),
			)}
		>
			{showLogo ? <AppMenuBrand /> : null}
			{childrenPlacement === "before" ? children : null}
			{hasMenuItems ? (
				<nav className="grid gap-1">
					{menuItems?.map((item) => (
						<AppMenuLink
							key={item.href}
							href={item.href}
							icon={item.icon}
							label={item.label}
						/>
					))}
				</nav>
			) : null}
			{childrenPlacement === "after" ? children : null}
			{showFooterActions ? <AppMenuFooterActions /> : null}
		</div>
	);
}

/**
 * Renders the app menu brand row.
 *
 * @returns Menu brand row.
 *
 * @example
 * <AppMenuBrand />
 */
function AppMenuBrand(): React.JSX.Element {
	return (
		<div className="mb-3 flex items-center gap-3">
			<Logo />
		</div>
	);
}

/**
 * Renders theme and account controls inside the app menu.
 *
 * @returns Menu footer actions.
 *
 * @example
 * <AppMenuFooterActions />
 */
function AppMenuFooterActions(): React.JSX.Element {
	return (
		<div className="mt-3 flex items-center justify-between gap-3 border-foreground/10 border-t pt-3">
			<ThemeToggle />
			<AuthStatus />
		</div>
	);
}

/**
 * Returns panel positioning classes for a menu placement.
 *
 * @param placement - Desired menu position relative to the trigger.
 * @returns Tailwind class names that position the menu panel.
 *
 * @example
 * const className = getMenuPlacementClassName("bottom-left");
 */
function getMenuPlacementClassName(placement: AppMenuPlacement): string {
	if (placement === "bottom-left") return "top-full right-0 mt-2";
	if (placement === "bottom-right") return "top-full left-0 mt-2";
	if (placement === "top-left") return "right-0 bottom-full mb-2";
	if (placement === "top-right") return "bottom-full left-0 mb-2";
	if (placement === "top") return "-translate-x-1/2 bottom-full left-1/2 mb-2";
	if (placement === "bottom") return "-translate-x-1/2 top-full left-1/2 mt-2";
	if (placement === "left") return "top-0 right-full mr-2";
	return "top-0 left-full ml-2";
}

/**
 * Renders one menu navigation link.
 *
 * @param props - Link label, icon, destination, and optional custom content.
 * @param props.children - Optional replacement content for the link body.
 * @param props.className - Optional class names for the link.
 * @param props.href - Destination URL.
 * @param props.icon - Lucide icon component.
 * @param props.label - Visible link label.
 * @returns Menu link.
 *
 * @example
 * <AppMenuLink href="/library" icon={BookOpen} label="Library" />
 */
function AppMenuLink({
	href,
	icon: Icon,
	label,
	className,
	children,
}: {
	href: string;
	icon: LucideIcon;
	label: string;
	className?: string;
	children?: ReactNode;
}): React.JSX.Element {
	return (
		<Link
			href={href}
			className={clsx(
				"flex h-10 items-center gap-3 rounded border border-transparent px-2 text-foreground/72 text-sm hover:border-foreground/10 hover:bg-foreground/7 hover:text-foreground",
				className,
			)}
		>
			{children ? (
				children
			) : (
				<>
					<Icon size={16} />
					{label}
				</>
			)}
		</Link>
	);
}

/**
 * Renders one menu row as either a button action or a layout wrapper.
 *
 * @param props - Action content and behavior.
 * @param props.children - Visible action content.
 * @param props.className - Optional class names for the menu row.
 * @param props.hover - Whether hover chrome is enabled.
 * @param props.onClick - Optional action callback. When omitted, the row renders as a non-button wrapper.
 * @returns Menu action button or wrapper row.
 *
 * @example
 * <AppMenuItem onClick={openSettings}>Settings</AppMenuItem>
 *
 * @example
 * <AppMenuItem hover={false}><ThemeToggle /></AppMenuItem>
 */
export function AppMenuItem({
	children,
	className,
	onClick,
	hover = true,
}: {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	hover?: boolean;
}): React.JSX.Element {
	const menuItemClassName = clsx(
		"flex h-10 items-center gap-3 px-2 text-left text-foreground/72 text-sm",
		hover
			? "rounded border border-transparent hover:border-foreground/10 hover:bg-foreground/7 hover:text-foreground"
			: "",
		className,
	);

	if (!onClick) {
		return <div className={menuItemClassName}>{children}</div>;
	}

	return (
		<button type="button" onClick={onClick} className={menuItemClassName}>
			{children}
		</button>
	);
}
