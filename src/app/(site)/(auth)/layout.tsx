import { AuthPageLinkHandler } from "~/app/_shared/auth/components";

export default function AuthLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <AuthPageLinkHandler>{children}</AuthPageLinkHandler>;
}
