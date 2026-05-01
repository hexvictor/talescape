import type { ReactNode } from "react";

type SiteLayoutProps = Readonly<{
	auth: ReactNode;
	children: ReactNode;
}>;

export default function SiteLayout({ auth, children }: SiteLayoutProps) {
	return (
		<>
			{children}
			{auth}
		</>
	);
}
