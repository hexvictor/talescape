import type { HTMLAttributes, ReactNode } from "react";
import AutoHideHeader from "./AutoHideHeader";
import { Divider, Logo, ThemeSwitcher } from "~/components/ui";
import MainNav from "../main-nav";
import { AuthStatusDisplay } from "~/features/auth/components";

type HeaderProps = HTMLAttributes<HTMLElement> & {
  leftProps?: HTMLAttributes<HTMLDivElement>;
  rightProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

export default function Header({
  leftProps,
  rightProps,
  children,
  className = "",
  ...mainProps // ✅ this will carry onClick, onKeyDown, etc.
}: HeaderProps) {
  return (
    <nav
      className={`flex min-h-16 w-full items-center justify-between bg-black px-6 py-2 text-white ${className}`}
      {...mainProps} // ✅ onClick, onKeyDown, etc. now apply to <nav>
    >
      <div
        className="flex items-center gap-4 font-medium text-lg"
        {...leftProps}
      >
        <Logo />
        <Divider />
        <MainNav />
      </div>

      <div className="flex items-center gap-4" {...rightProps}>
        <ThemeSwitcher />
        <AuthStatusDisplay />
      </div>

      {children}
    </nav>
  );
}

export { AutoHideHeader };
